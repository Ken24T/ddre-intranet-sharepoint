# DDRE Intranet (SharePoint Online)

This repository contains scaffolding and source for the DDRE Intranet, delivered on SharePoint Online using SharePoint Framework (SPFx) with TypeScript + React.

## Repo Structure

- `.github/` – project instructions and (later) CI workflows
- `docs/` – architecture, governance, runbooks, and integration notes
- `contracts/` – API contract placeholders (OpenAPI/schemas) for Azure proxy services
- `scripts/` – helper scripts (no secrets)
- `spfx/` – SPFx solution (generated scaffolding will live here)

## Development Prerequisites

- Node.js: The SPFx solution under `spfx/` is generated with the Microsoft 365 SPFx Yeoman generator and requires a supported Node version.
- Node.js: Use the Node version specified by the SPFx solution (see `spfx/ddre-intranet/.nvmrc`). This project currently targets Node 22.14.x via `nvm-windows`.
- npm is the package manager for this repo.

## Project Instructions

See `.github/copilot_instructions.md`.
