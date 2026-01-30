import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_TITLE = "fver 专用攻略站";
const NOTEBOOK_LM_URL = "https://notebooklm.google.com/notebook/001aafd2-2771-4207-808b-3356ff08cbab";
const OTHER_GUIDE_SITE_URL = "https://lastwar-tutorial.com/";
const ERRATA_CONTACT = "勘误请在游戏中联系小羊 SheepX128。";

const LANGS = [
  {
    key: "zh-hans",
    dir: "zh-Hans",
    label: "简体中文",
    htmlLang: "zh-Hans",
    tocTitle: "目录",
    nav: { home: "首页", list: "文章列表", other: "其他攻略站" },
  },
  {
    key: "zh-hant",
    dir: "zh-Hant",
    label: "繁體中文",
    htmlLang: "zh-Hant",
    tocTitle: "目錄",
    nav: { home: "首頁", list: "文章列表", other: "其他攻略站" },
  },
  {
    key: "en",
    dir: "en",
    label: "English",
    htmlLang: "en",
    tocTitle: "Table of Contents",
    nav: { home: "Home", list: "Articles", other: "Other guides" },
  },
  {
    key: "vi",
    dir: "vi",
    label: "Tiếng Việt",
    htmlLang: "vi",
    tocTitle: "Mục lục",
    nav: { home: "Trang chủ", list: "Bài viết", other: "Trang hướng dẫn khác" },
  },
];

