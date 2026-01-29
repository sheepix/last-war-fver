import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_TITLE = "fver 专用攻略站";
const NOTEBOOK_LM_URL = "https://notebooklm.google.com/notebook/001aafd2-2771-4207-808b-3356ff08cbab";

const LANGS = [
  {
    key: "zh-hans",
    dir: "zh-Hans",
    label: "简体中文",
    htmlLang: "zh-Hans",
    tocTitle: "目录",
    nav: { home: "首页", guide: "新手实战指南", lazy: "懒人包" },
  },
  {
    key: "zh-hant",
    dir: "zh-Hant",
    label: "繁體中文",
    htmlLang: "zh-Hant",
    tocTitle: "目錄",
    nav: { home: "首頁", guide: "新手實戰指南", lazy: "懶人包" },
  },
  {
    key: "en",
    dir: "en",
    label: "English",
    htmlLang: "en",
    tocTitle: "Table of Contents",
    nav: { home: "Home", guide: "Field Guide", lazy: "Quick Reference" },
  },
  {
    key: "vi",
    dir: "vi",
    label: "Tiếng Việt",
    htmlLang: "vi",
    tocTitle: "Mục lục",
    nav: { home: "Trang chủ", guide: "Hướng dẫn", lazy: "Tóm tắt nhanh" },
  },
];

const ARTICLES = [
  { key: "guide", file: "guide.md" },
  { key: "lazy", file: "lazy.md" },
  { key: "s4-tank", file: "s4-tank.md" },
];

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[`~!@#$%^&*()=+[{\]}\\|;:'",.<>/?]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const raw = match[2].replace(/\s+#+\s*$/, "").trim();
    if (!raw) continue;

    headings.push({ level, text: raw, id: slugify(raw) });
  }

  return headings;
}

function renderToc(headings, minLevel = 2, maxLevel = 3) {
  const items = headings.filter((h) => h.level >= minLevel && h.level <= maxLevel);
  if (items.length === 0) return "";

  const lis = items
    .map((h) => {
      const indent = (h.level - minLevel) * 16;
      return `<li style="margin-left:${indent}px"><a href="#${h.id}">${escapeHtml(
        h.text
      )}</a></li>`;
    })
    .join("\n");

  return { items, html: (title) => `<nav class="toc"><div class="toc-title">${escapeHtml(title)}</div><ol>\n${lis}\n</ol></nav>` };
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function languageSwitcher({ currentLangKey, pageKind }) {
  const links = LANGS.map((l) => {
    const href = `/${l.key}/${pageKind}/`;
    const active = l.key === currentLangKey ? "active" : "";
    return `<a class="lang ${active}" href="${href}">${escapeHtml(l.label)}</a>`;
  }).join("");
  return `<div class="langbar" aria-label="language">${links}</div>`;
}

function htmlPage({ htmlLang, pageTitle, subtitle, nav, navHref, langSwitchHtml, tocHtml, bodyHtml }) {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(`${SITE_TITLE} · ${pageTitle}`)}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 0; color: #111827; background: #ffffff; }
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .wrap { max-width: 980px; margin: 0 auto; padding: 28px 18px 60px; }
      header { margin-bottom: 18px; }
      .toprow { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
      .brand { display: flex; gap: 10px; align-items: baseline; }
      .brand a { color: #111827; text-decoration: none; }
      .brand-title { font-weight: 750; letter-spacing: .2px; }
      .topnav { display: flex; gap: 12px; flex-wrap: wrap; font-size: 14px; }
      .meta { font-size: 12px; color: #6b7280; margin-top: 6px; }
      h1 { font-size: 28px; margin: 0; letter-spacing: .2px; }
      .subtitle { margin-top: 6px; color: #374151; }
      .grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
      @media (min-width: 920px) { .grid { grid-template-columns: 260px 1fr; align-items: start; } }
      .toc { position: sticky; top: 16px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 12px 6px; background: #fff; }
      .toc-title { font-weight: 650; font-size: 14px; margin-bottom: 8px; }
      .toc ol { margin: 0; padding-left: 18px; }
      .toc li { margin: 6px 0; font-size: 13px; line-height: 1.3; }
      article { border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 18px 22px; background: #fff; }
      article h1 { font-size: 26px; }
      article h2 { margin-top: 22px; font-size: 20px; }
      article h3 { margin-top: 18px; font-size: 16px; }
      article p { line-height: 1.7; }
      article li { line-height: 1.65; }
      article code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 0.95em; background: #f3f4f6; padding: 0.15em 0.35em; border-radius: 6px; }
      article pre { background: #0b1021; color: #e5e7eb; padding: 14px 14px; border-radius: 10px; overflow: auto; }
      article pre code { background: transparent; padding: 0; }
      blockquote { margin: 14px 0; padding: 10px 12px; border-left: 4px solid #e5e7eb; background: #f9fafb; color: #374151; border-radius: 6px; }
      hr { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
      .langbar { display: flex; gap: 8px; flex-wrap: wrap; }
      .lang { font-size: 12px; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 999px; color: #111827; background: #fff; }
      .lang.active { border-color: #93c5fd; background: #eff6ff; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header>
        <div class="toprow">
          <div class="brand">
            <a class="brand-title" href="${escapeHtml(navHref.home)}">${escapeHtml(SITE_TITLE)}</a>
            <nav class="topnav" aria-label="navigation">
              <a href="${escapeHtml(navHref.home)}">${escapeHtml(nav.home)}</a>
              <a href="${escapeHtml(navHref.guide)}">${escapeHtml(nav.guide)}</a>
              <a href="${escapeHtml(navHref.lazy)}">${escapeHtml(nav.lazy)}</a>
            </nav>
          </div>
          ${langSwitchHtml || ""}
        </div>
        <h1>${escapeHtml(pageTitle)}</h1>
        ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
        <div class="meta">生成时间：${now}</div>
      </header>
      <div class="grid">
        <div>${tocHtml || ""}</div>
        <article>${bodyHtml}</article>
      </div>
    </div>
  </body>
</html>`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFile(filePath, contents) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, contents);
}

