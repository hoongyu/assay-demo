English | [简体中文](README.zh-CN.md)

# Assay demo

**https://hoongyu.github.io/assay-demo/**

A browser demo of [Assay](https://github.com/hoongyu/assay), automatic quality control for teleoperated robot demonstrations. Drop a LeRobot v3 dataset (as a zip) or a robomimic / RoboMIND HDF5 file: every episode is marked pass, review or reject, with the reason and the time span, and you can download the report.

- Assay's own Python code runs in your browser through [Pyodide](https://pyodide.org/) in a Web Worker. Your data is not uploaded anywhere.
- The Pyodide runtime (v314.0.7) and the packages Assay needs (numpy, pyarrow, h5py and their dependencies) are hosted in this repository, so the page does not depend on a third-party CDN. The first visit downloads about 26 MB.
- Only the joint-signal rules run here; the zero-shot video judges need a GPU and live in the main repository.
- Seven example reports on public electrical and industrial manipulation datasets are included, plus one small sample dataset to try the live check.

## Layout

```
index.html            the page
assets/               app.js (UI), worker.js (Assay engine), app.css
wheels/               the Assay wheel built from github.com/hoongyu/assay
pyodide/              self-hosted Pyodide runtime and packages (MPL-2.0 and others, see THIRD_PARTY.md)
examples/             7 pre-built reports (HTML) and their per-episode results (JSON)
samples/              lerobot/svla_so100_stacking, meta and joint data only (Apache-2.0)
```

To run it locally: `python -m http.server 8765` in this folder, then open http://localhost:8765/.

## Licenses

The page and Assay: Apache-2.0 (`LICENSE`). Third-party runtime, packages and data: `THIRD_PARTY.md`.
