# DeskDrop

DeskDrop is a Next.js application scaffold. It requires Node.js 22.6.0 or newer and npm.

## Setup and run

From the repository root, install dependencies from the lockfile and start the development server:

```sh
npm ci
npm run dev
```

For the QA production server, run:

```sh
scripts/qa/setup.sh
scripts/qa/start.sh
```

The QA scripts can be run from any working directory. The server listens on `0.0.0.0:3100`; open `http://localhost:3100/` and stop it with Ctrl-C.

## Checks

```sh
npm run typecheck
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

The Playwright test builds and starts its own server. It uses port 3100 by default; set `PLAYWRIGHT_PORT` to choose a different free port.
