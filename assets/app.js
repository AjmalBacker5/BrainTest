/* Unfold: app. Works as a multi-page static site (mode "multi")
   or as a single file with hash routes (mode "spa"). */
(function () {
  "use strict";
  var CFG = Object.assign({ name: "Unfold", mode: "multi", key: "unfold:", surveyEndpoint: "" }, window.SITE || {});
  var TESTS = window.TESTS, GROUPS = window.GROUPS, HELP = window.HELPLINES, SCALES = window.SCALES;
  var BY = {}; TESTS.forEach(function (t) { BY[t.slug] = t; });
  var BYG = {}, GBYID = {}; GROUPS.forEach(function (g) { BYG[g.slug] = g; GBYID[g.id] = g; });
  function testsIn(g) { return TESTS.filter(function (t) { return t.group === g.id; }); }
  var app = document.getElementById("app");
  var timerId = null, advanceId = null;

  /* ---------- utilities ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(CFG.key + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(CFG.key + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(CFG.key + k); } catch (e) {} }
  };
  function href(route) {
    if (CFG.mode === "spa") return "#/" + (route || "");
    return (route || "index") + ".html";
  }
  function resultHref(slug) { return CFG.mode === "spa" ? "#/" + slug + "/result" : slug + ".html#result"; }
  function route() {
    if (CFG.mode === "spa") return decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    var r = document.body.getAttribute("data-route") || "";
    if (location.hash === "#result") r += "/result";
    return r;
  }
  var ICON = {
    plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor" opacity=".18"/><path d="M6 10.5l2.6 2.5L14 7.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 12.5A7 7 0 0 1 7.5 4a7 7 0 1 0 8.5 8.5z" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4" fill="currentColor"/><path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19M3.6 3.6l1.8 1.8M14.6 14.6l1.8 1.8M3.6 16.4l1.8-1.8M14.6 5.4l1.8-1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    mark: '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2b38a"/><stop offset="1" stop-color="#1c7a74"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(#bm)"/><path d="M1.5 19c4-2.4 8.5-2.4 14.5 0s10.5 2.4 14.5 0V21a15 15 0 0 1-29 0z" fill="#1d2340" opacity=".85"/><circle cx="16" cy="15" r="4.5" fill="#fff"/></svg>'
  };
  var TONE = ["var(--t0)", "var(--t1)", "var(--t2)", "var(--t3)"];
  function count(t) { return t.items.length; }
  function fmtDate(ms) { try { return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } }

  /* ---------- theme ---------- */
  function applyTheme() { var th = store.get("theme", null); if (th) document.documentElement.setAttribute("data-theme", th); }
  function isDark() {
    var th = document.documentElement.getAttribute("data-theme");
    if (th) return th === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme();

  /* ---------- country for helplines ---------- */
  function detectCountry() {
    var saved = store.get("country", null);
    if (saved && HELP.some(function (h) { return h.c === saved; })) return saved;
    var code = null;
    try { code = window.TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone] || null; } catch (e) {}
    if (!code) {
      var langs = navigator.languages || [navigator.language || ""];
      for (var i = 0; i < langs.length && !code; i++) {
        var m = /-([A-Za-z]{2})$/.exec(langs[i] || "");
        if (m && HELP.some(function (h) { return h.c === m[1].toUpperCase(); })) code = m[1].toUpperCase();
      }
    }
    return code || "INTL";
  }
  function helpFor(c) { return HELP.filter(function (h) { return h.c === c; })[0] || HELP[0]; }
  function helpBox(opts) {
    opts = opts || {};
    var c = detectCountry(), h = helpFor(c), tag = opts.h1 ? "h2" : "h3";
    var options = HELP.map(function (x) { return '<option value="' + x.c + '"' + (x.c === c ? " selected" : "") + ">" + esc(x.n) + "</option>"; }).join("");
    return '<section class="helpbox" aria-labelledby="hb-' + (opts.id || "x") + '">' +
      "<" + tag + ' id="hb-' + (opts.id || "x") + '">' + esc(opts.title || "Talk to someone now") + "</" + tag + ">" +
      '<div class="help-country"><label for="hc-' + (opts.id || "x") + '">Your country</label><select id="hc-' + (opts.id || "x") + '" data-act="country">' + options + "</select></div>" +
      '<ul class="lines">' + h.l.map(function (l) {
        var ext = /^https?:/.test(l[2]);
        return '<li><a href="' + esc(l[2]) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '><span class="ln-name">' + esc(l[0]) + '</span><span class="ln-num">' + esc(l[1]) + "</span></a></li>";
      }).join("") + "</ul>" +
      '<p class="emergency">If you or someone else is in immediate danger, call <strong>' + esc(h.e) + "</strong>.</p>" +
      (c !== "INTL" ? '<p class="global-link">Somewhere else? Find a line at <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a>.</p>' : "") +
      "</section>";
  }

  /* ---------- layout ---------- */
  function header(active) {
    var link = function (r, label, cls) { return '<a href="' + href(r) + '"' + (active === r ? ' aria-current="page"' : "") + (cls ? ' class="' + cls + '"' : "") + ">" + label + "</a>"; };
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="top"><div class="wrap">' +
      '<a class="brand" href="' + href("") + '">' + ICON.mark + esc(CFG.name) + "</a>" +
      '<nav class="nav" aria-label="Main">' + link("", "Tests", "hide-sm") + link("results", "My results") + link("help", "Get help", "help-link") + "</nav>" +
      '<button class="icon-btn" data-act="theme" aria-label="' + (isDark() ? "Switch to light theme" : "Switch to dark theme") + '">' + (isDark() ? ICON.sun : ICON.moon) + "</button>" +
      "</div></header>";
  }
  function footer() {
    return '<footer class="foot"><div class="wrap"><div><p><strong>' + esc(CFG.name) + "</strong> offers free mental health self-checks. They are not a diagnosis and do not replace advice from a qualified professional.</p>" +
      '<p class="small">Your answers are stored only in this browser. © ' + new Date().getFullYear() + " " + esc(CFG.name) + ".</p></div>" +
      '<nav aria-label="Footer"><a href="' + href("") + '">All tests</a><a href="' + href("results") + '">My results</a><a href="' + href("help") + '">Get help</a><a href="' + href("about") + '">About, privacy and sources</a></nav></div></footer>';
  }
  function page(active, inner) {
    stopTimers();
    app.innerHTML = header(active) + '<main id="main" tabindex="-1">' + inner + "</main>" + footer();
  }

  /* ---------- home ---------- */
  function pill(t) {
    var done = store.get("results", {})[t.slug];
    var g = GBYID[t.group] || {};
    return '<li data-search="' + esc((t.title + " " + (t.tags || "") + " " + t.short + " " + (g.name || "")).toLowerCase()) + '"><a class="pill" style="--accent:' + (g.accent || "#1c7a74") + '" href="' + href(t.slug) + '">' +
      '<span class="pill-name">' + esc(t.title) + "</span>" +
      '<span class="pill-meta">' + count(t) + " questions, about " + t.minutes + " min</span>" +
      (done ? '<span class="pill-done">' + ICON.check.replace("<svg", '<svg width="16" height="16"') + (t.kind === "survey" ? "Completed" : "Taken") + " " + esc(fmtDate(done.date)) + "</span>" : "") +
      '<span class="pill-go" aria-hidden="true">' + ICON.plus + "</span></a></li>";
  }
  function heroDemo() {
    var t = BY["mental-health-check"], it = items(t)[0];
    return '<div class="demo">' +
      '<div class="demo-glow" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="demo-card">' +
      '<p class="demo-step">Question 1 of ' + count(t) + '</p>' +
      '<p class="demo-stem">' + esc(t.stem) + '</p>' +
      '<p class="demo-q">' + esc(it.q) + '</p>' +
      '<div class="demo-opts">' + it.o.map(function (o, k) {
        return '<button type="button" class="demo-opt" data-act="seed" data-k="' + k + '"><span class="key" aria-hidden="true">' + (k + 1) + "</span>" + esc(o[0]) + "</button>";
      }).join("") + "</div>" +
      '<p class="demo-foot">Answer here and the check carries on. Nothing leaves your device.</p>' +
      "</div></div>";
  }

  function renderHome() {
    var uni = BY["mental-health-check"];
    var c = detectCountry(), h = helpFor(c), first = h.l[0];
    var cats = GROUPS.map(function (g) {
      var list = testsIn(g);
      return '<li><a class="cat" style="--accent:' + g.accent + '" href="' + href(g.slug) + '">' +
        '<h3>' + esc(g.name) + "</h3><p>" + esc(g.desc) + "</p>" +
        '<ul class="cat-list">' + list.slice(0, 4).map(function (t) { return "<li>" + esc(t.title.replace(/ Test$| Survey$/, "")) + "</li>"; }).join("") +
        (list.length > 4 ? "<li>and " + (list.length - 4) + " more</li>" : "") + "</ul>" +
        '<span class="cat-go">' + list.length + " test" + (list.length > 1 ? "s" : "") + "</span></a></li>";
    }).join("");
    var allPills = TESTS.map(pill).join("");
    var tick = ICON.check;
    page("", 
      '<section class="hero"><div class="wrap"><div>' +
      "<h1>How are you, really?</h1>" +
      '<p class="hero-lede">Free, private mental health checks that take a few minutes. Understand what you’re feeling and find the right next step.</p>' +
      '<div class="hero-actions"><a class="btn btn-primary" href="' + href(uni.slug) + '">Start the 3-minute check</a><button class="btn btn-ghost" data-act="to-tests">Browse all ' + TESTS.length + " tests</button></div>" +
      '<ul class="hero-trust"><li>' + tick + "No sign-up</li><li>" + tick + "Free for everyone</li><li>" + tick + "Results in seconds</li></ul>" +
      "</div>" + heroDemo() + "</div></section>" +
      '<div class="strip"><div class="wrap"><p>Need to talk to someone right now?</p><p>' +
      (c === "INTL" ? '<a href="' + href("help") + '">Find a crisis line near you</a>' :
        esc(h.n) + ": " + esc(first[0].split(" (")[0]) + ' <a class="num" href="' + esc(first[2]) + '">' + esc(first[1]) + '</a>. <a href="' + href("help") + '">See more options</a>') +
      "</p></div></div>" +
      '<section class="section" id="tests"><div class="wrap">' +
      '<div class="section-head"><div><h2>Browse by category</h2><p>' + TESTS.length + " tests in " + GROUPS.length + ' categories. Most take 2 to 4 minutes.</p></div>' +
      '<div class="search"><label class="sr" for="q">Search tests</label>' + ICON.search + '<input id="q" type="search" placeholder="Search, e.g. sleep, anger, focus" autocomplete="off" data-act="search"></div></div>' +
      '<ul class="cats" id="cats">' + cats + "</ul>" +
      '<div id="results-list" hidden><ul class="pills" data-group>' + allPills + '</ul><p class="empty-search" hidden>No tests match that search. Try a different word, or <a href="' + href(uni.slug) + '">take the Universal Mental Health Check</a>.</p></div>' +
      "</div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap">' +
      '<h2 style="margin-bottom:2rem">How it works</h2><ol class="steps">' +
      "<li><h3>Pick a test</h3><p class=\"muted\">Not sure where to start? The Universal Mental Health Check points you to the tests that fit.</p></li>" +
      "<li><h3>Answer honestly</h3><p class=\"muted\">One question at a time. There are no right or wrong answers, and you can go back.</p></li>" +
      "<li><h3>Understand your result</h3><p class=\"muted\">See what your score means, what you can do next, and where to find support.</p></li>" +
      "</ol></div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap"><div class="promise">' +
      "<div><h2>Built to be trusted</h2><p class=\"muted\">Whether you’re in Mumbai, Manchester or Manila, you get the same careful, private experience.</p></div>" +
      "<dl><div><dt>Your answers stay with you</dt><dd>There are no accounts and no tracking of your answers. Results are saved only in this browser, and you can delete them any time.</dd></div>" +
      "<div><dt>Established questionnaires where possible</dt><dd>Depression, anxiety, PTSD, postpartum and child checks use widely used clinical screening tools. Each test lists its source.</dd></div>" +
      "<div><dt>Support wherever you live</dt><dd>Crisis lines adapt to your country, with a worldwide directory if yours isn’t listed.</dd></div></dl>" +
      "</div></div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap faq"><h2>Common questions</h2>' +
      faq("Is this a diagnosis?", "No. These are screening tools that show whether your experiences are similar to those of people with a condition. Only a qualified professional can diagnose you.") +
      faq("Where are my answers saved?", "Only in your browser’s local storage on this device. Nothing is sent to us. Clearing your browser data, or using “Delete all results” on the My results page, removes them.") +
      faq("My result is high. What should I do?", "Share your result with a doctor or mental health professional. If you have thoughts of harming yourself, contact a crisis line or emergency services now.") +
      faq("Can I take a test for someone else?", "The Parent Test is designed for parents answering about a child. The other tests are meant to be answered about yourself, but you can use them to start a conversation with someone you care about.") +
      faq("How accurate is the IQ test?", "It gives a rough estimate for fun and reflection. A real IQ assessment is done in person by a qualified psychologist.") +
      "</div></section>");
  }
  function faq(q, a) { return "<details><summary>" + esc(q) + "</summary><p>" + esc(a) + "</p></details>"; }

  /* ---------- scoring ---------- */
  function norm(t, it) {
    if (typeof it === "string") it = { q: it };
    var o = it.o || SCALES[t.scale] || [];
    o = o.map(function (x, i) { return typeof x === "string" ? [x, i] : x; });
    if (it.rev) { var mx = Math.max.apply(null, o.map(function (x) { return x[1]; })); o = o.map(function (x) { return [x[0], mx - x[1]].concat(x.slice(2)); }); }
    return { q: it.q, stem: it.stem, o: o, score: it.score !== false && t.kind === "check", cat: it.cat, a: it.a, visual: it.visual, html: it.html, labels: it.labels };
  }
  function items(t) { return t.items.map(function (it) { return norm(t, it); }); }
  function maxOf(it) { return Math.max.apply(null, it.o.map(function (x) { return x[1]; })); }
  function val(it, a) { return a == null ? null : it.o[a][1]; }
  function bandObj(b) { return b ? { tone: b[1], label: b[2], text: b[3] || "" } : null; }

  function compute(t, ans, secs) {
    var its = items(t);
    if (t.kind === "iq") {
      var correct = 0, cats = {};
      its.forEach(function (it, i) {
        cats[it.cat] = cats[it.cat] || { c: 0, n: 0 };
        cats[it.cat].n++;
        if (ans[i] === it.a) { correct++; cats[it.cat].c++; }
      });
      var score2 = correct, b;
      if (t.estimate) { score2 = Math.max(70, Math.min(145, Math.round(100 + 15 * (correct - 11) / 3.5))); }
      b = t.bands.filter(function (x) { return score2 <= x[0]; })[0] || t.bands[t.bands.length - 1];
      return { slug: t.slug, kind: "iq", estimate: !!t.estimate, score: score2, correct: correct, total: its.length, cats: cats, secs: secs || 0, date: Date.now(), band: bandObj(b), answers: ans.slice() };
    }
    var score = 0, max = 0;
    its.forEach(function (it, i) { if (!it.score) return; max += maxOf(it); var v = val(it, ans[i]); if (v != null) score += v; });
    var subs = (t.subs || []).map(function (s) {
      var v = 0, m = 0;
      s.items.forEach(function (i) { m += maxOf(its[i]); var x = val(its[i], ans[i]); if (x != null) v += x; });
      var pct = m ? Math.round(100 * v / m) : 0;
      return { name: s.name, v: v, m: m, pct: pct, hit: s.cut != null && v >= s.cut, link: s.link, note: s.note,
               desc: s.desc ? s.desc[pct < 40 ? 0 : pct <= 66 ? 1 : 2] : null, lvl: pct < 40 ? 0 : pct <= 66 ? 1 : 2 };
    });
    var flags = (t.flags || []).filter(function (f) { var v = val(its[f.i], ans[f.i]); return v != null && v >= f.min; }).map(function (f) { return { type: f.type, text: f.text }; });
    var res = { slug: t.slug, kind: t.kind, score: score, max: max, subs: subs, flags: flags, date: Date.now(), answers: ans.slice() };
    if (t.kind === "profile") { res.kind = "profile"; return res; }
    if (t.bands) res.band = bandObj(t.bands.filter(function (b) { return score <= b[0]; })[0] || t.bands[t.bands.length - 1]);
    if (t.custom) {
      res = t.custom(res, ans, its) || res;
      if (res.bandIndex != null) { res.band = bandObj(t.bands[res.bandIndex]); delete res.bandIndex; }
    }
    if (t.insights) res.insights = t.insights(ans, its);
    return res;
  }

  /* ---------- test page ---------- */
  var run = null; // { t, its, i, ans, start }

  function renderTest(slug, showResult) {
    var t = BY[slug];
    if (!t) return renderNotFound();
    if (showResult) {
      var saved = store.get("results", {})[slug];
      if (saved) return renderResult(t, saved, true);
    }
    var seed = store.get("seed", null);
    if (seed && seed.slug === slug && Date.now() - seed.at < 60000) {
      store.del("seed"); store.del("prog:" + slug);
      startRun(slug, false);
      pick(seed.k);
      return;
    }
    var prog = store.get("prog:" + slug, null);
    var isSurvey = t.kind === "survey";
    var facts = ["<li>" + count(t) + " questions</li>", "<li>About " + t.minutes + " minutes</li>", "<li>" + (isSurvey || t.kind === "profile" ? "No score" : t.kind === "iq" ? "Timed" : "Instant result") + "</li>"];
    var g0 = GBYID[t.group] || {};
    page("",
      '<div class="wrap"><div class="page-head"><a class="crumb" href="' + href(g0.slug || "") + '">' + ICON.back.replace("<svg", '<svg width="16" height="16"') + esc(g0.name || "All tests") + "</a>" +
      "<h1>" + esc(t.title) + "</h1><p>" + esc(t.short) + "</p></div>" +
      '<div class="intro"><div>' +
      (t.intro ? "<p>" + esc(t.intro) + "</p>" : "") +
      '<ul class="intro-facts">' + facts.join("") + "</ul>" +
      '<button class="btn ' + (isSurvey ? "btn-plum" : "btn-primary") + '" data-act="start">' + (isSurvey ? "Start the survey" : "Start the test") + "</button>" +
      (prog && prog.ans && prog.ans.some(function (a) { return a != null; }) ? '<div class="resume"><p>You have an unfinished attempt from ' + esc(fmtDate(prog.at)) + ".</p><button class=\"btn btn-ghost btn-sm\" data-act=\"resume\">Continue where I left off</button></div>" : "") +
      (store.get("results", {})[slug] ? '<p style="margin-top:1rem"><a href="' + resultHref(slug) + '">View your last result</a></p>' : "") +
      "</div><div>" +
      (t.showHelpFirst ? helpBox({ id: "intro", title: "If you need support now" }) :
        '<aside class="aside"><h3>Before you start</h3><p>' + (t.kind === "iq" ? "Find a quiet place. Try not to use a calculator or search engine." : "This is a screening tool, not a diagnosis. Answer based on how you’ve really been feeling, not how you think you should feel.") +
        "</p><p>Your answers stay on this device.</p></aside>") +
      "</div></div></div>");
    document.title = t.title + " | " + CFG.name;
    window.scrollTo(0, 0);
  }

  function startRun(slug, resume) {
    var t = BY[slug], its = items(t);
    var prog = resume ? store.get("prog:" + slug, null) : null;
    run = { t: t, its: its, i: 0, ans: new Array(its.length).fill(null), start: Date.now(), elapsed: 0 };
    if (prog) {
      run.ans = prog.ans; run.elapsed = prog.elapsed || 0;
      var first = run.ans.indexOf(null); run.i = first === -1 ? its.length - 1 : first;
    } else store.del("prog:" + slug);
    page("", '<div class="wrap"><div class="runner ' + (t.kind === "survey" ? "survey-run" : "") + '" id="runner"></div></div>');
    if (t.kind === "iq") startTimer();
    drawQ(true);
  }

  function elapsed() { return run.elapsed + Math.round((Date.now() - run.start) / 1000); }
  function startTimer() {
    stopTimers();
    timerId = setInterval(function () {
      var left = run.t.limit - elapsed();
      var el = document.getElementById("timer");
      if (el) { el.textContent = mmss(Math.max(0, left)); el.classList.toggle("low", left <= 60); }
      if (left <= 0) finish();
    }, 1000);
  }
  function stopTimers() { if (timerId) clearInterval(timerId); if (advanceId) clearTimeout(advanceId); timerId = advanceId = null; }
  function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }

  function drawQ(focus) {
    var t = run.t, it = run.its[run.i], n = run.its.length, box = document.getElementById("runner");
    if (!box) return;
    var answered = run.ans.filter(function (a) { return a != null; }).length;
    var pct = Math.round(100 * answered / n);
    var sel = run.ans[run.i];
    var visual = it.visual || "";
    var isVisual = !!it.html;
    var optsHtml = it.o.map(function (o, k) {
      var label = isVisual ? o[0] : esc(o[0]);
      var aria = isVisual ? ' aria-label="' + esc(it.labels[k]) + '"' : "";
      return '<button type="button" role="radio" class="opt' + (isVisual ? " opt-visual" : "") + '" aria-checked="' + (sel === k) + '" data-act="pick" data-k="' + k + '"' + aria + ' tabindex="' + (sel === k || (sel == null && k === 0) ? 0 : -1) + '"><span class="key" aria-hidden="true">' + (k + 1) + "</span>" + label + "</button>";
    }).join("");
    var stem = it.stem || t.stem || (t.kind === "iq" ? it.cat : "");
    box.innerHTML =
      '<div class="run-top"><button class="btn btn-ghost btn-sm" data-act="prev"' + (run.i === 0 ? " disabled" : "") + ">" + ICON.back.replace("<svg", '<svg width="14" height="14"') + "Back</button>" +
      '<span class="run-count" aria-live="polite">Question ' + (run.i + 1) + " of " + n + "</span>" +
      (t.kind === "iq" ? '<span class="timer" id="timer" aria-label="Time left">' + mmss(Math.max(0, t.limit - elapsed())) + "</span>" : "") +
      '<button class="linkbtn" data-act="exit">Exit</button></div>' +
      '<div class="track" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="qcard enter">' + (stem ? '<p class="stem">' + esc(stem) + "</p>" : "") +
      '<h1 class="qtext" id="qtext" tabindex="-1">' + esc(it.q) + "</h1>" + visual +
      '<div class="opts' + (isVisual || (t.kind === "iq" && it.o.length === 4) ? " grid4" : "") + '" role="radiogroup" aria-labelledby="qtext">' + optsHtml + "</div></div>" +
      '<div class="run-foot"><p class="run-hint">Tip: press 1–' + it.o.length + " to answer.</p>" +
      (run.i < n - 1 && sel != null ? '<button class="btn btn-ghost btn-sm" data-act="next">Next</button>' : "") +
      (run.i === n - 1 && sel != null ? '<button class="btn btn-primary btn-sm" data-act="finish">See my result</button>' : "") +
      (t.kind === "iq" && sel == null && run.i < n - 1 ? '<button class="linkbtn" data-act="next">Skip for now</button>' : "") +
      "</div>";
    if (focus) { var h = document.getElementById("qtext"); if (h) h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  }

  function saveProg() { store.set("prog:" + run.t.slug, { ans: run.ans, at: Date.now(), elapsed: elapsed() }); }

  function pick(k) {
    if (!run) return;
    var it = run.its[run.i];
    run.ans[run.i] = k;
    saveProg();
    drawQ(false);
    var btn = document.querySelector('.opt[data-k="' + k + '"]'); if (btn) btn.focus({ preventScroll: true });
    if (advanceId) clearTimeout(advanceId);
    if (it.o[k][2] === "end") { advanceId = setTimeout(finish, 380); return; }
    if (run.i < run.its.length - 1) advanceId = setTimeout(function () { go(1); }, 380);
    else if (run.t.kind !== "iq" || run.ans.indexOf(null) === -1) advanceId = setTimeout(finish, 480);
  }
  function go(d) {
    if (!run) return;
    if (advanceId) clearTimeout(advanceId);
    var ni = run.i + d;
    if (ni < 0 || ni >= run.its.length) return;
    run.i = ni; drawQ(true);
  }
  function finish() {
    if (!run) return;
    stopTimers();
    var t = run.t;
    if (t.kind === "iq") {
      var missing = run.ans.indexOf(null);
      if (missing !== -1 && t.limit - elapsed() > 0) {
        run.i = missing; drawQ(true);
        var foot = document.querySelector(".run-foot");
        if (foot) foot.insertAdjacentHTML("afterbegin", '<p class="run-hint" style="display:block;color:var(--danger)">Answer the remaining questions, or <button class="linkbtn" data-act="force-finish">finish now</button>.</p>');
        startTimer();
        return;
      }
    }
    var res = compute(t, run.ans, elapsed());
    var all = store.get("results", {}); all[t.slug] = res; store.set("results", all);
    var hist = store.get("history", []); hist.unshift({ slug: t.slug, date: res.date, score: res.score, label: res.band && res.band.label }); store.set("history", hist.slice(0, 100));
    store.del("prog:" + t.slug);
    run = null;
    if (CFG.mode === "spa") { history.replaceState(null, "", "#/" + t.slug + "/result"); }
    else { history.replaceState(null, "", "#result"); }
    renderResult(t, res, false);
  }

  /* ---------- result ---------- */
  function scaleHtml(t, res) {
    if (t.kind === "profile") return "";
    var ends = t.scaleEnds || ["Lower", "Higher"];
    if (t.kind === "iq" && res.estimate) {
      var lo = 70, hi = 145, segs = [[79, "Below average"], [89, "Low average"], [109, "Average"], [119, "High average"], [145, "Superior"]];
      var prev = lo - 1, cols = ["var(--t1)", "var(--t1)", "var(--t0)", "var(--t0)", "var(--t0)"];
      var bars = segs.map(function (sg, i) { var w = sg[0] - prev; var on = res.score > prev && res.score <= sg[0]; prev = sg[0]; return '<span style="flex:' + w + ";--seg:" + cols[i] + '" class="' + (on ? "on" : "") + '"></span>'; }).join("");
      prev = lo - 1;
      var leg = segs.map(function (sg) { var w = sg[0] - prev; prev = sg[0]; return '<span style="flex:' + w + '">' + sg[1] + "</span>"; }).join("");
      return '<div class="scale" aria-hidden="true"><div class="scale-marker" style="left:' + (100 * (res.score - lo) / (hi - lo)) + '%"><b>' + res.score + '</b><i></i></div><div class="scale-bar">' + bars + '</div></div><div class="scale-legend" aria-hidden="true">' + leg + "</div>";
    }
    if (!t.bands) return "";
    var max = t.kind === "iq" ? res.total : res.max, prevMax = -1;
    var parts = t.bands.map(function (b) {
      var w = Math.min(b[0], max) - prevMax; var on = res.band && res.band.label === b[2]; prevMax = b[0];
      return { w: Math.max(w, 0), tone: b[1], label: b[2], on: on };
    }).filter(function (x) { return x.w > 0; });
    var bars2 = parts.map(function (x) { return '<span style="flex:' + x.w + ";--seg:" + TONE[x.tone] + '" class="' + (x.on ? "on" : "") + '" title="' + esc(x.label) + '"></span>'; }).join("");
    var leftPct = Math.min(98, Math.max(2, 100 * (res.score + 0.5) / (max + 1)));
    return '<div class="scale" aria-hidden="true"><div class="scale-marker" style="left:' + leftPct + '%"><b>' + res.score + '</b><i></i></div><div class="scale-bar">' + bars2 + "</div></div>" +
      '<div class="scale-legend" aria-hidden="true"><span style="flex:1">' + esc(ends[0]) + '</span><span style="flex:1;text-align:right">' + esc(ends[1]) + "</span></div>";
  }

  var NEXT = [
    ["Keep doing what supports you: regular sleep, movement, and time with people you trust.", "Take this test again if things change."],
    ["Notice when these feelings show up and what helps.", "Talk to someone you trust about how you’ve been feeling.", "If this continues for more than a few weeks, see a doctor or counsellor."],
    ["Book an appointment with a doctor, psychologist or counsellor, and share this result.", "Save this page as a PDF to bring with you.", "Tell someone close to you what’s going on so you have support."],
    ["Please contact a doctor or mental health professional soon, ideally this week.", "Save this page as a PDF and share it with them.", "If you ever feel unsafe, contact a crisis line or emergency services straight away."]
  ];

  function renderResult(t, res, fromSaved) {
    var isSurvey = t.kind === "survey", isIQ = t.kind === "iq", isProfile = t.kind === "profile";
    var its = items(t);
    var crisis = (res.flags || []).filter(function (f) { return f.type === "crisis"; });
    var medical = (res.flags || []).filter(function (f) { return f.type === "medical"; });
    var tone = res.band ? res.band.tone : 0;
    var accent = (GBYID[t.group] || {}).accent || "var(--lagoon)";
    var toneColor = isSurvey || isProfile ? accent : TONE[tone];
    var headline, lead;
    if (isSurvey) {
      headline = t.slug === "self-injury-survey" ? "You’re not alone in this" : "Thanks for sharing";
      lead = "Here are some reflections based on your answers. They aren’t a diagnosis, just a starting point.";
    } else if (isProfile) {
      var sorted = res.subs.slice().sort(function (a, b) { return b.pct - a.pct; });
      headline = "Your personality profile";
      lead = "Your strongest trait is " + sorted[0].name.toLowerCase() + ", and " + sorted[sorted.length - 1].name.toLowerCase() + " is where you score lowest. Neither is better than the other.";
    } else if (isIQ) {
      headline = res.estimate ? "Estimated IQ: " + res.score : res.band.label;
      lead = "You answered " + res.correct + " of " + res.total + " questions correctly in " + mmss(Math.min(res.secs, t.limit || res.secs)) + "." +
        (res.estimate ? " Your estimate falls in the " + res.band.label.toLowerCase() + "." : " " + res.band.text);
    } else {
      headline = res.band.label;
      lead = res.band.text;
    }

    var alerts = crisis.map(function (f) {
      return '<div class="alert alert-crisis" role="alert"><h2>Please reach out now</h2><p>' + esc(f.text) + "</p></div>" + helpBox({ id: "crisis", title: "Crisis support" }) + '<div style="height:1.5rem"></div>';
    }).join("") + medical.map(function (f) { return '<div class="alert alert-medical"><h2>A note about your health</h2><p>' + esc(f.text) + "</p></div>"; }).join("");

    var hero =
      '<div class="result-hero" style="--tone:' + toneColor + '">' +
      '<p class="result-kicker"><span class="tone-dot"></span>' + esc(t.title) + (fromSaved ? ", taken " + esc(fmtDate(res.date)) : "") + "</p>" +
      "<h1 tabindex=\"-1\" id=\"rh\">" + esc(headline) + '</h1><p class="lead">' + esc(lead) + "</p>" +
      (!isSurvey && !isIQ && !isProfile ? '<p class="score-line">Your score: ' + res.score + " <span>out of " + res.max + "</span></p>" : "") +
      (isIQ ? '<p class="score-line">' + (res.estimate ? "Where your estimate sits" : "Your score: " + res.correct + " <span>out of " + res.total + "</span>") + "</p>" : "") +
      scaleHtml(t, res) +
      '<div class="result-actions"><button class="btn btn-primary" data-act="print">Save as PDF</button>' +
      '<button class="btn btn-ghost" data-act="retake">' + (isSurvey ? "Take it again" : "Retake the test") + '</button><a class="btn btn-ghost" href="' + href("results") + '">All my results</a></div></div>';

    var left = "", right = "";

    if (isProfile) {
      left += '<section class="panel"><h2>Your five traits</h2><div class="subs">' + res.subs.map(function (sb) {
        return '<div class="sub-row"><div class="sub-top"><span>' + esc(sb.name) + "</span><span>" + ["Lower", "In the middle", "Higher"][sb.lvl] + '</span></div><div class="meter"><i style="width:' + sb.pct + "%;background:" + accent + '"></i></div><p class="sub-note">' + esc(sb.desc || "") + "</p></div>";
      }).join("") + "</div></section>";
    } else if (res.subs && res.subs.length) {
      var subTitle = t.slug === "mental-health-check" ? "Your results by area" : "Breakdown";
      left += '<section class="panel"><h2>' + subTitle + '</h2><div class="subs">' + res.subs.map(function (s) {
        var p = s.m ? Math.round(100 * s.v / s.m) : 0;
        var note = "";
        if (s.hit && s.link && BY[s.link]) note = '<p class="sub-note">This area stands out. <a href="' + href(s.link) + '">Take the ' + esc(BY[s.link].title) + "</a></p>";
        else if (s.hit && s.note) note = '<p class="sub-note">' + esc(s.note) + "</p>";
        return '<div class="sub-row"><div class="sub-top"><span>' + esc(s.name) + "</span><span>" + s.v + " / " + s.m + '</span></div><div class="meter"><i class="' + (s.hit ? "hit" : "") + '" style="width:' + p + '%"></i></div>' + note + "</div>";
      }).join("") + "</div></section>";
    }

    if (isIQ) {
      left += '<section class="panel"><h2>Breakdown by skill</h2><div class="subs">' + Object.keys(res.cats).map(function (k) {
        var c = res.cats[k], p = Math.round(100 * c.c / c.n);
        return '<div class="sub-row"><div class="sub-top"><span>' + esc(k) + "</span><span>" + c.c + " / " + c.n + '</span></div><div class="meter"><i style="width:' + p + '%"></i></div></div>';
      }).join("") + "</div></section>";
      left += '<section class="panel"><h2>Review your answers</h2><dl class="answers">' + its.map(function (it, i) {
        var a = res.answers[i], ok = a === it.a;
        var ans = a == null ? "Skipped" : it.html ? it.labels[a] : it.o[a][0];
        var right = it.html ? it.labels[it.a] : it.o[it.a][0];
        return "<div><dt>" + (i + 1) + ". " + esc(it.q) + "</dt><dd>" + (ok ? "✓ " : "✗ ") + esc(ans) + (ok ? "" : ' <span class="muted">(correct: ' + esc(right) + ")</span>") + "</dd></div>";
      }).join("") + "</dl></section>";
    }

    if (isSurvey) {
      left += '<section class="panel"><h2>Reflections</h2><div class="insights">' + (res.insights || []).map(function (x) {
        return '<div class="insight" style="--tone:' + TONE[x.tone] + '"><h3>' + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div>";
      }).join("") + "</div></section>";
      left += '<section class="panel"><h2>Your answers</h2><dl class="answers">' + its.map(function (it, i) {
        if (res.answers[i] == null) return "";
        return "<div><dt>" + esc(it.q) + "</dt><dd>" + esc(it.o[res.answers[i]][0]) + "</dd></div>";
      }).join("") + "</dl>" +
      (CFG.surveyEndpoint && !fromSaved ? '<div class="no-print" style="margin-top:1.5rem"><label class="consent"><input type="checkbox" id="share-ok"><span>Share my answers anonymously to help research. No name, email or location is included.</span></label><button class="btn btn-plum btn-sm" style="margin-top:.75rem" data-act="share">Share anonymously</button><p class="small muted" id="share-msg" aria-live="polite"></p></div>' : "") +
      "</section>";
    }

    if (!isSurvey && !isIQ && !isProfile && !t.noAdvice) {
      var steps = NEXT[tone].concat(t.next || []);
      left += '<section class="panel"><h2>What you can do next</h2><ul>' + steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></section>";
    }
    if ((t.noAdvice || isProfile) && t.next) {
      left += '<section class="panel"><h2>What to take from this</h2><ul>' + t.next.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>";
    }
    if (isIQ && t.next) left += '<section class="panel"><h2>Worth knowing</h2><ul>' + t.next.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>";
    if (isIQ && res.estimate) {
      left += '<section class="panel"><h2>About this score</h2><p>' + esc("Your estimate is based on how many puzzles you solved compared with a typical adult result for a test like this. Scores can change with sleep, stress, language and practice.") + "</p></section>";
    }

    if (t.youth) right += '<section class="panel"><h2>Talking to an adult</h2><p>Not sure how to start? You could say: “I’ve been feeling really low (or worried) lately and I don’t know what to do. Can we talk?” You can show them this page too.</p></section>';
    var aboutLine = isSurvey ? "This survey is for reflection only." :
      isProfile ? "This describes tendencies, not strengths or weaknesses, and it is not a diagnosis." :
      isIQ ? "This is a practice test for curiosity. A real cognitive assessment is carried out in person by a qualified psychologist." :
      "This is a screening tool, not a diagnosis. Only a qualified professional can diagnose a condition.";
    right += '<section class="panel"><h2>About this ' + (isSurvey ? "survey" : "test") + "</h2><p>" + aboutLine + '</p><p class="source">' + esc(t.source) + "</p></section>";
    var rel = (t.related || []).filter(function (s) { return BY[s]; });
    if (rel.length) right += '<section class="panel no-print"><h2>You might also try</h2><ul class="related">' + rel.map(function (s) { return '<li><a style="--accent:' + ((GBYID[BY[s].group] || {}).accent || "#1c7a74") + '" href="' + href(s) + '">' + esc(BY[s].title) + "</a></li>"; }).join("") + "</ul></section>";

    var gRes = GBYID[t.group] || {};
    page("", '<div class="wrap result"><div class="page-head" style="padding-bottom:1rem"><a class="crumb no-print" href="' + href(gRes.slug || "") + '">' + ICON.back.replace("<svg", '<svg width="16" height="16"') + esc(gRes.name || "All tests") + "</a></div>" +
      alerts + hero + '<div class="result-grid"><div>' + left + "</div><div>" + right + "</div></div></div>");
    document.title = "Your result: " + t.title + " | " + CFG.name;
    var h = document.getElementById("rh"); if (h) h.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    app.setAttribute("data-slug", t.slug);
  }

  /* ---------- results page ---------- */
  function renderResults() {
    var all = store.get("results", {});
    var list = Object.keys(all).map(function (k) { return all[k]; }).filter(function (r) { return BY[r.slug]; }).sort(function (a, b) { return b.date - a.date; });
    var body;
    if (!list.length) {
      body = '<div class="empty"><h2>No results yet</h2><p class="muted">When you finish a test, your result appears here so you can come back to it. Results are saved only on this device.</p><a class="btn btn-primary" href="' + href("mental-health-check") + '">Start the 3-minute check</a></div>';
    } else {
      body = '<ul class="history">' + list.map(function (r) {
        var t = BY[r.slug], isS = t.kind === "survey" || t.kind === "profile", isIQ = t.kind === "iq";
        var label = t.kind === "profile" ? "Profile ready" : isS ? "Completed" : isIQ ? (r.estimate ? "Estimated IQ " + r.score : r.band.label) : (r.band ? r.band.label : "");
        var col = isS ? ((GBYID[t.group] || {}).accent || "var(--plum)") : isIQ ? "var(--t1)" : TONE[r.band ? r.band.tone : 0];
        var meter = isS ? "" : isIQ ? Math.round(100 * r.correct / r.total) : Math.round(100 * r.score / (r.max || 1));
        var crisis = (r.flags || []).some(function (f) { return f.type === "crisis"; });
        return '<li class="hist"><div><h3>' + esc(t.title) + "</h3><p>" + esc(fmtDate(r.date)) + (isS ? "" : isIQ ? ", " + r.correct + " of " + r.total + " correct" : ", score " + r.score + " of " + r.max) + (crisis ? '. <strong style="color:var(--danger)">Includes a safety concern</strong>' : "") + "</p></div>" +
          '<div><p class="tone-label"><span class="tone-dot" style="--tone:' + col + '"></span>' + esc(label) + "</p>" +
          (isS ? "" : '<div class="meter" style="margin-top:.4rem"><i style="width:' + meter + "%;background:" + col + '"></i></div>') + "</div>" +
          '<a class="btn btn-ghost btn-sm" href="' + resultHref(r.slug) + '">View result</a></li>';
      }).join("") + "</ul>" +
      '<div class="no-print" style="display:flex;flex-wrap:wrap;gap:.6rem"><button class="btn btn-primary" data-act="print">Save all as PDF</button><button class="btn btn-ghost" data-act="clear">Delete all results</button></div>';
    }
    var taken = list.length, remaining = TESTS.filter(function (t) { return !all[t.slug]; });
    page("results",
      '<div class="wrap"><div class="page-head"><h1>My results</h1><p>' + (taken ? "You’ve completed " + taken + " of " + TESTS.length + " tests. Only you can see these; they’re stored in this browser." : "Your completed tests will appear here.") + "</p></div>" + body +
      (taken && remaining.length ? '<section class="section no-print" style="padding-top:3rem"><h2>Tests you haven’t taken</h2><ul class="related">' + remaining.map(function (t) { return '<li><a style="--accent:' + ((GBYID[t.group] || {}).accent || "#1c7a74") + '" href="' + href(t.slug) + '">' + esc(t.title) + "</a></li>"; }).join("") + "</ul></section>" : '<div style="height:4rem"></div>') +
      "</div>");
    document.title = "My results | " + CFG.name;
  }

  /* ---------- category page ---------- */
  function renderCategory(g) {
    var list = testsIn(g);
    var others = GROUPS.filter(function (x) { return x.id !== g.id; });
    page("",
      '<div class="wrap"><div class="page-head"><a class="crumb" href="' + href("") + '">' + ICON.back.replace("<svg", '<svg width="16" height="16"') + "All categories</a>" +
      '<h1 style="--accent:' + g.accent + '">' + esc(g.name) + "</h1><p>" + esc(g.long) + "</p></div>" +
      '<ul class="pills" style="margin-bottom:3rem">' + list.map(pill).join("") + "</ul>" +
      '<section class="section" style="padding-top:1rem"><h2>Other categories</h2><ul class="related">' +
      others.map(function (x) { return '<li><a style="--accent:' + x.accent + '" href="' + href(x.slug) + '">' + esc(x.name) + "</a></li>"; }).join("") +
      "</ul></section></div>");
    document.title = g.name + " tests | " + CFG.name;
    window.scrollTo(0, 0);
  }

  /* ---------- help & about ---------- */
  function renderHelp() {
    page("help",
      '<div class="wrap"><div class="page-head"><h1>Get help now</h1><p>If you’re struggling, you don’t have to face it alone. These services are free and confidential.</p></div>' +
      '<div class="help-grid">' + helpBox({ id: "page", title: "Crisis lines", h1: true }) +
      '<section class="panel"><h2>If you feel unsafe right now</h2><ol class="help-steps">' +
      "<li>Call a crisis line or your local emergency number. You can also go to the nearest hospital emergency department.</li>" +
      "<li>Move away from anything you could use to hurt yourself, or ask someone to hold on to it for you.</li>" +
      "<li>Be near other people. Call or message someone you trust and tell them how you feel.</li>" +
      "<li>Slow your breathing: breathe in for 4 counts, hold for 4, and breathe out for 6. Repeat a few times.</li>" +
      "<li>Remind yourself that intense feelings pass, even when it doesn’t feel like they will.</li></ol>" +
      '<h2 style="margin-top:1.5rem">Worried about someone else?</h2><p>Ask them directly how they are, listen without judging, and help them contact a professional or crisis line. If their life is in danger, call emergency services.</p></section></div></div>');
    document.title = "Get help now | " + CFG.name;
  }
  function renderAbout() {
    page("about",
      '<div class="wrap"><div class="page-head"><h1>About, privacy and sources</h1></div><div class="prose">' +
      "<h2>What " + esc(CFG.name) + " is</h2><p>" + esc(CFG.name) + " offers free, anonymous mental health screening tests for people anywhere in the world. A screening test can show whether your experiences are similar to those of people with a particular condition. It can’t diagnose you. Please share your results with a doctor or mental health professional.</p>" +
      "<h2>Your privacy</h2><ul><li>No account or sign-up is needed.</li><li>Your answers and results are saved only in your browser’s local storage. They are not sent to any server.</li><li>You can delete everything at any time from the My results page, or by clearing your browser data.</li>" +
      (CFG.surveyEndpoint ? "<li>On survey pages, you can choose to share your answers anonymously. Nothing is shared unless you tick the box and press Share.</li>" : "") +
      "</ul><h2>Medical disclaimer</h2><p>This website is for information only and is not a substitute for professional medical advice, diagnosis or treatment. If you are in crisis, contact a crisis line or emergency services immediately.</p>" +
      '<h2>Sources</h2><ul class="sources">' + TESTS.map(function (t) { return "<li><strong>" + esc(t.title) + ":</strong> " + esc(t.source) + "</li>"; }).join("") + "</ul></div></div>");
    document.title = "About, privacy and sources | " + CFG.name;
  }
  function renderNotFound() {
    page("", '<div class="wrap"><div class="page-head"><h1>Page not found</h1><p>That page doesn’t exist. Pick a test from the full list instead.</p><a class="btn btn-primary" href="' + href("") + '">See all tests</a></div></div>');
  }

  /* ---------- router ---------- */
  function render() {
    run = null; stopTimers();
    var r = route(), parts = r.split("/");
    if (!r || r === "index") renderHome();
    else if (r === "results") renderResults();
    else if (r === "help") renderHelp();
    else if (r === "about") renderAbout();
    else if (BYG[parts[0]]) renderCategory(BYG[parts[0]]);
    else if (BY[parts[0]]) renderTest(parts[0], parts[1] === "result");
    else renderNotFound();
    if (!BY[parts[0]]) {
      document.title = r === "" || r === "index" ? CFG.name + ": free mental health tests" : document.title;
      window.scrollTo(0, 0);
    }
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");
    var slug = currentSlug();
    switch (act) {
      case "theme":
        store.set("theme", isDark() ? "light" : "dark"); applyTheme();
        el.innerHTML = isDark() ? ICON.sun : ICON.moon;
        el.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
        break;
      case "seed":
        store.set("seed", { slug: "mental-health-check", k: +el.getAttribute("data-k"), at: Date.now() });
        if (CFG.mode === "spa") { location.hash = "#/mental-health-check"; }
        else { location.href = href("mental-health-check"); }
        break;
      case "to-tests": document.getElementById("tests").scrollIntoView(); var q = document.getElementById("q"); if (q) q.focus({ preventScroll: true }); break;
      case "start": startRun(slug, false); break;
      case "resume": startRun(slug, true); break;
      case "retake": store.del("prog:" + slug); if (CFG.mode === "spa") history.replaceState(null, "", "#/" + slug); else history.replaceState(null, "", location.pathname); startRun(slug, false); break;
      case "pick": pick(+el.getAttribute("data-k")); break;
      case "prev": go(-1); break;
      case "next": go(1); break;
      case "finish": finish(); break;
      case "force-finish": if (run) { run.t = Object.assign({}, run.t, { limit: 0 }); finish(); } break;
      case "exit": stopTimers(); run = null; renderTest(slug, false); break;
      case "print": window.print(); break;
      case "clear":
        if (el.getAttribute("data-armed")) { store.del("results"); store.del("history"); TESTS.forEach(function (t) { store.del("prog:" + t.slug); }); renderResults(); }
        else { el.setAttribute("data-armed", "1"); el.textContent = "Press again to delete everything"; el.classList.add("btn-danger"); }
        break;
      case "share": shareSurvey(slug); break;
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target.matches('[data-act="country"]')) {
      store.set("country", e.target.value);
      var id = e.target.id, box = e.target.closest(".helpbox");
      var title = box.querySelector("h2,h3").textContent, isH1 = box.querySelector("h2") !== null;
      var tmp = document.createElement("div");
      tmp.innerHTML = helpBox({ id: id.replace("hc-", ""), title: title, h1: isH1 });
      box.replaceWith(tmp.firstChild);
      var sel = document.getElementById(id); if (sel) sel.focus();
    }
  });
  document.addEventListener("input", function (e) {
    if (!e.target.matches('[data-act="search"]')) return;
    var term = e.target.value.trim().toLowerCase(), any = false;
    var catsEl = document.getElementById("cats"), listEl = document.getElementById("results-list");
    if (catsEl && listEl) { catsEl.hidden = !!term; listEl.hidden = !term; }
    document.querySelectorAll("[data-group]").forEach(function (g) {
      var shown = 0;
      g.querySelectorAll("li[data-search]").forEach(function (li) { var ok = !term || li.getAttribute("data-search").indexOf(term) !== -1; li.hidden = !ok; if (ok) shown++; });
      g.hidden = !shown; if (shown) any = true;
    });
    var em = document.querySelector(".empty-search"); if (em) em.hidden = any;
  });
  document.addEventListener("keydown", function (e) {
    if (!run || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches("input, select, textarea")) return;
    var n = parseInt(e.key, 10);
    var it = run.its[run.i];
    if (n >= 1 && n <= it.o.length) { e.preventDefault(); pick(n - 1); }
    else if (e.key === "ArrowLeft" && !e.target.matches(".opt")) { go(-1); }
    else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.target.matches(".opt")) {
      e.preventDefault();
      var btns = Array.prototype.slice.call(document.querySelectorAll(".opt"));
      var idx = btns.indexOf(e.target) + (e.key === "ArrowDown" ? 1 : -1);
      if (btns[idx]) btns[idx].focus();
    }
  });
  function currentSlug() {
    if (run) return run.t.slug;
    var r = route().split("/")[0];
    return BY[r] ? r : app.getAttribute("data-slug");
  }
  function shareSurvey(slug) {
    var ok = document.getElementById("share-ok"), msg = document.getElementById("share-msg");
    if (!ok || !ok.checked) { if (msg) msg.textContent = "Tick the box first to confirm you want to share."; return; }
    var t = BY[slug], res = store.get("results", {})[slug], its = items(t);
    var payload = { survey: slug, date: new Date(res.date).toISOString().slice(0, 10), answers: its.map(function (it, i) { return { q: it.q, a: res.answers[i] == null ? null : it.o[res.answers[i]][0] }; }) };
    fetch(CFG.surveyEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { msg.textContent = r.ok ? "Shared. Thank you for helping." : "Sharing didn’t work. Your answers are still saved on this device."; })
      .catch(function () { msg.textContent = "Sharing didn’t work. Check your connection and try again."; });
  }

  window.addEventListener("hashchange", function () {
    if (CFG.mode === "spa" || location.hash === "#result") render();
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) render(); });
  render();
})();
