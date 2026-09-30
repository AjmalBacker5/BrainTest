# Unfold: free mental health tests

A static website with 33 tests in 11 categories: mental health screening, personality, IQ and reasoning, reflective surveys, and a just-for-fun astrology test.
No backend and no database. Everything runs in the browser, and results are saved in the visitor's own browser (localStorage).

## Deploy

Upload the contents of this folder to any static host:

- **Netlify / Cloudflare Pages:** drag and drop the folder.
- **Vercel:** `vercel deploy` from this folder.
- **GitHub Pages:** push the folder to a repo and turn on Pages.

## Pages

- Home: all 11 categories.
- One page per category, e.g. `mood-tests.html`, `personality-tests.html`, `iq-and-brain-tests.html`.
- One page per test, e.g. `depression-test.html`, `big-five` is `personality-test.html`, `iq-test.html`.
- `results.html`, `help.html`, `about.html`, `404.html`.

### Categories

General wellbeing (4) · Mood (3) · Anxiety and fear (4) · Attention and perception (2) · Habits and body (4) · Self and relationships (4) · Personality (3) · IQ and brain tests (3) · Young people (2) · Surveys (3) · Just for fun (1).

## Before you launch

1. **Domain:** find and replace `https://example.com` in all `.html` files, `sitemap.xml` and `robots.txt`.
2. **Name:** the brand name "Unfold" is a placeholder. Change `name` in `assets/config.js`, then find and replace "Unfold" in the `.html` files (page titles).
3. **Crisis lines:** check every number in `HELPLINES` near the bottom of `assets/data.js`. Numbers change, and they must be correct.
4. **Clinical review:** have a qualified mental health professional review the questions, result wording and thresholds.
5. **Legal:** add a privacy policy and terms suited to your country. If you add analytics or ads, update the privacy text in `assets/app.js` (the "About" page), since it currently says nothing is tracked.

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

Then create the matching page by copying any test `.html` file and changing its `data-route`, title and description. With Python and Node installed, `python3 build.py` regenerates every page, the sitemap and the single-file preview.
