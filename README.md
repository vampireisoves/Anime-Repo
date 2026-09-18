# Anip-Online (Anime-Repo)

一个纯前端 HLS 番剧/影视在线播放站：通过 JSON 数据文件管理番剧与剧集信息，基于 [ArtPlayer](https://artplayer.org) + [hls.js](https://github.com/video-dev/hls.js) 直接播放 `.m3u8` 流媒体。纯静态站点，可直接部署到 GitHub Pages / Cloudflare Pages / Vercel 等任意静态托管平台。

---

## 目录结构

```
Anime-Repo/
├── index.html            # 部署版（JS 已混淆，浏览器直接加载）
├── index.src.html        # 权威可读源码（所有功能迭代在此修改）
├── index.json            # 剧集清单（全量条目，按 uptime 降序展示）
├── episodes/             # 每部番剧/影视的集数与播放地址
│   └── <ID>.json         # 如 tt0944947.json、anime-59193.json
├── static/
│   ├── artplayer.min.js  # ArtPlayer 播放器（本地化，无外部 CDN 依赖）
│   ├── hls.min.js        # hls.js 播放内核（本地化）
│   └── favicon.ico/.png  # 站点图标
├── build/
│   ├── obfuscate.js      # 混淆脚本（index.src.html → index.html）
│   └── package.json      # javascript-obfuscator 依赖
└── build.bat             # 一键：安装依赖（如缺）→ 混淆生成 index.html
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
- **分类筛选**：播放历史 / 最近更新 / 全部 / 电影 / 剧集 / 动漫 / 综艺 / 短剧 / 体育，标签直接显示各分类真实数量（页首无标题文字）
- **最近更新**：展示 uptime 最新的前 35 部
- **全部无限滚动**：「全部」分类滚动到底自动追加加载（每次 +35 条）
- **关键字搜索**：搜索框位于分类标签栏最右侧（随标签栏吸顶不滑出视线），按名称实时过滤（200ms 防抖），右侧 ✕ 一键清空
- **封面懒加载**：海报图 `loading="lazy"`，加载失败自动隐藏占位，首屏更快、流量更省
- **列表本地缓存**：`index.json` 缓存 6 小时（localStorage），二次打开秒开；右下角刷新按钮可强制拉取最新
- **分类栏吸顶**：滚动列表时分类标签固定在顶部
- **滚轮完整列表**：不使用分页，滚动浏览全部条目
- **悬浮刷新**：右下角圆形按钮，一键重新拉取 `index.json` 刷新列表
- **移动端适配**：卡片自适应列宽；播放列表移动端默认折叠为 8 集

### 播放器
- **悬浮播放**：点击任意项目后，播放器 + 播放列表以悬浮窗弹出（桌面端居中可拖动，位置记忆；移动端全屏），关闭后销毁播放器、下方剧集列表不受影响
- **ArtPlayer 内核**：主题色 `#2563eb`，默认音量 100%，支持播放倍速、画中画、截图、镜像翻转、画面比例等
- **HLS 流媒体**：hls.js 直接播放 `.m3u8`
- **积极缓存**：一次性缓存整个视频（`maxBufferLength` 无上限），未播放时长始终充足
- **稳定音频**：`enableWorker:false`（分片解析回主线程）+ hls.js 最新版，规避 MSE 拼接爆音
- **快捷键**：`←` / `→` 快退 / 快进 5 秒，`↑` / `↓` 切换上 / 下一集，`Space` 播放 / 暂停，`Esc` 关闭播放器
- **跳过片头/片尾**：播放器控制条右侧「跳片头」（快进 80 秒）/「跳片尾」（跳至结尾前 60 秒），偏移量可在 `index.src.html` 的 `SKIP_OP` / `SKIP_ED` 常量调整
- **播放记忆**：自动记住音量与播放倍速，下次打开沿用
- **自动连播**：当前集播放结束自动播放下一集
- **页面全屏**：在当前浏览器窗口内最大化播放器（非系统全屏）
- **断点续播**：点击播放历史自动跳转到上次播放位置
- **移动端全屏**：悬浮窗在移动端自动全屏适配（≤900px）
- **播放列表折叠**：移动端默认只显示 8 集，可一键「展开全部 / 收起」

### 播放历史
- 自动记录播放进度（剧集 + 时间点），作为「剧集列表」分类栏首个标签展示
- 支持单条删除与全部清空（二次确认）
- 存储：浏览器 `localStorage`（随浏览器携带）

### 外观
- **亮色 / 暗色模式**：自动适配系统 `prefers-color-scheme`
- **动态背景**：按当前播放项目的 `posterColor` 渐变取色过渡
- **现代化 UI**：得意黑字体、自定义滚动条、噪点纹理、CSS 变量主题（无顶部导航，界面更清爽）

### 访问控制
- 打开站点需输入访问密码（多密码支持），密码不写入仓库，仅存在于混淆后的部署文件中

---

## 开发工作流

> 所有功能迭代统一修改 **`index.src.html`**（可读、可维护），完成后混淆生成部署版 `index.html`。

```bash
# 1. 修改 index.src.html（源码）
# 2. 运行一键混淆：build.bat（或 node build/obfuscate.js）
# 3. 提交 index.html、index.json、episodes/、static/ 并推送
```

- `build.bat`：自动安装混淆依赖（首次）→ 混淆生成 `index.html`
- `index.src.html` 是源码，混淆产物 `index.html` 是浏览器实际加载的文件

---

## 部署到 GitHub Pages

### 前提
- 仓库已推送到 GitHub（`index.html`、`index.json`、`episodes/`、`static/` 必须包含）
- 页面内资源全部使用**相对路径**，可直接部署到项目站点子路径（`https://<user>.github.io/<repo>/`）

### 开启步骤
1. 推送代码：`git add -A && git commit -m "Update" && git push origin main`
2. GitHub 仓库 → **Settings** → **Pages**
3. **Build and deployment** → Source 选 `Deploy from a branch`
4. Branch 选 `main`，目录选 `/ (root)` → **Save**
5. 等待 1-2 分钟，访问 `https://<user>.github.io/<repo>/`

### 其他平台
Cloudflare Pages / Vercel / Netlify / Gitee Pages 等任意静态托管均可：构建命令留空、输出目录留空，直接部署根目录。

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
| 存储 | 浏览器 localStorage |
| 混淆 | javascript-obfuscator |
| 托管 | GitHub Pages / Cloudflare Pages |

---

## 说明

- 仅提供播放器与数据管理能力，播放源为外部 `.m3u8` 链接，其可用性与内容由源站负责
