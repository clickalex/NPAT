# NPAT

A small, responsive browser game for **Name, Place, Things, Animal**. Pick a letter, race the clock, and find an answer for each category—or customize the categories to make your own round.

## Features

- Solo or same-device pass-and-play for 2–6 teams, with cumulative scores and unique-answer bonuses.
- Shareable room codes that copy a letter, timer, categories, team names, and house rules. Room codes share setup only; they do not sync live answers between devices.
- Easy, tricky, or surprise random letters; custom timer lengths; saved favorite timers and house rules.
- Four or more rotating ideas per letter and category, regional name/place browsing, and a personal saved-ideas collection.
- Installable progressive web app with an offline app shell after the first visit.
- Keyboard shortcuts and screen-reader announcements for key timer moments.

Settings, saved words, and favorite timers are stored locally in the browser using `localStorage`. Group answers and cumulative match scores stay in the current page session and clear if the page is reloaded; no answers are sent to a server.

## Run locally

This is a dependency-free static site. From the repository root, run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://localhost:8000` in a browser. The service worker and install prompt work on localhost or HTTPS. The feature overview is at `http://localhost:8000/future-enhancements.html`.

## Deploy on GitHub Pages

This is a static site and needs no build step. GitHub Pages is configured to use **GitHub Actions** and publishes at [clickalex.github.io/NPAT](https://clickalex.github.io/NPAT/). A complete workflow is prepared at the repository root as `deploy-pages.yml`; before merging, manually move it to `.github/workflows/deploy-page.yml` (replacing the existing workflow) so pull requests are validated and the full app shell—including the PWA manifest, service worker, and icons—is published. GitHub only runs workflows stored under `.github/workflows/`.

For branch-based deployment instead, set **Settings → Pages → Build and deployment → Source** to **Deploy from a branch**, then select branch **main** and folder **/(root)**. The site's relative asset paths work at project URLs and custom domains.
