# Release / Versioning

This repo uses the TCTBP workflow described in `.github/copilot_instructions.md`.

Policy:

- Tags are `vX.Y.Z`.
- The tag version and the solution/app version must match `X.Y.Z`.

## Automated Release (Recommended)

Run releases from whatever branch you are working on. The release process
must not merge anything into `main` unless you explicitly request a merge.

From the repo root:

```powershell
./scripts/release.ps1 -Bump patch
```

Optional flags:

- `-Bump patch|minor|major` (default `patch`)
- `-Message "chore(release): vX.Y.Z"` to override the commit message
- `-DryRun` to show the planned version/tag without changing files or git state
- `-Yes` to skip the confirmation prompt

What it does:

- Runs SPFx gates: `format:check`, `lint`, `typecheck`, `test`, `build`
- Bumps versions in:
  - `spfx/intranet-core/package.json`
  - `package-lock.json`
  - `config/package-solution.json`
- Commits, tags `vX.Y.Z`, pushes the commit and tag to the configured remote

## Release Artifacts

On tag pushes (e.g., `v0.0.8`), GitHub Actions builds and uploads the
`.sppkg` as a workflow artifact.
