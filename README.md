# 番剧在线播放器 (Anime-Repo)

一个纯前端、零依赖的 HLS 番剧在线播放器。通过 JSON 数据文件管理番剧与剧集信息，基于 [hls.js](https://github.com/video-dev/hls.js) 直接播放 `.m3u8` 流媒体，可部署到任意静态托管平台（GitHub Pages、Gitee Pages、Vercel 等）即可使用。

## ✨ 功能特性

- **HLS 在线播放**：基于 hls.js 播放 `.m3u8` 视频流，支持 `enableWorker` 多线程解码、低延迟模式可配
- **原生回退**：在支持原生 HLS 的浏览器（如 Safari）中自动回退到 `<video>` 原生播放
- **剧集列表**：首页从 `index.json` 加载仓库内全部番剧，卡片式点击切换，支持按「电影 / 剧集 / 动漫」分类与关键词实时筛选
- **URL 直达**：通过 `?json=<路径>` 参数直接加载指定番剧 JSON，便于分享与收藏
- **剧集分页**：右侧剧集列表每页展示 6 集，支持翻页浏览
- **快捷键切集**：`←` 上一集 / `→` 下一集，无需鼠标操作
- **播放进度记忆**：通过 `localStorage` 自动记录每部番剧上次观看的集数，刷新后自动续播
- **恢复播放**：页面从后台切回时自动恢复 HLS 加载（`visibilitychange` 监听）
- **深色主题**：简洁的暗色 UI，聚焦观看体验

## 📁 项目结构

```
Anime-Repo/
├── index.html            # 单页播放器（HTML + CSS + 业务逻辑）
├── index.json            # 番剧清单索引（仓库内全部番剧）
├── episodes/             # 番剧剧集数据目录
│   ├── 模板.json         # 剧集 JSON 数据格式模板
│   ├── tt13293588.json   # 示例：无职转生 Part.1（24 集）
│   └── tt15553038.json   # 示例：无职转生 Part.2（12 集）
└── static/
    └── hls.min.js        # hls.js 库（已本地化，离线可用）
```

## 🛠 技术栈

| 组件 | 说明 |
| --- | --- |
| HTML / CSS | 原生，单文件实现，无框架 |
| JavaScript | 原生 ES6，无构建工具、无 npm 依赖 |
| [hls.js](https://github.com/video-dev/hls.js) | HLS 流媒体播放核心，已本地化为 `static/hls.min.js` |
| 数据格式 | JSON（番剧索引 + 剧集列表） |

## 🚀 快速开始

### 本地预览

由于页面使用相对路径请求 `/index.json` 与 `/static/hls.min.js`，建议通过本地静态服务器访问：

```bash
# 方式一：Python
python -m http.server 8080

# 方式二：Node.js（需全局安装 serve）
npx serve -l 8080

# 方式三：VS Code 的 Live Server 插件
```

然后浏览器打开 `http://localhost:8080`。

### 部署到 GitHub Pages

1. 将仓库推送到 GitHub
2. 进入仓库 **Settings → Pages**，将部署源选择为 `main` 分支的根目录
3. 访问 `https://<用户名>.github.io/Anime-Repo/` 即可

> 如需部署到子路径（如 `https://<用户名>.github.io/Anime-Repo/`），页面内资源请求均以仓库根为基准的绝对路径编写，可直接工作。

## 📄 数据格式说明

### 番剧清单 `index.json`

数组结构，每项包含番剧标题与对应的剧集数据文件路径：

```json
[
  {
    "title": "无职转生：到了异世界就拿出真本事 (2021)",
    "type": "动漫",
    "jsonFile": "episodes/tt13293588.json"
  },
  {
    "title": "无职转生：到了异世界就拿出真本事 Part.2 第2クール (2021)",
    "type": "动漫",
    "jsonFile": "episodes/tt15553038.json"
  }
]
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 番剧显示名称 |
| `type` | string | 分类：`电影` / `剧集` / `动漫`（缺省时按动漫处理） |
| `jsonFile` | string | 剧集数据 JSON 的仓库相对路径 |

### 剧集数据 `episodes/*.json`

包含番剧标题与剧集数组，每集由标题和 `.m3u8` 流地址组成（格式参考 `episodes/模板.json`）：

```json
{
  "title": "番剧名称",
  "type": "动漫",
  "episodes": [
    { "title": "第01集", "src": "https://example.com/xxx/index.m3u8" },
    { "title": "第02集", "src": "https://example.com/xxx/index.m3u8" }
  ]
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 番剧名称（页面顶部展示） |
| `type` | string | 分类：`电影` / `剧集` / `动漫`，与清单索引保持一致 |
| `episodes` | array | 剧集列表，按数组顺序播放 |
| `episodes[].title` | string | 集数标题（如"第01集"） |
| `episodes[].src` | string | 该集 HLS 播放地址（`.m3u8`） |

## ➕ 如何添加新番剧

1. 在 `episodes/` 目录下新建 JSON 文件（建议以番剧标识命名，如 `tt12345678.json`），按上方模板填入标题与各集 `.m3u8` 地址
2. 在 `index.json` 数组中追加一项，写入番剧标题、分类 `type`（`电影` / `剧集` / `动漫`）与 `jsonFile` 路径
3. 提交并推送，刷新页面即可在"仓库全部番剧列表"中看到并播放

## 🎮 使用说明

- **URL 参数**：`?json=episodes/tt13293588.json` 可直达指定番剧，适合跨设备分享（播放进度记忆的 key 即该参数）
- **切换番剧**：页面底部"仓库全部番剧列表"点击任意卡片
- **快捷键**：`←` 上一集、`→` 下一集
- **进度记忆**：每部番剧的观看进度自动保存在浏览器 `localStorage`，再次打开自动定位到上次观看集数

## 🌐 浏览器兼容性

| 浏览器 | 播放方式 |
| --- | --- |
| Chrome / Edge / Firefox | hls.js（Web Worker 多线程） |
| Safari / iOS Safari | 原生 HLS 支持，自动回退 |

> 若 `static/hls.min.js` 未加载，页面会提示"hls.js 库加载失败"，请确认静态资源路径正确。

## ⚠️ 免责声明

本项目仅提供技术实现与番剧**索引管理**能力，所有 `.m3u8` 视频流地址均来源于第三方公开资源，与仓库作者无关。请确保你仅通过本项目播放已获授权的内容，并遵守所在地区的法律法规与版权规定。如涉及版权问题，请联系相关资源方处理。

## 📜 License

本项目仅供学习与技术交流使用，未指定开源许可证。使用前请知悉上述免责声明。
