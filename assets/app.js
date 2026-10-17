// 甄数演示站：分页、中英切换、示例报告、在浏览器里体检。
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => Number(n).toLocaleString('en-US');

  // ---------- 文案：中文写在页面里，英文在这里 ----------
  const EN = {
    'brand.sub': 'Demo data check-up',
    'nav.overview': 'Two-minute tour', 'nav.examples': 'Electrical examples', 'nav.check': 'Check my data',
    'nav.method': 'Method and results', 'nav.about': 'About',
    'side.foot1': 'Demo prototype · public data only', 'side.foot2': 'Yunchuang Cup entry, AI + embodied track',
    'crumb.root': 'Assay', 'pill.local': 'Your data stays on your computer',
    'engine.idle': 'Engine starting', 'engine.loading': 'Engine loading', 'engine.ready': 'Engine ready', 'engine.error': 'Engine failed',
    'ov.eyebrow': 'Two-minute tour',
    'ov.h1': 'Assay checks every recorded teleoperation episode: pass, review or reject, with the reason and the time span',
    'ov.lead': 'Embodied AI models learn from large numbers of teleoperated demonstrations. Bad episodes in the training set drag the policy down, and checking every one by hand costs as much as recording grows. Assay screens first; people only review the doubtful ones.',
    'ov.block.unit': 'episodes',
    'ov.block.text': '30 public datasets checked in 8.5 minutes on a laptop CPU; 18 of them are electrical and industrial manipulation such as plugs, switches and valves.',
    'ov.census.h': 'Census result', 'lab.pass': 'Pass', 'lab.doubt': 'Review', 'lab.reject': 'Reject',
    'ov.census.note': 'All 69 rejections are episodes shorter than one second, which the joint data alone confirms; the doubtful ones go to a person. Three datasets also turned out to have repeated episode indices in their metadata.',
    'ov.s1.t': 'Beijing Humanoid QA labels: regrasp episodes detected among those comparable', 'ov.s1.s': 'Parameters set on other data, not tuned on this batch',
    'ov.s2.t': 'robomimic human demonstrations: flagged episodes that came from the least skilled operators', 'ov.s2.s': 'Only 3 of the 200 episodes by the best operators were flagged',
    'ov.s3.t': 'Normal RoboVAD episodes rejected', 'ov.s3.s': 'The price is misses: 140 of 387 anomalous episodes passed',
    'ov.scene.h': 'First deployment: robots doing hands-on work in electrical facilities',
    'ov.scene.p': 'Switch rooms are already trialling remote teleoperation for switching, with a person confirming every key step; this work produces demonstrations every day. Assay starts with plugging, switching, valves and buttons in switch rooms and substations.',
    'ov.cta1': 'Check my data', 'ov.cta2': 'See 7 electrical examples',
    'ov.foot': 'Every number comes from offline evaluation on public data; the project has no customers or pilots yet. Details under Method and results.',
    'ex.eyebrow': 'Electrical examples', 'ex.h1': '7 public electrical and industrial manipulation datasets, with Assay\'s report ready to read',
    'ex.lead': 'All are public LeRobot datasets on Hugging Face, checked with the joint rules only and untuned parameters. Pick one to open the full report below.',
    'ex.dl': 'Download report',
    'ck.eyebrow': 'Check my data', 'ck.h1': 'Drop your data here: Assay checks it in your browser, nothing is uploaded',
    'ck.lead': 'Accepts a LeRobot v3 dataset as a zip (meta/ and data/, videos not needed) and robomimic or RoboMIND HDF5 files. Joint rules only; the video judges need a GPU and are not part of this page.',
    'ck.drop.b': 'Drop a zip or HDF5 file, or click to choose', 'ck.drop.s': 'Up to 100 MB; processed only inside this page and gone when you close it',
    'ck.sample': 'Try the sample (cube stacking, 56 episodes)',
    'ck.privacy': '<b>Your data stays on your computer.</b> Assay and its runtime live in this page. The first visit downloads about 26 MB; the browser caches it afterwards.',
    'ck.engine.h': 'Engine', 'st.0': 'Load the runtime', 'st.1': 'Load numpy, pyarrow, h5py', 'st.2': 'Install Assay and warm up',
    'st.3': 'Read the data', 'st.4': 'Check every episode', 'st.5': 'Write the report',
    'rs.n': 'episodes', 'rs.doubt': 'Review: a person looks', 'rs.reject': 'Reject: evidence written down',
    'rs.causes': 'Problems (episodes)', 'rs.more': 'This batch', 'rs.dlh': 'Download report (HTML)', 'rs.dlj': 'Download details (JSON)',
    'rs.report': 'Assay report', 'rs.offline': 'Opens offline',
    'me.eyebrow': 'Method and results', 'me.h1': 'Evaluation first, rules second: thresholds set on dev data only, every rate with its denominator',
    'me.l1.h': 'Objective hard rules', 'me.l1.p': 'Missing readings, timestamps going back, episodes too short: one hit rejects',
    'me.l2.h': 'Joint rules against the same task', 'me.l2.p': 'Long pause, empty recording, unfinished, extra motion, regrasp, unsmooth motion; compared with the batch of the same task, no fixed thresholds',
    'me.l3.h': 'Zero-shot video judges', 'me.l3.p': 'Robometer-4B and TOPReward look for wrong task and dropped objects; they need a GPU and do not run in this page',
    'me.l4.h': 'Conservative fusion', 'me.l4.p': 'Reject only on a hard rule, or when 2 of 3 independent sources point at the same problem; other findings mean review',
    'me.d.h': 'robomimic: share flagged by Assay, by operator skill', 'me.c.h': 'Beijing Humanoid QA labels (RoboMIND)',
    'me.d.foot': '100 human episodes per level (300 each for Square and Can). Every episode completes the task; the difference is motion quality, so Assay can only say review. Untuned, first run.',
    'me.c.foot': 'Regrasp parameters were set on RoboVAD, not tuned on RoboMIND. Three common smoothness metrics did no better than chance on these labels and are not used.',
    'me.lim.h': 'What we cannot claim yet',
    'me.lim.1': 'Not yet tested: whether policies trained on Assay-filtered data do better. A downstream experiment on robomimic is ready and will report before the semi-final.',
    'me.lim.2': 'The 1,690 doubtful episodes in the census have no labels and have not been spot-checked.',
    'me.lim.3': 'Video models raise false alarms: neatly stacked cubes and occluding arms fool them.',
    'me.lim.4': 'Motion quality is only partly covered: unsmooth motion is detected in 14% of Beijing Humanoid\'s labels.',
    'me.lim.5': 'We have no demonstrations from electrical facilities yet, and found no public dataset of electrical manipulation in the field.',
    'me.src': 'Evaluation records and reproduction commands are in the repository: ',
    'ab.eyebrow': 'About', 'ab.h1': 'Origo, a team of four master\'s students at TU Berlin',
    'ab.what.h': 'What this is',
    'ab.what.p': 'Assay is automatic quality control for teleoperated robot demonstrations, open source under Apache-2.0. This page is a demo prototype: Assay\'s Python code runs in your browser through Pyodide, the same code as the command line tool.',
    'ab.lic.h': 'Licenses and sources', 'ab.lic.1': 'Assay and this page: Apache-2.0',
    'ab.lic.2': 'Pyodide runtime: MPL-2.0; numpy, pandas, h5py: BSD; pyarrow: Apache-2.0',
    'ab.lic.3': 'Sample data lerobot/svla_so100_stacking: Apache-2.0',
    'ab.lic.4': 'The 7 example reports are generated from public Hugging Face datasets under Apache-2.0 or MIT; the page holds the reports, not the raw data',
    'ab.contact': 'Questions and suggestions: ',
  };
  const ZH = {
    'engine.loading': '引擎载入中', 'engine.ready': '引擎已就绪', 'engine.error': '引擎载入失败',
  };
  let lang = 'zh';
  try { lang = localStorage.getItem('assay-lang') || (navigator.language.startsWith('zh') ? 'zh' : 'en'); } catch (_) { /* 隐私模式 */ }
  const t = (k) => (lang === 'en' ? EN[k] : (ZH[k] || ($(`[data-i="${k}"]`) || {}).dataset?.zh)) || k;

  function applyLang() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    $$('[data-i]').forEach((el) => {
      if (el.dataset.zh === undefined) el.dataset.zh = el.innerHTML;
      const v = lang === 'en' ? EN[el.dataset.i] : el.dataset.zh;
      if (v !== undefined) el.innerHTML = v;
    });
    $('#lang-btn').textContent = lang === 'en' ? '中文' : 'EN';
    setCrumb();
    setEngine(engine.state);
    renderExamples();
    if (lastResult) showResult(lastResult, false);
    drawCharts();
  }
  $('#lang-btn').addEventListener('click', () => {
    lang = lang === 'en' ? 'zh' : 'en';
    try { localStorage.setItem('assay-lang', lang); } catch (_) { /* 隐私模式 */ }
    applyLang();
    if (currentExample) openExample(currentExample);
  });

  // ---------- 分页 ----------
  const PAGES = ['overview', 'examples', 'check', 'method', 'about'];
  function page() { const h = location.hash.slice(1); return PAGES.includes(h) ? h : 'overview'; }
  function setCrumb() {
    const a = $(`.nav a[data-page="${page()}"] span`);
    $('#crumb-page').textContent = a ? a.textContent : '';
  }
  function route() {
    const p = page();
    $$('.page').forEach((s) => s.classList.toggle('on', s.id === 'page-' + p));
    $$('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.page === p));
    setCrumb();
    window.scrollTo(0, 0);
    if (p === 'overview') countUp();
    if (p === 'examples' && !currentExample && examples.length) openExample(examples[0].id);
  }
  window.addEventListener('hashchange', route);

  function countUp() {
    $$('[data-count]').forEach((el) => {
      const end = +el.dataset.count; const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 900);
        el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // 报告本身跟着系统深浅色走；嵌进页面的这份固定用浅色
  const light = (html) => html.replace('@media (prefers-color-scheme:dark)', '@media (max-width:0px)');

  // ---------- 示例 ----------
  let examples = []; let currentExample = null;
  function bar(p, d, r) {
    return `<div class="bar" title="${fmt(p)} / ${fmt(d)} / ${fmt(r)}"><span class="p" style="flex-grow:${p}"></span>` +
      `<span class="d" style="flex-grow:${d}"></span>${r ? `<span class="r" style="flex-grow:${r}"></span>` : ''}</div>`;
  }
  function renderExamples() {
    const box = $('#ex-list');
    if (!examples.length) { box.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>'; return; }
    box.innerHTML = examples.map((e) => `
      <button class="ex${e.id === currentExample ? ' on' : ''}" data-id="${e.id}">
        <div class="row" style="justify-content:space-between"><b>${lang === 'en' ? e.en : e.zh}</b><span class="tag info">${e.robot}</span></div>
        <div class="meta">${e.repo}</div>
        <div class="n num">${fmt(e.n)} <small style="font-size:13px;font-weight:400;color:var(--muted)">${lang === 'en' ? 'episodes' : '条'}</small></div>
        ${bar(e.pass, e.doubt, e.reject)}
        <div class="legend"><span><i style="background:var(--pass)"></i>${fmt(e.pass)}</span><span><i style="background:var(--doubt)"></i>${fmt(e.doubt)}</span><span><i style="background:var(--reject)"></i>${fmt(e.reject)}</span></div>
      </button>`).join('');
    $$('.ex', box).forEach((b) => b.addEventListener('click', () => openExample(b.dataset.id)));
  }
  async function openExample(id) {
    currentExample = id;
    const e = examples.find((x) => x.id === id);
    $$('.ex').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
    $('#ex-title').textContent = `${lang === 'en' ? e.en : e.zh} · ${e.repo} · ${e.license}`;
    const url = `examples/${id}.${lang}.html`;
    $('#ex-dl').href = url;
    $('#ex-frame').srcdoc = '';
    const html = await (await fetch(url)).text();
    if (currentExample === id) $('#ex-frame').srcdoc = light(html);
  }
  fetch('examples/examples.json').then((r) => r.json()).then((j) => { examples = j; renderExamples(); if (page() === 'examples') openExample(j[0].id); });

  // ---------- 图表 ----------
  function hbars(rows) {
    return rows.map(([label, k, n, hot]) => {
      const pct = Math.round((100 * k) / n);
      return `<div class="hb"><span>${label}</span><div class="track"><div class="fill${hot ? ' hot' : ''}" data-w="${(100 * k) / n}"></div></div><span class="v">${fmt(k)}/${fmt(n)} = ${pct}%</span></div>`;
    }).join('');
  }
  function drawCharts() {
    const en = lang === 'en';
    $('#chart-d').innerHTML = hbars([
      [en ? 'Square · better' : 'Square · 水平好', 2, 100], [en ? 'Square · okay' : 'Square · 水平中', 10, 100], [en ? 'Square · worse' : 'Square · 水平差', 33, 100, 1],
      [en ? 'Can · better' : 'Can · 水平好', 1, 100], [en ? 'Can · okay' : 'Can · 水平中', 3, 100], [en ? 'Can · worse' : 'Can · 水平差', 44, 100, 1],
    ]);
    $('#chart-c').innerHTML = hbars([
      [en ? 'Regrasp: detected' : '二次抓取：检出', 99, 162, 1], [en ? 'Other causes flagged' : '其他原因被报出', 72, 1085],
      [en ? 'Unsmooth: detected' : '动作不流畅：检出', 26, 187], [en ? 'Other causes flagged' : '其他原因被报出', 18, 458],
    ]);
    setTimeout(() => $$('.fill').forEach((f) => { f.style.width = f.dataset.w + '%'; }), 30);
  }

  // ---------- 引擎 ----------
  const engine = { state: 'loading', worker: null, ready: false, queue: null, t: {} };
  function setEngine(state, pct) {
    engine.state = state;
    const pill = $('#engine-pill');
    pill.className = 'pill ' + ({ loading: 'loading', ready: 'ready', error: 'err' }[state] || '');
    $('#engine-text').textContent = t('engine.' + state) + (state === 'loading' && pct !== undefined ? ` ${pct}%` : '');
  }
  function stepUI(i, s, extra) {
    const el = $(`.step[data-step="${i}"]`);
    if (!el) return;
    if (s === 'start') { el.className = 'step doing'; engine.t[i] = performance.now(); el.querySelector('.tm').textContent = ''; }
    if (s === 'done') {
      el.className = 'step done';
      el.querySelector('.tm').textContent = ((performance.now() - engine.t[i]) / 1000).toFixed(1) + ' s' + (extra || '');
    }
    if (s === 'reset') { el.className = 'step'; el.querySelector('.tm').textContent = ''; }
  }
  function progress(p, text) { $('#prog').style.width = p + '%'; $('#prog-text').textContent = text || ''; }
  function showError(msg) {
    msg = String(msg || (lang === 'en' ? 'unknown error' : '未知错误'));
    const map = {
      TOO_BIG: lang === 'en' ? 'The archive is larger than 400 MB once unpacked.' : '压缩包解开以后超过 400 MB，网页里放不下，请用命令行版。',
      BAD_PATH: lang === 'en' ? 'The archive contains a path that leaves its folder; refused.' : '压缩包里有跳出目录的路径，已拒绝。',
      NOT_FOUND: lang === 'en' ? 'No LeRobot v3 dataset (meta/info.json) or HDF5 file found.' : '没找到 LeRobot v3 数据（meta/info.json）或 HDF5 文件。',
    };
    const key = Object.keys(map).find((k) => msg.includes(k));
    $('#err').style.display = 'block';
    $('#err').textContent = key ? map[key] : (lang === 'en' ? 'Assay could not finish: ' : '甄数没能跑完：') + msg;
  }
  function boot() {
    try { engine.worker = new Worker('assets/worker.js?v=20261018', { type: 'module' }); } catch (e) { setEngine('error'); showError(String(e)); return; }
    setEngine('loading', 0);
    engine.worker.onerror = (ev) => { setEngine('error'); showError(ev.message || 'worker'); busy(false); };
    engine.worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'stage') {
        stepUI(m.i, m.s, m.info ? ` · ${fmt(m.info.n)}${lang === 'en' ? ' episodes' : ' 条'}` : '');
        if (m.i <= 2) {
          const pct = Math.round(((m.i + (m.s === 'done' ? 1 : 0.3)) / 3) * 100);
          setEngine('loading', pct); progress(pct * 0.5);
        } else {
          progress(50 + ((m.i - 3 + (m.s === 'done' ? 1 : 0.3)) / 3) * 50);
        }
      } else if (m.type === 'ready') {
        engine.ready = true; setEngine('ready'); progress(0, '');
        $('#sample-btn').disabled = false;
        if (engine.queue) { const q = engine.queue; engine.queue = null; run(q.name, q.buf); }
      } else if (m.type === 'result') {
        progress(100);
        lastResult = JSON.parse(m.out); showResult(lastResult, true);
        busy(false);
      } else if (m.type === 'error') {
        if (!engine.ready) setEngine('error');
        showError(m.message); busy(false);
      }
    };
  }
  function busy(on) { $('#sample-btn').disabled = on; $('#drop').style.pointerEvents = on ? 'none' : ''; }
  function run(name, buf) {
    $('#err').style.display = 'none';
    [3, 4, 5].forEach((i) => stepUI(i, 'reset'));
    $('#result').style.display = 'none';
    busy(true);
    if (!engine.ready) { engine.queue = { name, buf }; progress(5, lang === 'en' ? 'Waiting for the engine…' : '等引擎就绪……'); return; }
    engine.worker.postMessage({ cmd: 'run', name, buf, lang }, [buf]);
  }

  // ---------- 结果 ----------
  let lastResult = null;
  function animate(el, end) {
    el.textContent = fmt(end);  // 先写最终数字：页面没在绘制时动画不跑，数字也对
    const t0 = performance.now();
    const tick = (now) => { const k = Math.min(1, (now - t0) / 700); el.textContent = fmt(Math.round(end * k)); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function showResult(r, fresh) {
    const s = r.summary; const en = lang === 'en';
    $('#result').style.display = 'block';
    [['#r-n', s.n], ['#r-p', s.pass], ['#r-d', s.doubt], ['#r-r', s.reject]].forEach(([id, v]) => (fresh ? animate($(id), v) : ($(id).textContent = fmt(v))));
    const top = s.causes.slice(0, 6); const max = Math.max(1, ...top.map((c) => c[2]));
    $('#r-causes').innerHTML = top.length ? top.map(([zh, e, k]) =>
      `<div class="hb"><span>${en ? e : zh}</span><div class="track"><div class="fill" data-w="${(100 * k) / max}"></div></div><span class="v">${fmt(k)}</span></div>`).join('')
      : `<p style="margin:0;color:var(--muted)">${en ? 'No problems found.' : '没有发现问题。'}</p>`;
    setTimeout(() => $$('#r-causes .fill').forEach((f) => { f.style.width = f.dataset.w + '%'; }), 30);
    const fails = s.failures.map(([n, zh, e]) => `<li>${n}${en ? ': ' : '：'}${en ? e : zh}</li>`).join('');
    const colon = en ? ': ' : '：';
    $('#r-meta').innerHTML = `<div><b>${s.name}</b></div><div>${en ? 'Tasks' : '任务数'}${colon}${fmt(s.tasks)}</div>` +
      `<div>${en ? 'Not checked' : '没检查的'}${colon}${fmt(s.n_failures)}${s.n_failures ? (en ? ' (problems in the data itself, reported as found)' : '（数据本身的问题，照实报出）') : ''}</div>` +
      (fails ? `<ul class="plain" style="margin-top:6px;font-size:12px">${fails}</ul>` : '');
    const blob = (txt, type) => URL.createObjectURL(new Blob([txt], { type }));
    $('#dl-html').href = blob(r.html, 'text/html'); $('#dl-json').href = blob(JSON.stringify(r.rows, null, 1), 'application/json');
    $('#r-frame').srcdoc = light(r.html);
    if (fresh) $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- 拖放和样例 ----------
  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (ev) => { const f = ev.dataTransfer.files[0]; if (f) take(f); });
  $('#file').addEventListener('change', (ev) => { const f = ev.target.files[0]; if (f) take(f); ev.target.value = ''; });
  async function take(f) {
    if (!/\.(zip|hdf5|h5)$/i.test(f.name)) { showError(lang === 'en' ? 'Only .zip, .hdf5 or .h5' : '只收 .zip、.hdf5 或 .h5'); return; }
    if (f.size > 100e6) { showError(lang === 'en' ? 'Larger than 100 MB; please use the command line tool.' : '超过 100 MB，请用命令行版。'); return; }
    run(f.name, await f.arrayBuffer());
  }
  $('#sample-btn').addEventListener('click', async () => {
    busy(true);
    const buf = await (await fetch('samples/svla_so100_stacking.zip')).arrayBuffer();
    run('svla_so100_stacking.zip', buf);
  });

  applyLang();
  route();
  boot();
})();
