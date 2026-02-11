# Local Development

## Prereqs

- Node.js (via nvm-windows recommended)
  - Use Node `22.14.x` for the current SPFx scaffold.
- npm

## Setup

From the SPFx solution folder:

- `cd spfx/intranet-core`
- `npm install`

This installs dependencies for **all web parts** (Intranet Shell, Marketing Budget,
and any future apps). There is only one `package.json` and one `node_modules`.

## Run (Workbench)

- `npm run start`

This runs the SPFx workbench dev server and lets you test any web part locally.
All registered web parts appear in the workbench toolbox.

## Build (CI-style)

- `npm run build`

This performs a production build and packages the solution. The output `.sppkg`
contains all web parts.

## Test

- `npm run test`

Runs Jest unit tests for **all** web parts in one pass.

## Lint

- `npm run lint`

Lints all web parts. Zero-warnings policy.

## Adding a New App / Web Part

See `spfx/README.md` for the full checklist. In brief:

1. Create `src/webparts/<camelCaseName>/` with the standard folder structure
2. Register the bundle and localised resources in `config/config.json`
3. Run `npm run test` → `npm run build` to verify

## Optional: Standalone Dev Harness (Vite)

Some apps may have a lightweight Vite dev harness for rapid UI iteration
without the heavier SPFx build. For example, `spfx/marketing-budget/dev/`
imports directly from the intranet-core source tree. These are optional
and don't require their own `npm install` in intranet-core.
