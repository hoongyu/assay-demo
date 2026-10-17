[English](README.md) | 简体中文

# 甄数演示站

**https://hoongyu.github.io/assay-demo/**

[甄数（Assay）](https://github.com/hoongyu/assay)的浏览器演示。甄数做机器人遥操作示范数据的自动质检。拖入 LeRobot v3 数据集（打成 zip）或 robomimic、RoboMIND 的 HDF5 文件，每条示范判成合格、存疑、作废，写清原因和出问题的时间段，报告可以下载。

- 甄数自己的 Python 代码通过 [Pyodide](https://pyodide.org/) 在你浏览器的 Web Worker 里运行，数据不上传到任何地方。
- Pyodide 运行环境（v314.0.7）和甄数要用的包（numpy、pyarrow、h5py 及其依赖）都放在本仓库里，网页不依赖第三方 CDN。第一次打开要下载约 26 MB。
- 网页里只跑关节规则；零样本视频评判要显卡，在主仓库里。
- 附 7 份公开的电气和工业操作数据集的示例报告，以及 1 份小样例数据，用来试在线体检。

本地运行：在本目录执行 `python -m http.server 8765`，打开 http://localhost:8765/ 。

授权：网页和甄数为 Apache-2.0（`LICENSE`）；第三方运行环境、包和数据见 `THIRD_PARTY.md`。
