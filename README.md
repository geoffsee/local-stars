# Local Stars

Interactive Three.js map of the Sun and its stellar neighborhood, with **distances to scale**.

Inspired by classic 2D “local stars” diagrams (Proxima, Sirius, Tau Ceti, Barnard’s Star, …), this is a navigable 3D view using real equatorial coordinates and light-year distances.

## Run

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
bun run build
```

Static output lands in `dist/` (relative asset paths, fine for GitHub Pages project sites).

## Deploy (GitHub Pages)

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds with Bun and deploys `dist/` to GitHub Pages.

One-time repo setup:

1. **Settings → Pages → Build and deployment → Source**: **GitHub Actions**
2. Ensure the `github-pages` environment is allowed for Actions (default on public repos)

The site will be available at `https://<user>.github.io/<repo>/` after the first successful run.

You can also trigger a deploy manually: **Actions → Deploy to GitHub Pages → Run workflow**.

## Features

- **~45 nearby stars** within ~20 light-years (catalog in `src/data/nearbyStars.ts`)
- Positions from RA / Dec / distance → Cartesian (1 unit = 1 ly)
- Spectral-type colors (G yellow, K orange, M red, A/F blue-white)
- Distance rings at 5 / 10 / 15 / 20 ly
- Orbit controls, clickable stars, detail panel
- Radius slider, labels, link-lines toggles

## Scale note

**Distances** are true to scale. **Star sizes** are exaggerated for visibility — at true physical scale every star would be smaller than a pixel across light-year baselines.

## Stack

Bun · React · Three.js · React Three Fiber · Drei