function configureMarked() {
  const renderer = new marked.Renderer();
  renderer.heading = (token) => {
    const depth = token?.depth ?? token?.level;
    const text = token?.text ?? "";
    const id = slugify(text);
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });
}

function firstHeadingTitle(markdown) {
  const match = /^#\s+(.+)\s*$/m.exec(markdown);
  if (!match) return SITE_TITLE;
  return match[1].trim();
}

function navHrefFor(langKey) {
  const base = langKey ? `/${langKey}` : "";
  return {
    home: `${base}/` || "/",
    guide: `${base}/guide/`,
    lazy: `${base}/lazy/`,
  };
}

async function readMarkdown(langDir, file) {
  const fullPath = path.join(ROOT, "content", langDir, file);
  return await fs.readFile(fullPath, "utf8");
}

async function renderArticle({ lang, outLangKey, outBase, articleKey, file, subtitle }) {
  const md = await readMarkdown(lang.dir, file);
  const pageTitle = firstHeadingTitle(md);
  const headings = extractHeadings(md);
  const toc = renderToc(headings, 2, 3);
  const tocHtml = toc.items.length ? toc.html(lang.tocTitle) : "";
  const bodyHtml = marked.parse(md);

  const outDir = path.join(DIST, outBase, articleKey, "index.html");
  await writeFile(
    outDir,
    htmlPage({
      htmlLang: lang.htmlLang,
      pageTitle,
      subtitle,
      nav: lang.nav,
      navHref: navHrefFor(outLangKey),
      langSwitchHtml: languageSwitcher({ currentLangKey: lang.key, pageKind: articleKey }),
      tocHtml,
      bodyHtml,
    })
  );
}

async function renderHome() {
  const zhHans = LANGS.find((l) => l.key === "zh-hans");

  const notebookBlock = `
    <h2 id="ai">AI 咨询（小羊收集的攻略库）</h2>
    <p>
      我把资料整理在「小羊收集的攻略库」：<a href="${NOTEBOOK_LM_URL}">${NOTEBOOK_LM_URL}</a>。
      你也可以在这里向 AI 咨询游戏相关问题。
    </p>
  `;

  const links = (
    await Promise.all(
      ARTICLES.map(async (a) => {
        const zhTitle = firstHeadingTitle(await readMarkdown(zhHans.dir, a.file));
        const perLang = LANGS.map((l) => {
          const href = `/${l.key}/${a.key}/`;
          return `<a href="${href}">${escapeHtml(l.label)}</a>`;
        }).join(" · ");

        const defaultHref = `/${a.key}/`;
        return `<li>
          <div style="font-weight:650;margin-bottom:6px"><a href="${defaultHref}">${escapeHtml(
            zhTitle
          )}</a></div>
          <div style="font-size:13px;color:#374151">${perLang}</div>
        </li>`;
      })
    )
  ).join("\n");

  const bodyHtml = `
    <h2 id="toc">文章目录</h2>
    <ul style="padding-left:18px">
      ${links}
    </ul>
    <h2 id="about">说明</h2>
    <ul style="padding-left:18px">
      <li>默认入口（/guide、/lazy）为简体中文。</li>
      <li>每篇文章页面右上角可切换语言版本。</li>
    </ul>
    ${notebookBlock}
  `;

  await writeFile(
    path.join(DIST, "index.html"),
    htmlPage({
      htmlLang: "zh-Hans",
      pageTitle: SITE_TITLE,
      subtitle: "文章索引与多语言入口",
      nav: LANGS[0].nav,
      navHref: navHrefFor(""),
      langSwitchHtml: "",
      tocHtml: "",
      bodyHtml,
    })
  );
}

