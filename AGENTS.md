# Agent Notes (lw)

## Repo purpose
This repo builds and deploys a small Cloudflare Pages site for **fver 专用攻略站**.

## Content layout
- Source articles live in `content/<lang>/`.
- Build output is generated into `dist/` by `scripts/build.mjs`.
- Deploy via `./deploy-pages.sh`.

## Translation languages (must keep in sync)
When the Chinese source is updated, update translations for these languages too:
- `zh-Hans` (简体)
- `zh-Hant` (繁体)
- `en` (English)
- `vi` (Tiếng Việt)

If you add a new language, update `scripts/build.mjs` (`LANGS`) and add the matching:
- `content/<lang>/last-war-canyon-storm-battlefield-beginner-guide.md`
- `content/<lang>/last-war-canyon-storm-battlefield-cheatsheet.md`

## External reference / AI Q&A
- “小羊收集的攻略库”（NotebookLM）：https://notebooklm.google.com/notebook/001aafd2-2771-4207-808b-3356ff08cbab
- Site pages should include a hint that readers can consult the AI there for game questions.
