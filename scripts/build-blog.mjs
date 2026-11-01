// Builds the blog from content/blog/*.md. No dependencies.
//   node scripts/build-blog.mjs
// Writes blog/index.html, blog/<slug>/index.html, assets/blog/<slug>.svg and updates sitemap.xml.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "content", "blog");
const ORIGIN = "https://www.mindbearing.com";
const GTM = "GTM-NCL3FZSQ";

/* Questionnaire titles come from the live test data so related links never go stale. */
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets", "data.js"), "utf8"), ctx);
const TESTS = Object.fromEntries(ctx.window.TESTS.map((t) => [t.slug, t]));

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const write = (rel, content) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
const fmtDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/* ---------------------------------------------------------- parsing */
function parse(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = { source: [], related: [] };
  for (const line of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, k, v] = kv;
    if (k === "source") { const [label, url] = v.split("|").map((x) => x.trim()); meta.source.push({ label, url }); }
    else if (k === "related") meta.related = v.split(",").map((x) => x.trim()).filter(Boolean);
    else meta[k] = v;
  }
  for (const k of ["title", "description", "date", "slug"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${file}: date must be YYYY-MM-DD`);
  if (!/^[a-z0-9-]+$/.test(meta.slug)) throw new Error(`${file}: slug must be lowercase letters, numbers and hyphens`);
  if (meta.description.length > 160) throw new Error(`${file}: description is ${meta.description.length} characters (max 160)`);
  if (!meta.source.length) throw new Error(`${file}: at least one source is required`);
  for (const s of meta.source) if (!/^https:\/\//.test(s.url || "")) throw new Error(`${file}: source "${s.label}" needs an https URL`);
  for (const r of meta.related) if (!TESTS[r]) throw new Error(`${file}: related questionnaire "${r}" does not exist`);
  meta.sensitive = meta.sensitive === "true";
  meta.body = m[2].trim();
  meta.words = meta.body.split(/\s+/).length;
  return meta;
}

/* Small Markdown subset: ## / ### headings, paragraphs, - lists, > quotes, **bold**, *italic*, [links](url). */
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      const ext = /^https?:/.test(u);
      return `<a href="${u}"${ext ? ' rel="noopener" target="_blank"' : ""}>${t}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
function markdown(md) {
  const out = [];
  for (const block of md.split(/\n{2,}/)) {
    const b = block.trim();
    if (!b) continue;
    if (b.startsWith("### ")) out.push(`<h3>${inline(b.slice(4))}</h3>`);
    else if (b.startsWith("## ")) out.push(`<h2>${inline(b.slice(3))}</h2>`);
    else if (/^- /.test(b)) out.push("<ul>" + b.split("\n").map((l) => `<li>${inline(l.replace(/^- /, ""))}</li>`).join("") + "</ul>");
    else if (b.startsWith("> ")) out.push(`<blockquote>${inline(b.replace(/^> ?/gm, ""))}</blockquote>`);
    else out.push(`<p>${inline(b.replace(/\n/g, " "))}</p>`);
  }
  return out.join("\n");
}

/* ----------------------------------------------------------- cover image */
function wrap(text, max) {
  const words = text.split(" "), lines = [];
  let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) lines.push(cur);
  return lines;
}
function cover(a) {
  const lines = wrap(a.title, 30).slice(0, 4);
  const y0 = 330 - (lines.length - 1) * 38;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7efec"/><stop offset=".55" stop-color="#e8ecf5"/><stop offset="1" stop-color="#fbe3d3"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/>
<circle cx="1060" cy="110" r="190" fill="#1c7a74" opacity=".10"/><circle cx="140" cy="560" r="150" fill="#7a4bbd" opacity=".08"/>
<text x="80" y="110" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#1c7a74">MindBearing · ${esc(a.category || "Articles")}</text>
${lines.map((l, i) => `<text x="80" y="${y0 + i * 76}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="64" font-weight="800" fill="#1d2340">${esc(l)}</text>`).join("\n")}
<text x="80" y="560" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#4b5277">${esc(fmtDate(a.date))}</text>
</svg>
`;
}

/* --------------------------------------------------------------- layout */
const FONTS = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";
const MOON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 12.5A7 7 0 0 1 7.5 4a7 7 0 1 0 8.5 8.5z" fill="currentColor"/></svg>';
function head({ title, description, canonical, type = "website", image, jsonld }) {
  return `<!doctype html><html lang="en"><head><!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');</script><!-- End Google Tag Manager -->
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${ORIGIN}${canonical}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="MindBearing"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${ORIGIN}${canonical}">${image ? `<meta property="og:image" content="${ORIGIN}${image}">` : ""}
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="theme-color" content="#1c7a74">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<script>try{var t=localStorage.getItem('mindbearing:theme');if(t)document.documentElement.setAttribute('data-theme',JSON.parse(t))}catch(e){}</script>
<link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="stylesheet" href="/assets/styles.css">
${(jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("")}
</head>`;
}
function shell(inner) {
  return `<body data-route="blog" data-static><!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->
<div id="app"><a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap"><a class="brand" href="/"><img class="brand-mark" src="/assets/logo-mark.png" alt="" width="30" height="30">MindBearing</a>
<nav class="nav" aria-label="Main"><a href="/" class="hide-sm">Tests</a><a href="/blog/" aria-current="page">Articles</a><a href="/help/" class="help-link">Get help</a></nav>
<button class="icon-btn" data-act="theme" aria-label="Switch colour theme">${MOON}</button></div></header>
<main id="main" tabindex="-1">${inner}</main>
<footer class="foot"><div class="wrap"><div><p><strong>MindBearing</strong> offers free mental health self-checks. They are not a diagnosis and do not replace advice from a qualified professional.</p><p class="small">Articles are for information only. © ${new Date().getFullYear()} MindBearing.</p></div>
<nav aria-label="Footer"><a href="/">All tests</a><a href="/blog/">Articles</a><a href="/results/">My results</a><a href="/help/">Get help</a><a href="/about/">About, privacy and sources</a></nav></div></footer></div>
<script src="/assets/config.js" defer></script><script src="/assets/data.js" defer></script><script src="/assets/app.js" defer></script></body></html>
`;
}

/* ---------------------------------------------------------------- pages */
function articlePage(a, all) {
  const minutes = Math.max(2, Math.round(a.words / 200));
  const url = `/blog/${a.slug}/`;
  const related = a.related.map((s) => TESTS[s]);
  const others = all.filter((x) => x.slug !== a.slug).slice(0, 3);
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description, datePublished: a.date, dateModified: a.updated || a.date,
      image: ORIGIN + `/assets/blog/${a.slug}.svg`, mainEntityOfPage: ORIGIN + url,
      author: { "@type": "Organization", name: "MindBearing", url: ORIGIN + "/" }, publisher: { "@type": "Organization", name: "MindBearing", url: ORIGIN + "/" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" }, { "@type": "ListItem", position: 2, name: "Articles", item: ORIGIN + "/blog/" }, { "@type": "ListItem", position: 3, name: a.title, item: ORIGIN + url }] }
  ];
  const inner = `<article class="wrap article">
<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/blog/">Articles</a></li><li><span aria-current="page">${esc(a.title)}</span></li></ol></nav>
<header class="article-head"><p class="article-cat">${esc(a.category || "Article")}</p><h1>${esc(a.title)}</h1><p class="article-lede">${esc(a.description)}</p>
<p class="article-meta"><time datetime="${a.date}">${fmtDate(a.date)}</time>${a.updated ? ` · Updated <time datetime="${a.updated}">${fmtDate(a.updated)}</time>` : ""} · ${minutes} min read</p></header>
<img class="article-cover" src="/assets/blog/${a.slug}.svg" alt="" width="1200" height="630">
${a.sensitive ? `<aside class="article-help"><p><strong>If you're struggling right now,</strong> you don't have to wait. <a href="/help/">Find a support line in your country</a>.</p></aside>` : ""}
<div class="article-body prose">${markdown(a.body)}</div>
${related.length ? `<aside class="article-related"><h2>Try a related questionnaire</h2><ul class="related">${related.map((t) => `<li><a href="/${t.slug}/">${esc(t.title)}</a></li>`).join("")}</ul><p class="small muted">Questionnaires are for screening and self-reflection, not diagnosis.</p></aside>` : ""}
<section class="article-sources"><h2>Sources</h2><ol>${a.source.map((s) => `<li><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a></li>`).join("")}</ol>
<p class="small muted">This article summarises published research and news reports. It was drafted with AI assistance and checked against the sources above before publication. It is general information, not medical advice.</p></section>
${others.length ? `<section class="article-more"><h2>More articles</h2><ul class="post-list">${others.map(card).join("")}</ul></section>` : ""}
</article>`;
  return head({ title: `${a.title} | MindBearing`, description: a.description, canonical: url, type: "article", jsonld: ld }) + "\n" + shell(inner);
}
function card(a) {
  return `<li><a class="post-card" href="/blog/${a.slug}/"><img src="/assets/blog/${a.slug}.svg" alt="" width="1200" height="630" loading="lazy"><span class="post-cat">${esc(a.category || "Article")}</span><span class="post-title">${esc(a.title)}</span><span class="post-desc">${esc(a.description)}</span><time datetime="${a.date}">${fmtDate(a.date)}</time></a></li>`;
}
function indexPage(all) {
  const inner = `<div class="wrap"><div class="page-head"><h1>Articles</h1><p>Plain-language summaries of new research and news about mental health and the brain, with links to the original sources.</p></div>
${all.length ? `<ul class="post-list">${all.map(card).join("")}</ul>` : "<p>No articles yet.</p>"}<div style="height:4rem"></div></div>`;
  return head({ title: "Articles on mental health and the brain | MindBearing", description: "Plain-language summaries of new research and news about mental health and the brain, with links to the original sources.", canonical: "/blog/" }) + "\n" + shell(inner);
}

/* ------------------------------------------------------------------ run */
const files = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => f.endsWith(".md")) : [];
const all = files.map((f) => parse(path.join(SRC, f))).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
const slugs = new Set();
for (const a of all) { if (slugs.has(a.slug)) throw new Error("duplicate slug " + a.slug); slugs.add(a.slug); }

for (const a of all) { write(`blog/${a.slug}/index.html`, articlePage(a, all)); write(`assets/blog/${a.slug}.svg`, cover(a)); }
write("blog/index.html", indexPage(all));

const smPath = path.join(ROOT, "sitemap.xml");
let sm = fs.readFileSync(smPath, "utf8").replace(/<url><loc>https:\/\/www\.mindbearing\.com\/blog\/[^<]*<\/loc>(<lastmod>[^<]*<\/lastmod>)?<\/url>/g, "");
const blogUrls = [`<url><loc>${ORIGIN}/blog/</loc></url>`].concat(all.map((a) => `<url><loc>${ORIGIN}/blog/${a.slug}/</loc><lastmod>${a.updated || a.date}</lastmod></url>`)).join("");
sm = sm.replace("</urlset>", blogUrls + "</urlset>");
fs.writeFileSync(smPath, sm);
console.log(`Built ${all.length} article(s) and the articles index.`);
