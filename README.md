# NPAT

A small, responsive browser game for **Name, Place, Things, Animal**. Choose a letter (or let the game pick one), set the countdown, and enter one answer for each category. The built-in A–Z word bank has a sample for every category and letter.

## Run locally

This is a dependency-free static site. From the repository root, run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://localhost:8000` in a browser.

## Deploy on GitHub Pages

This is a dependency-free static site, so it can be published without a build step. For the simplest setup, push or merge to `main`, then in GitHub open **Settings → Pages** and choose **Deploy from a branch**, branch **main**, folder **/(root)**.

A GitHub Actions workflow template is included as `deploy-pages.yml`. If you prefer Actions-based deployment, move it to `.github/workflows/deploy-pages.yml`, then set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The template deploys automatically on pushes to `main` once it is in that workflow folder.

The site's CSS and JavaScript use relative paths, so it works at a project URL such as `https://<owner>.github.io/NPAT/` or on a custom domain.