async function renderLangHome(lang) {
  const navHref = navHrefFor(lang.key);
  const aiBlockByLang = (() => {
    if (lang.key === "en") {
      return `
        <h2 id="ai">AI Q&A (Xiao Yang’s guide library)</h2>
        <p>
          Notes are collected here: <a href="${NOTEBOOK_LM_URL}">${NOTEBOOK_LM_URL}</a>.
          You can also ask the AI there about the game.
        </p>
      `;
    }
    if (lang.key === "vi") {
      return `
        <h2 id="ai">Hỏi đáp AI (Thư viện hướng dẫn của “Tiểu Dương”)</h2>
        <p>
          Mình lưu ghi chú tại đây: <a href="${NOTEBOOK_LM_URL}">${NOTEBOOK_LM_URL}</a>.
          Bạn cũng có thể hỏi AI ở đó về các câu hỏi trong game.
        </p>
      `;
    }
    if (lang.key === "zh-hant") {
      return `
        <h2 id="ai">AI 諮詢（小羊收集的攻略庫）</h2>
        <p>
          我把資料整理在「小羊收集的攻略庫」：<a href="${NOTEBOOK_LM_URL}">${NOTEBOOK_LM_URL}</a>。
          你也可以在這裡向 AI 諮詢遊戲相關問題。
        </p>
      `;
    }
    return `
      <h2 id="ai">AI 咨询（小羊收集的攻略库）</h2>
      <p>
        我把资料整理在「小羊收集的攻略库」：<a href="${NOTEBOOK_LM_URL}">${NOTEBOOK_LM_URL}</a>。
        你也可以在这里向 AI 咨询游戏相关问题。
      </p>
    `;
  })();

  const links = (
    await Promise.all(
      ARTICLES.map(async (a) => {
        const title = firstHeadingTitle(await readMarkdown(lang.dir, a.file));
        const href = `/${lang.key}/${a.key}/`;
        const perLang = LANGS.map((l) => {
          const x = `/${l.key}/${a.key}/`;
          return `<a href="${x}">${escapeHtml(l.label)}</a>`;
        }).join(" · ");
        return `<li style="margin-top:14px">
          <div style="font-weight:650;margin-bottom:6px"><a href="${href}">${escapeHtml(
            title
          )}</a></div>
          <div style="font-size:13px;color:#374151">${perLang}</div>
        </li>`;
      })
    )
  ).join("\n");

  const bodyHtml = `
    <h2 id="toc">文章目录</h2>
    <ul style="padding-left:18px;margin-top:0">
      ${links}
    </ul>
    ${aiBlockByLang}
  `;

  await writeFile(
    path.join(DIST, lang.key, "index.html"),
    htmlPage({
      htmlLang: lang.htmlLang,
      pageTitle: SITE_TITLE,
      subtitle: `${lang.label} · Index`,
      nav: lang.nav,
      navHref,
      langSwitchHtml: `<div class="langbar">${LANGS.map((l) => {
        const href = `/${l.key}/`;
        const active = l.key === lang.key ? "active" : "";
        return `<a class="lang ${active}" href="${href}">${escapeHtml(l.label)}</a>`;
      }).join("")}</div>`,
      tocHtml: "",
      bodyHtml,
    })
  );
}

async function build() {
  configureMarked();

  await fs.rm(DIST, { recursive: true, force: true });
  await ensureDir(DIST);

  await renderHome();

  for (const lang of LANGS) {
    await renderLangHome(lang);
    for (const article of ARTICLES) {
      await renderArticle({
        lang,
        outLangKey: lang.key,
        outBase: lang.key,
        articleKey: article.key,
        file: article.file,
        subtitle:
          article.key === "guide"
            ? lang.key === "zh-hans"
              ? "完整版"
              : ""
            : lang.key === "zh-hans"
              ? "速查/照抄执行"
              : "",
      });
    }
  }

  const defaultLang = LANGS.find((l) => l.key === "zh-hans");
  for (const article of ARTICLES) {
    await renderArticle({
      lang: defaultLang,
      outLangKey: "",
      outBase: "",
      articleKey: article.key,
      file: article.file,
      subtitle: article.key === "guide" ? "简体中文（默认）" : "简体中文（默认）",
    });
  }
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
