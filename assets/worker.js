// 甄数引擎：在模块 Worker 里用 Pyodide（新版 Pyodide 不支持旧式 Worker） 跑甄数的 Python 代码（和命令行版同一份），页面不卡。
import { loadPyodide } from '../pyodide/pyodide.mjs';

const post = (m) => self.postMessage(m);
let py = null;

const PRELUDE = `
import sys, json, zipfile, shutil, time
from pathlib import Path
from dataclasses import asdict
sys.modules['av'] = None  # 读视频的库；关节体检用不到，Pyodide 里也没有
from assay.ingest import load
from assay.diagnose import diagnose_batch, Label
from assay.report import render
from assay.types import CAUSE_EN, en
import numpy, pyarrow, pyarrow.parquet, h5py  # 预热：第一次导入最慢，先在后台做掉

def _warm():
    # 第一次读 parquet 和 HDF5 要做一次初始化（实测十几秒），放在访客点按钮之前做掉
    t = pyarrow.table({"episode_index": [0, 0], "x": [1.0, 2.0]})
    pyarrow.parquet.write_table(t, "/tmp/_warm.parquet")
    pyarrow.parquet.read_table("/tmp/_warm.parquet")
    with h5py.File("/tmp/_warm.h5", "w") as f:
        f["x"] = numpy.zeros(4)
    with h5py.File("/tmp/_warm.h5", "r") as f:
        f["x"][()]
_warm()

MAX_BYTES = 400_000_000
STATE = {}

def _extract(src, dest):
    dest = Path(dest).resolve()
    with zipfile.ZipFile(src) as z:
        members = z.infolist()
        if sum(m.file_size for m in members) > MAX_BYTES:
            raise ValueError("TOO_BIG")
        for m in members:
            t = (dest / m.filename).resolve()
            if t != dest and dest not in t.parents:
                raise ValueError("BAD_PATH")
        z.extractall(dest)
    return dest

def _root(folder):
    folder = Path(folder)
    info = sorted(folder.rglob("meta/info.json"), key=lambda p: len(p.parts))
    if info:
        return info[0].parent.parent
    h5 = sorted([*folder.rglob("*.hdf5"), *folder.rglob("*.h5")], key=lambda p: len(p.parts))
    if h5:
        return h5[0]
    raise ValueError("NOT_FOUND")

def step_read(name):
    work = Path("/work")
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir()
    src = Path("/upload") / name
    root = _root(_extract(src, work / "data")) if name.lower().endswith(".zip") else src
    res = load(root)
    STATE.clear()
    STATE.update(res=res, name=root.stem if root.is_file() else root.name)
    return json.dumps({"n": len(res.episodes), "failures": len(res.failures)})

def step_check():
    STATE["v"] = diagnose_batch(STATE["res"].episodes, {})
    return "ok"

def step_render(lang):
    res, verdicts = STATE["res"], STATE["v"]
    html = render(verdicts, res.episodes, title=STATE["name"], judges=[], failures=res.failures,
                  generated=time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime()), shots=None, summary=None, lang=lang)
    tasks = {ep.id: ep.task for ep in res.episodes}
    rows = [{"episode_id": v.episode_id, "task": tasks[v.episode_id], "label": v.label.value,
             "reasons": v.reasons, "reasons_en": [en(x) for x in v.reasons],
             "findings": [{**asdict(f), "cause": f.cause.value, "evidence_en": en(f.evidence)} for f in v.causes]}
            for v in verdicts]
    causes = {}
    for v in verdicts:
        if v.label != Label.PASS:
            for c in {f.cause for f in v.causes}:
                causes[c] = causes.get(c, 0) + 1
    summary = {"n": len(res.episodes), "pass": sum(v.label == Label.PASS for v in verdicts),
               "doubt": sum(v.label == Label.DOUBT for v in verdicts), "reject": sum(v.label == Label.REJECT for v in verdicts),
               "causes": [[c.value, CAUSE_EN[c], k] for c, k in sorted(causes.items(), key=lambda x: -x[1])],
               "failures": [[n, w, en(w)] for n, w in res.failures][:20], "n_failures": len(res.failures),
               "tasks": len(set(tasks.values())), "name": STATE["name"]}
    shutil.rmtree("/work", ignore_errors=True)
    return json.dumps({"html": html, "rows": rows, "summary": summary}, ensure_ascii=False)
`;

async function boot() {
  try {
    post({ type: 'stage', i: 0, s: 'start' });
    py = await loadPyodide({ indexURL: new URL('../pyodide/', self.location.href).href });
    post({ type: 'stage', i: 0, s: 'done' });
    post({ type: 'stage', i: 1, s: 'start' });
    await py.loadPackage(['numpy', 'pyarrow', 'h5py', 'micropip']);
    post({ type: 'stage', i: 1, s: 'done' });
    post({ type: 'stage', i: 2, s: 'start' });
    py.globals.set('WHEEL', new URL('../wheels/assay-0.1.0-py3-none-any.whl', self.location.href).href);
    await py.runPythonAsync('import micropip\nawait micropip.install(WHEEL, deps=False)');
    py.runPython(PRELUDE);
    post({ type: 'stage', i: 2, s: 'done' });
    post({ type: 'ready' });
  } catch (e) {
    post({ type: 'error', message: 'boot: ' + String(e && e.message || e).slice(-600) });
  }
}

self.onmessage = async (e) => {
  const { cmd, name, buf, lang } = e.data;
  if (cmd !== 'run' || !py) return;
  const safe = name.replace(/[^\w.\-]/g, '_');
  try {
    py.FS.mkdirTree('/upload');
    py.FS.writeFile('/upload/' + safe, new Uint8Array(buf));
    post({ type: 'stage', i: 3, s: 'start' });
    const info = JSON.parse(py.runPython(`step_read(${JSON.stringify(safe)})`));
    post({ type: 'stage', i: 3, s: 'done', info });
    post({ type: 'stage', i: 4, s: 'start' });
    py.runPython('step_check()');
    post({ type: 'stage', i: 4, s: 'done' });
    post({ type: 'stage', i: 5, s: 'start' });
    const out = py.runPython(`step_render(${JSON.stringify(lang)})`);
    post({ type: 'stage', i: 5, s: 'done' });
    post({ type: 'result', out });
  } catch (err) {
    const msg = String(err && err.message || err).trim().split('\n').pop();
    post({ type: 'error', message: msg });
  } finally {
    try { py.FS.unlink('/upload/' + safe); } catch (_) { /* 文件可能没写进去 */ }
  }
};

boot();
