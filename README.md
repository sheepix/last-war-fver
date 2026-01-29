# fver 专用攻略站（Cloudflare Pages）

两篇攻略（完整版 / 懒人包）+ 多语言版本（简体 / 繁体 / 英文 / 越南语），自动生成目录并一键部署到 Cloudflare Pages。

## 攻略库 / AI 咨询

小羊收集的攻略库（NotebookLM）：`https://notebooklm.google.com/notebook/001aafd2-2771-4207-808b-3356ff08cbab`  
读者可以在这里咨询 AI 关于游戏的问题。

## 目录结构

- `content/`：文章源文件（只改这里）
  - `content/zh-Hans/`：简体
  - `content/zh-Hant/`：繁体
  - `content/en/`：English
  - `content/vi/`：Tiếng Việt
- `scripts/build.mjs`：把 Markdown 生成静态站点到 `dist/`
- `deploy-pages.sh`：一键构建并部署到 Cloudflare Pages

## 常用命令

- 本地生成：`npm run build`
- 部署更新：`./deploy-pages.sh`

## 翻译语言（需保持同步）

当前需要维护的语言：
- `zh-Hans`（简体）
- `zh-Hant`（繁体）
- `en`（English）
- `vi`（Tiếng Việt）

新增语言时需要：
1) 新增 `content/<lang>/guide.md` 与 `content/<lang>/lazy.md`
2) 更新 `scripts/build.mjs` 里的 `LANGS`

## 兼容入口

根目录的 `canyon-storm-battlefield-guide.md` / `canyon-storm-battlefield-guide-lazy-pack.md` 为占位提示，方便旧链接/书签迁移；实际内容在 `content/<语言>/`。