const ARTICLES = [
  {
    key: "guide",
    slug: "last-war-canyon-storm-battlefield-beginner-guide",
    file: "last-war-canyon-storm-battlefield-beginner-guide.md",
  },
  {
    key: "lazy",
    slug: "last-war-canyon-storm-battlefield-cheatsheet",
    file: "last-war-canyon-storm-battlefield-cheatsheet.md",
  },
  {
    key: "s4-tank",
    slug: "last-war-s4-tanks-4-plus-1-adam-mixed-lineup",
    file: "last-war-s4-tanks-4-plus-1-adam-mixed-lineup.md",
  },
  {
    key: "canyon-storm-rules",
    slug: "last-war-canyon-storm-battlefield-official-rules",
    file: "last-war-canyon-storm-battlefield-official-rules.md",
  },
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
  const hasToc = Boolean(tocHtml && tocHtml.trim().length > 0);
  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(`${SITE_TITLE} · ${pageTitle}`)}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 0; color: #111827; background: radial-gradient(900px 500px at 10% 0%, #eef2ff, rgba(255,255,255,0) 60%), radial-gradient(900px 500px at 90% 0%, #ecfeff, rgba(255,255,255,0) 60%), #ffffff; }
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
      @media (min-width: 920px) { .grid.has-toc { grid-template-columns: 260px 1fr; align-items: start; } }
      .toc { position: sticky; top: 16px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 12px 6px; background: #fff; }
      .toc-title { font-weight: 650; font-size: 14px; margin-bottom: 8px; }
      .toc ol { margin: 0; padding-left: 18px; }
      .toc li { margin: 6px 0; font-size: 13px; line-height: 1.3; }
      article { border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 18px 22px; background: rgba(255,255,255,.9); box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); backdrop-filter: blur(6px); }
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
      .cards { display: grid; gap: 12px; margin: 12px 0 8px; }
      @media (min-width: 920px) { .cards { grid-template-columns: 1fr 1fr; } }
      .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px 14px 12px; background: #fff; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05); }
      .card-title { font-weight: 720; margin: 0 0 6px; font-size: 16px; }
      .card-desc { margin: 0 0 10px; color: #4b5563; font-size: 13px; line-height: 1.6; }
      .pillrow { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 6px; }
      .pill { font-size: 12px; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 999px; background: #fff; color: #111827; }
      .pill.primary { background: #111827; border-color: #111827; color: #fff; }
      .muted { color: #6b7280; font-size: 12px; }
      .section-title { margin: 0; font-size: 18px; }
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
              <a href="${escapeHtml(navHref.list)}">${escapeHtml(nav.list)}</a>
              <a href="${escapeHtml(OTHER_GUIDE_SITE_URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(nav.other)}</a>
            </nav>
          </div>
          ${langSwitchHtml || ""}
        </div>
        <h1>${escapeHtml(pageTitle)}</h1>
        ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
        <div class="meta">生成时间：${now}</div>
      </header>
      <div class="grid ${hasToc ? "has-toc" : ""}">
        ${hasToc ? `<div>${tocHtml || ""}</div>` : ""}
        <article>
          ${bodyHtml}
          <hr />
          <p class="muted">${escapeHtml(ERRATA_CONTACT)}</p>
        </article>
      </div>
    </div>
  </body>
</html>`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyStaticAssets() {
  const src = path.join(ROOT, "static");
  if (!(await pathExists(src))) return;
  await fs.cp(src, path.join(DIST, "static"), { recursive: true });
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
    list: `${base}/#toc` || "/#toc",
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

function redirectPage(targetHref) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(targetHref)}" />
    <title>Redirecting…</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
    </style>
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(targetHref)}">${escapeHtml(targetHref)}</a>…</p>
  </body>
</html>`;
}

async function renderHome() {
  const zhHans = LANGS.find((l) => l.key === "zh-hans");

  const notebookBlock = `
    <div class="card" style="border-color:#dbeafe;background:linear-gradient(135deg,#eff6ff,#ffffff)">
      <div class="card-title">AI 咨询（小羊收集的攻略库）</div>
      <p class="card-desc">把资料集中整理在 NotebookLM，你可以在那边直接问 AI 游戏问题。</p>
      <div class="pillrow">
        <a class="pill primary" href="${NOTEBOOK_LM_URL}">打开攻略库</a>
        <span class="muted">${NOTEBOOK_LM_URL}</span>
      </div>
    </div>
  `;

  const cards = (
    await Promise.all(
      ARTICLES.map(async (a) => {
        const zhTitle = firstHeadingTitle(await readMarkdown(zhHans.dir, a.file));
        const perLang = LANGS.map((l) => {
          const href = `/${l.key}/${a.slug}/`;
          return `<a class="pill" href="${href}">${escapeHtml(l.label)}</a>`;
        }).join(" ");

        const defaultHref = `/${a.slug}/`;
        const desc =
          a.key === "guide"
            ? "战场思路、技能配置、建筑优先级与一波流流程。"
            : a.key === "lazy"
              ? "快速照抄版：三条铁律 + 一波流顺序 + 自检清单。"
              : "配队思路与对局要点总结，适合快速复盘。";
        return `<div class="card">
          <div class="card-title"><a href="${defaultHref}">${escapeHtml(zhTitle)}</a></div>
          <p class="card-desc">${escapeHtml(desc)}</p>
          <div class="pillrow">
            <a class="pill primary" href="${defaultHref}">打开（默认简体）</a>
            <span class="muted">其他语言：</span>
            ${perLang}
          </div>
        </div>`;
      })
    )
  ).join("\n");

  const bodyHtml = `
    <h2 class="section-title" id="toc">文章目录</h2>
    <div class="cards">
      ${cards}
    </div>
    <div class="muted" style="margin-top:8px">提示：默认入口（/guide、/lazy、/s4-tank）为简体中文；文章右上角可切换语言。</div>
    <div style="margin-top:14px">${notebookBlock}</div>
  `;

  await writeFile(
    path.join(DIST, "index.html"),
    htmlPage({
      htmlLang: "zh-Hans",
      pageTitle: SITE_TITLE,
      subtitle: "Last War: Survival 攻略合集 · 持续更新",
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
        <div class="card" style="border-color:#dbeafe;background:linear-gradient(135deg,#eff6ff,#ffffff)">
          <div class="card-title">AI Q&A (Xiao Yang’s guide library)</div>
          <p class="card-desc">Notes are collected in NotebookLM. You can ask the AI there about the game.</p>
          <div class="pillrow">
            <a class="pill primary" href="${NOTEBOOK_LM_URL}">Open the library</a>
            <span class="muted">${NOTEBOOK_LM_URL}</span>
          </div>
        </div>
      `;
    }
    if (lang.key === "vi") {
      return `
        <div class="card" style="border-color:#dbeafe;background:linear-gradient(135deg,#eff6ff,#ffffff)">
          <div class="card-title">Hỏi đáp AI (Thư viện hướng dẫn của “Tiểu Dương”)</div>
          <p class="card-desc">Ghi chú được tổng hợp trong NotebookLM. Bạn có thể hỏi AI ở đó về các câu hỏi trong game.</p>
          <div class="pillrow">
            <a class="pill primary" href="${NOTEBOOK_LM_URL}">Mở thư viện</a>
            <span class="muted">${NOTEBOOK_LM_URL}</span>
          </div>
        </div>
      `;
    }
    if (lang.key === "zh-hant") {
      return `
        <div class="card" style="border-color:#dbeafe;background:linear-gradient(135deg,#eff6ff,#ffffff)">
          <div class="card-title">AI 諮詢（小羊收集的攻略庫）</div>
          <p class="card-desc">把資料集中整理在 NotebookLM，你可以在那邊直接問 AI 遊戲問題。</p>
          <div class="pillrow">
            <a class="pill primary" href="${NOTEBOOK_LM_URL}">打開攻略庫</a>
            <span class="muted">${NOTEBOOK_LM_URL}</span>
          </div>
        </div>
      `;
    }
    return `
      <div class="card" style="border-color:#dbeafe;background:linear-gradient(135deg,#eff6ff,#ffffff)">
        <div class="card-title">AI 咨询（小羊收集的攻略库）</div>
        <p class="card-desc">把资料集中整理在 NotebookLM，你可以在那边直接问 AI 游戏问题。</p>
        <div class="pillrow">
          <a class="pill primary" href="${NOTEBOOK_LM_URL}">打开攻略库</a>
          <span class="muted">${NOTEBOOK_LM_URL}</span>
        </div>
      </div>
    `;
  })();

  const cards = (
    await Promise.all(
      ARTICLES.map(async (a) => {
        const title = firstHeadingTitle(await readMarkdown(lang.dir, a.file));
        const href = `/${lang.key}/${a.slug}/`;
        const perLang = LANGS.map((l) => {
          const x = `/${l.key}/${a.slug}/`;
          return `<a class="pill" href="${x}">${escapeHtml(l.label)}</a>`;
        }).join(" ");

        return `<div class="card">
          <div class="card-title"><a href="${href}">${escapeHtml(title)}</a></div>
          <div class="pillrow">
            <a class="pill primary" href="${href}">Open</a>
            <span class="muted">Other languages:</span>
            ${perLang}
          </div>
        </div>`;
      })
    )
  ).join("\n");

  const bodyHtml = `
    <h2 class="section-title" id="toc">Articles</h2>
    <div class="cards">
      ${cards}
    </div>
    <div style="margin-top:14px">${aiBlockByLang}</div>
  `;

  await writeFile(
    path.join(DIST, lang.key, "index.html"),
    htmlPage({
      htmlLang: lang.htmlLang,
      pageTitle: SITE_TITLE,
      subtitle:
        lang.key === "en"
          ? "Last War: Survival guides · Updated often"
          : lang.key === "vi"
            ? "Tổng hợp hướng dẫn · Cập nhật thường xuyên"
            : lang.key === "zh-hant"
              ? "Last War: Survival 攻略合集 · 持續更新"
              : "Last War: Survival 攻略合集 · 持续更新",
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

  await copyStaticAssets();
  await renderHome();

  for (const lang of LANGS) {
    await renderLangHome(lang);
    for (const article of ARTICLES) {
      await renderArticle({
        lang,
        outLangKey: lang.key,
        outBase: lang.key,
        articleKey: article.slug,
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
      articleKey: article.slug,
      file: article.file,
      subtitle: article.key === "guide" ? "简体中文（默认）" : "简体中文（默认）",
    });
  }

  // Backward-compatible redirects (old short paths -> new semantic slugs)
  for (const article of ARTICLES) {
    // default
    await writeFile(
      path.join(DIST, article.key, "index.html"),
      redirectPage(`/${article.slug}/`)
    );
    // per language
    for (const lang of LANGS) {
      await writeFile(
        path.join(DIST, lang.key, article.key, "index.html"),
        redirectPage(`/${lang.key}/${article.slug}/`)
      );
    }
  }
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
