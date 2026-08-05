# Sujatha Caterers — Web App

Customer-facing React app for Sujatha Caterers: browse the catering menu,
build an order across four packages, order meal boxes, and track past orders.

Built with **Vite + React 19 + Tailwind 4**.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

The app needs the API running — see `../sujatha-backend`.

## Environment

Variables keep the `REACT_APP_` prefix from the app's Create React App days;
`vite.config.js` maps them onto `process.env` so existing call sites keep
working without edits.

```
REACT_APP_API_URL
REACT_APP_FIREBASE_API_KEY, _AUTH_DOMAIN, _PROJECT_ID,
  _STORAGE_BUCKET, _MESSAGING_SENDER_ID, _APP_ID, _VAPID_KEY
REACT_APP_MEASUREMENT_ID
```

## Layout

```
src/pages/          one file per route
src/components/     shared components
src/components/ui/  design-system primitives (Button, Field, PageShell, …)
src/utils/          contexts, pricing, cart rules, serviceability
src/data/           business details, testimonials, menu fixtures
src/index.css       Tailwind entry + design tokens (@theme)
```

There is no `src/css/` — every page is on Tailwind and Preflight is enabled.
Colours, fonts, shadows and motion are defined once in the `@theme` block of
`src/index.css`; use those tokens (`bg-sand-50`, `text-brand-600`,
`font-display`) rather than raw hex.

## Related repos

| | |
| --- | --- |
| API | `../sujatha-backend` |
| Admin portal | `../sc-admin` |
| Mobile app | `~/Documents/FlutterProjects/sujatha_caterers` |

Business rules — package limits, per-plate pricing, serviceable pincodes —
live in `src/utils/`. **This app is the source of truth for them.** The
Flutter app mirrors the same numbers and has drifted before, so port changes
web → mobile, never the reverse.

## Deploying

`npm run build` emits to `build/`.
