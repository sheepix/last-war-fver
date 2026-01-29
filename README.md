# fver 专用攻略站（Cloudflare Pages）

《Last War: Survival》（最后的战争）手游攻略站：多篇攻略 + 多语言版本（简体 / 繁体 / 英文 / 越南语），自动生成目录并一键部署到 Cloudflare Pages。

## 攻略库 / AI 咨询

小羊收集的攻略库（NotebookLM）：`https://notebooklm.google.com/notebook/001aafd2-2771-4207-808b-3356ff08cbab`  
读者可以在这里咨询 AI 关于游戏的问题。

## 域名 / 访问入口

- 生产站点（自定义域名）：`https://fver.sheepx.fun/`
- Pages 默认域名：`https://lw-sheepx-fun.pages.dev/`

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
- 本地调试：`npm run dev`（打开 `http://127.0.0.1:8788`）
- 部署更新：`./deploy-pages.sh`

## 内容更新与最后修改时间

每篇文章在内容修改后，请同步更新其“最后修改时间”（写在文章顶部），用于读者判断信息是否过期。

## 翻译语言（需保持同步）

当前需要维护的语言：
- `zh-Hans`（简体）
- `zh-Hant`（繁体）
- `en`（English）
- `vi`（Tiếng Việt）

## 翻译说明

除中文外的语言版本（繁体 / 英文 / 越南语）均**翻译自中文版本**。如发现差异或歧义，请以中文版为准并优先修正中文源文档。

中文版（默认入口）：
- `https://fver.sheepx.fun/last-war-canyon-storm-battlefield-beginner-guide/`
- `https://fver.sheepx.fun/last-war-canyon-storm-battlefield-cheatsheet/`
- `https://fver.sheepx.fun/last-war-s4-tanks-4-plus-1-adam-mixed-lineup/`

## 术语表（对齐游戏名词）

用于统一文档用词，避免同一技能/概念多种写法：

- 工程师技能：**攻城战旗**（旧称/曾用写法：攻城旌旗）
- 战场技能（全阵营通用）：**战地医院**（旧称/曾用写法：野战医院）
- 战场技能（破晓联盟阵营专属）：**炮塔**（旧称/曾用写法：火炮塔）
- 战场技能（秩序先锋阵营专属）：**地震塔**
- 战场技能（秩序先锋阵营专属 / 裁决者官职）：**裁决降临**（旧称/曾用写法：裁决者）
- 战场建筑（常见）：**病毒实验室**、**供电塔**、**数据中心 I**、**样本仓库 I**、**防爆系统 I**、**血清工厂 I**
- 阵营：**破晓联盟（Dawnbreakers）**、**秩序先锋（Rulebringers）**

新增语言时需要：
1) 新增 `content/<lang>/guide.md` 与 `content/<lang>/lazy.md`
2) 更新 `scripts/build.mjs` 里的 `LANGS`

## 兼容入口

根目录的 `canyon-storm-battlefield-guide.md` / `canyon-storm-battlefield-guide-lazy-pack.md` 为占位提示，方便旧链接/书签迁移；实际内容在 `content/<语言>/`。
