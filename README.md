# MindBearing: free mental health tests

A static website with 33 tests in 11 categories: mental health screening, personality, IQ and reasoning, reflective surveys, and a just-for-fun astrology test.
No backend and no database. Everything runs in the browser, and results are saved in the visitor's own browser (localStorage).

## Deploy

Upload the contents of this folder to any static host:

- **Netlify / Cloudflare Pages:** drag and drop the folder.
- **Vercel:** `vercel deploy` from this folder.
- **GitHub Pages:** push the folder to a repo and turn on Pages.

## Pages

URLs are extensionless: each page lives in its own folder as `index.html` (e.g. `depression-test/index.html`, served at `/depression-test/`), so links work with no `.html` and no server rewrite rules needed on any static host. `index.html` and `404.html` stay at the root, since hosts look for those by convention.

- Home: all 11 categories.
- One page per category, e.g. `mood-tests/`, `personality-tests/`, `iq-and-brain-tests/`.
- One page per test, e.g. `depression-test/`, `big-five` is `personality-test/`, `iq-test/`.
- `results/`, `help/`, `about/`, and `404.html` at the root.

### Categories

General wellbeing (4) · Mood (3) · Anxiety and fear (4) · Attention and perception (2) · Habits and body (4) · Self and relationships (4) · Personality (3) · IQ and brain tests (3) · Young people (2) · Surveys (3) · Just for fun (1).

## Before you launch

1. **Domain and name:** done — the site is branded as MindBearing at `https://mindbearing.com` throughout the `.html` files, `sitemap.xml`, `robots.txt` and `assets/config.js`. If this ever changes again, update `name` and `key` in `assets/config.js`, then find and replace the old domain and brand name across the `.html` files.
2. **Crisis lines:** check every number in `HELPLINES` near the bottom of `assets/data.js`. Numbers change, and they must be correct.
3. **Clinical review:** have a qualified mental health professional review the questions, result wording and thresholds.
4. **Legal:** add a privacy policy and terms suited to your country. Google Tag Manager (`GTM-NCL3FZSQ`) is installed on every page and disclosed on the About page; if you add further analytics, ads, or cookies that need consent under your country's law (e.g. GDPR), add a cookie-consent banner and update the privacy text in `assets/app.js` (the "About" page) to match.

## Sources and licences

| Test | Instrument | Licence |
|---|---|---|
| Depression | PHQ-9 | Free to reproduce (Pfizer) |
| Anxiety | GAD-7 | Free to reproduce (Pfizer) |
| PTSD | PC-PTSD-5 | Public domain (US VA) |
| Postpartum | EPDS | Free with author citation |
| Parent test | PSC-17 | Free to use (MGH) |
| All others, surveys, IQ | Written for this site | Not validated |
| Astrology | Traditional zodiac associations | Entertainment only, not a psychological instrument |

Tests marked "written for this site" are self-reflection checks, not validated instruments. If you want validated tools for those areas (for example ASRS for ADHD, SPIN for social anxiety, PGSI for gambling), check each licence first, since several require permission.

## Collecting survey answers (optional)

The three surveys keep answers on the device by default. To collect anonymous answers, create a form endpoint at Formspree, Getform or similar and put the URL in `surveyEndpoint` in `assets/config.js`. A consent checkbox then appears on survey results, and nothing is sent unless the visitor ticks it.

## Adding a test or category

Everything is driven by `assets/data.js`.

- **New test:** copy an existing object in `TESTS`, change `slug`, `title`, `items` and `bands`, and set `group` to a category id.
- **New category:** add an object to `GROUPS` with `id`, `slug`, `name`, `desc`, `long` and `accent` (any hex colour), then point tests at its `id`. It appears on the home page automatically.
- **Test types:** `check` (scored with bands), `iq` (right or wrong answers, add `estimate: true` for an IQ score and `limit` in seconds for a timer), `profile` (trait profile, no total), `survey` (no score, `insights` function).

Then create the matching page by copying any test's `index.html` into a new folder named after the slug, and changing its `data-route`, title and description. Add its URL to `sitemap.xml` too.
