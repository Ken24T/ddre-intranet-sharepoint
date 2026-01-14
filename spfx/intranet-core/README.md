# intranet-core

## Summary

This SPFx solution provides the "Intranet Shell" web part used as the baseline shell for DDRE intranet pages.

## Technology

- SharePoint Framework 1.22.1
- React 17
- Fluent UI 8
- Heft build pipeline

## Web Parts

- IntranetShell: renders the shell layout and shows an environment banner; includes a configurable description property.

## Version

- Solution version: 0.0.12 (package-solution 0.0.12.0)

## Prerequisites

- Node.js 22.14.x (per `package.json` engines)

## Local development

```
npm install
npm run start
```

## Build package

```
npm run build
```

## Notes

- Client-side only; external APIs must go via approved Azure proxies.
- Keep `package.json` and `config/package-solution.json` versions in sync.
