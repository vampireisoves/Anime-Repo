# Anip在线观影 (Anime-Repo)

一个纯前端、零依赖的 HLS 番剧/影视在线播放站。通过 JSON 数据文件管理番剧与剧集信息，基于 [ArtPlayer](https://artplayer.org) + [hls.js](https://github.com/video-dev/hls.js) 直接播放 `.m3u8` 流媒体，可部署到任意静态托管平台（Cloudflare Pages、GitHub Pages、Vercel 等）即可使用。

> 线上演示：https://anip.883994.xyz/ （Cloudflare Pages）

---

## 目录结构

```
Anime-Repo/
├── index.html            # 部署版（JS 已混淆，浏览器直接加载）
├── index.src.html        # 权威可读源码（所有功能迭代在此修改；被 .gitignore 忽略，不部署）
├── index.json            # 剧集清单（全量条目，按 uptime 降序展示）
├── episodes/             # 每部番剧/影视的集数与播放地址
│   └── <ID>.json         # 如 tt0944947.json、anime-59193.json
├── static/
│   ├── artplayer.min.js  # ArtPlayer 播放器（本地化，无外部 CDN 依赖）
│   ├── hls.min.js        # hls.js 播放内核（本地化）
│   └── favicon.ico/.png  # 站点图标
├── README.md
└── .gitignore            # 忽略 index.src.html 等源码
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
- **关键字搜索**：按名称实时过滤
- **滚轮完整列表**：不使用分页，滚动浏览全部条目

### 播放器
- **ArtPlayer 内核**：主题色 `#2563eb`，默认音量 100%，支持播放倍速、画中画、截图、镜像翻转、画面比例等
- **HLS 流媒体**：hls.js 直接播放 `.m3u8`，支持自适应缓存
- **积极缓存**：一次性缓存整个视频（`maxBufferLength` 无上限），未播放时长始终充足
- **快捷键**：`←` / `→` 快退 / 快进 5 秒
- **自动连播**：当前集播放结束自动播放下一集
- **页面全屏**：在当前浏览器窗口内最大化播放器（非系统全屏）
- **断点续播**：点击播放历史自动跳转到上次播放位置
- **移动端吸顶**：播放时向下滑动页面，播放器固定顶部不随滚动（≤1100px）
- **播放列表折叠**：移动端默认只显示 8 集，可一键「展开全部 / 收起」

### 播放历史
- 自动记录播放进度（剧集 + 时间点）
- 作为「剧集列表」分类栏首个标签展示（在"最近更新"之前）
- 支持单条删除与全部清空（二次确认）
- 数据存于浏览器 `localStorage`

### 外观
- **亮色 / 暗色模式**：自动适配系统 `prefers-color-scheme`
- **动态背景**：按当前播放项目的 `posterColor` 渐变取色过渡
- **现代化 UI**：顶部导航、得意黑字体、自定义滚动条、噪点纹理、CSS 变量主题

---

## 开发工作流

> 所有功能迭代统一修改 **`index.src.html`**（可读、可维护），完成后混淆生成部署版 `index.html`。

```bash
# 1. 修改 index.src.html
# 2. 混淆生成 index.html（保留 index.src.html 源码）
node obfuscate.js
# 3. 部署 index.html、index.json、episodes/、static/ 到静态托管
```

- `index.src.html` 被 `.gitignore` 忽略，不会误提交
- 混淆产物 `index.html` 是浏览器实际加载的文件

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
| 流媒体 | hls.js（本地化） |
| 数据 | JSON（`index.json` + `episodes/*.json`） |
| 存储 | localStorage / sessionStorage |
| 混淆 | javascript-obfuscator |
| 托管 | Cloudflare Pages |

---

## 说明

- 仅提供播放器与数据管理能力，播放源为外部 `.m3u8` 链接，其可用性与内容由源站负责
