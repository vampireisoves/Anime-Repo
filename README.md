# Anip在线观影 (Anime-Repo)

一个纯前端 HLS 番剧/影视在线播放站：通过 JSON 数据文件管理番剧与剧集信息，基于 [ArtPlayer](https://artplayer.org) + [hls.js](https://github.com/video-dev/hls.js) 直接播放 `.m3u8` 流媒体。**Web 版**可部署到任意静态托管平台（Cloudflare Pages、GitHub Pages、Vercel 等），另提供 **Electron 桌面便携版**（松散目录，启动本地 HTTP 服务播放）。

---

## 目录结构

```
Anime-Repo/
├── index.html            # 部署版（JS 已混淆，浏览器直接加载）
├── index.src.html        # 权威可读源码（所有功能迭代在此修改，被 .gitignore 忽略）
├── index.json            # 剧集清单（全量条目，按 uptime 降序展示）
├── episodes/             # 每部番剧/影视的集数与播放地址
│   └── <ID>.json         # 如 tt0944947.json、anime-59193.json
├── static/
│   ├── artplayer.min.js  # ArtPlayer 播放器（本地化，无外部 CDN 依赖）
│   ├── hls.min.js        # hls.js 播放内核（本地化）
│   └── favicon.ico/.png  # 站点图标
├── electron/             # 桌面便携版工程（node_modules/dist/web 被忽略）
│   ├── main.js           # Electron 主进程（本地 HTTP 服务 + 随机端口 + 历史/缓存管理）
│   ├── preload.js        # 向页面注入桌面端标记（window.__anip_desktop__）
│   ├── package.json      # electron-builder 配置（松散目录 win-unpacked）
│   ├── build.bat         # 一键：同步 web 数据 → 打包 → 初始化 data/
│   └── dist/             # 打包产物（win-unpacked/Anip在线观影.exe）
```

### 桌面版运行目录（便携式，全部位于 exe 所在目录）

```
Anip在线观影.exe
├── data/                 # 站点数据（index.html/index.json/static/episodes）
├── history/              # 播放历史（history.json）
├── cache/                # 联网缓存（Chromium 网络缓存，每 24 小时清理）
└── resources/app/        # 程序本体（main.js / web/）
```

---

## 数据格式

### `index.json` — 全量清单（数组）

```json
[
  {
    "title": "权力的游戏 第一季 (2011)",
    "type": "剧集",
    "jsonFile": "episodes/tt0944947.json",
    "poster": "https://.../poster.jpg",
    "posterColor": "#1a2b4a",
    "uptime": "2026-09-16 23:04:58",
    "opyear": "2011"
  }
]
```

| 字段 | 说明 |
|---|---|
| `title` | 显示名称（建议带年份，如 `无职转生Ⅲ (2026)`） |
| `type` | 分类：`电影` / `剧集` / `动漫` / `综艺` / `短剧` / `体育`（缺失时按 `动漫` 处理） |
| `jsonFile` | 对应 `episodes/` 下的数据文件路径 |
| `poster` | 海报图 URL（可选，用于卡片背景与动态取色） |
| `posterColor` | 海报主题色（可选，动态背景取色） |
| `uptime` | 更新时间 `YYYY-MM-DD HH:mm:ss`，剧集列表按此降序 |
| `opyear` | 上映年份（无 `uptime` 时兜底排序） |

### `episodes/<ID>.json` — 单部剧集数据

```json
{
  "title": "权力的游戏 第一季",
  "type": "剧集",
  "episodes": [
    { "title": "第01集", "src": "https://.../index.m3u8" },
    { "title": "第02集", "src": "https://.../index.m3u8" }
  ]
}
```

---

## 功能特性

### 剧集列表（仓库）
- **uptime 降序**：统一按 `index.json` 的 `uptime` 字段降序展示（缺失时用 `opyear` 兜底）
- **卡片格式**：名称（第一行 14.5px）+ 更新时间（第二行 12.5px）
- **分类筛选**：播放历史 / 最近更新 / 全部 / 电影 / 剧集 / 动漫 / 综艺 / 短剧 / 体育
- **最近更新**：展示 uptime 最新的前 12 部
- **关键字搜索**：搜索框位于「剧集列表」标题右侧，按名称实时过滤
- **滚轮完整列表**：不使用分页，滚动浏览全部条目
- **悬浮刷新**：右下角圆形按钮，一键重新拉取 `index.json` 刷新列表
- **移动端适配**：卡片自适应列宽；播放列表移动端默认折叠为 8 集

### 播放器
- **默认隐藏**：打开页面不显示播放器，点击任意项目播放时才展示
- **ArtPlayer 内核**：主题色 `#2563eb`，默认音量 100%，支持播放倍速、画中画、截图、镜像翻转、画面比例等
- **HLS 流媒体**：hls.js 直接播放 `.m3u8`
- **积极缓存**：一次性缓存整个视频（`maxBufferLength` 无上限），未播放时长始终充足
- **稳定音频**：`enableWorker:false`（分片解析回主线程）+ hls.js 最新版，规避 MSE 拼接爆音
- **快捷键**：`←` / `→` 快退 / 快进 5 秒
- **自动连播**：当前集播放结束自动播放下一集
- **页面全屏**：在当前浏览器窗口内最大化播放器（非系统全屏）
- **断点续播**：点击播放历史自动跳转到上次播放位置
- **移动端吸顶**：播放时向下滑动页面，播放器固定顶部不随滚动（≤1100px）
- **播放列表折叠**：移动端默认只显示 8 集，可一键「展开全部 / 收起」

### 播放历史
- 自动记录播放进度（剧集 + 时间点），作为「剧集列表」分类栏首个标签展示
- 支持单条删除与全部清空（二次确认）
- 存储：Web 版存浏览器 `localStorage`；桌面版存程序目录 `history/history.json`（随程序携带）

### 外观
- **亮色 / 暗色模式**：自动适配系统 `prefers-color-scheme`
- **动态背景**：按当前播放项目的 `posterColor` 渐变取色过渡
- **现代化 UI**：得意黑字体、自定义滚动条、噪点纹理、CSS 变量主题（无顶部导航，界面更清爽）

---

## 开发工作流

> 所有功能迭代统一修改 **`index.src.html`**（可读、可维护），完成后混淆生成部署版 `index.html`。

```bash
# 1. 修改 index.src.html（源码）
# 2. 混淆生成 index.html（部署版）——由 javascript-obfuscator 处理
# 3. 部署 index.html、index.json、episodes/、static/ 到静态托管
```

- `index.src.html` 源码被 `.gitignore` 忽略，不会误提交
- 混淆产物 `index.html` 是浏览器实际加载的文件
- 桌面版同理：改完源码 → 混淆 → 重跑 `electron/build.bat`

---

## 桌面版（Electron 便携版）

`electron/` 提供免安装桌面版，与 Web 版同一套数据与界面：

- **启动方式**：先启动本地 HTTP 服务（`127.0.0.1` + 随机未使用端口），窗口再加载该服务——无文件协议限制，m3u8 / JSON 资源请求完全正常
- **松散文件**：`asar:false`，数据与页面以松散文件存放，可直接查看或替换
- **便携数据布局**：站点数据 `data/`、播放历史 `history/`、联网缓存 `cache/` 全部位于 exe 所在目录，可整体拷贝迁移
- **缓存治理**：Chromium 网络缓存统一落入 `cache/`，程序每 24 小时自动清理一次
- **一键打包**：`build.bat` 自动同步仓库最新 web 数据 → 补依赖 → 打包为 `dist/win-unpacked/Anip在线观影.exe`（松散目录版，不生成单文件）→ 初始化 `data/`（已存在则同步程序文件、保留数据）

### 版本清单（当前全部为最新）

| 组件 | 版本 |
|---|---|
| electron | 44.4.2 |
| electron-builder | 26.15.3 |
| hls.js | 1.7.3 |
| ArtPlayer | 5.4.0 |

---

## 部署

### Cloudflare Pages
1. 将仓库推送到 GitHub（`index.html`、`index.json`、`episodes/`、`static/` 必须包含）
2. Cloudflare Pages 新建项目，连接仓库
3. 构建命令留空，输出目录留空（静态站点直接部署根目录）

### 其他平台
GitHub Pages / Gitee Pages / Vercel / Netlify 等任意静态托管均可，无需后端。

---

## 新增番剧 / 影视

按以下格式投喂即可自动入库（写入 `episodes/<ID>.json` 并追加 `index.json`）：

```
标题 (年份)
分类          # 电影/剧集/动漫/综艺/短剧/体育，可省略（默认动漫）
ID           # 如 tt0944947、anime-59193
https://.../index.m3u8   # 每集一个链接，按顺序
```

---

## 技术栈

| 模块 | 技术 |
|---|---|
| 播放器 | ArtPlayer 5.4.0（本地化） |
| 流媒体 | hls.js 1.7.3（本地化） |
| 数据 | JSON（`index.json` + `episodes/*.json`） |
| 存储 | Web：localStorage；桌面版：history/ JSON 文件 |
| 桌面版 | Electron 44.4.2 + electron-builder 26.15.3 |
| 混淆 | javascript-obfuscator |
| 托管 | Cloudflare Pages |

---

## 说明

- 仅提供播放器与数据管理能力，播放源为外部 `.m3u8` 链接，其可用性与内容由源站负责
- 桌面版与 Web 版共用同一份数据格式与播放逻辑；桌面版额外提供文件级历史记录与缓存治理
