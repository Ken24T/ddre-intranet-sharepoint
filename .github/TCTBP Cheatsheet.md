# DDRE Intranet TCTBP Cheatsheet

Short operator reference for the DDRE Intranet SHIP and sync workflows.

Use this file for the quick view.
Use [TCTBP Agent.md](TCTBP%20Agent.md) for the full workflow rules and guard rails.

## Core Rule

- No code is ever lost while syncing local and remote state.
- Do not use destructive shortcuts as part of normal workflow execution.
- If a workflow hits divergence, ambiguity, or a failed invariant, it should stop rather than guess.

## Repo Gates

Repo gates for this repository:

- Format check: `cd spfx/intranet-core && npm run format:check`
- Test: `cd spfx/intranet-core && npm test`
- Lint: `cd spfx/intranet-core && npm run lint`
- Normal build gate: `cd spfx/intranet-core && npm run build`
- Runtime or deployment build: `cd spfx/intranet-core && npm run build`

## Triggers

### `ship` / `ship please` / `shipping` / `prepare release`

Purpose:
Formal shipped version workflow.

Attempts to:

- preflight the repo state
- show a concise origin-vs-local snapshot before mutating anything
- run verification gates
- confirm zero problems
- assess docs impact and release-note impact
- bump versions when required
- commit the release changes
- create the version tag
- push the current branch

Use when:

- you want a formal shipped version
- version and tag state needs to be updated
- the repo should be recorded as a release milestone

Notes:

- Patch bump happens on every ship unless the changes are docs-only or infrastructure-only.
- Minor bump happens on the first ship of `feature/` and `app/` branches.
- This repo keeps user-facing release notes in `spfx/intranet-core/src/webparts/intranetShell/components/data/releaseNotes.ts`, not `CHANGELOG.md`.
- Stops if the branch is dirty, missing an upstream, behind origin, or diverged from origin.

### `handover` / `handover please`

Purpose:
Safely checkpoint and sync the active work branch so development can continue on another machine.

Attempts to:

- preserve dirty work without losing it
- stage and commit when needed
- run verification appropriate to the change type
- assess docs impact before committing
- ship when the branch needs a release milestone
- merge into the default branch only when that local workflow is explicitly in scope
- push the relevant branch, default branch, and tags when the workflow requires it
- verify the resulting sync state before finishing

Notes:

- Never uses reset, rebase, destructive checkout, or force-push as part of normal sync.
- Code-loss safeguards such as safety tags and merge deletion audits still apply.

### `resume` / `resume please`

Purpose:
Restore a safe working baseline on another machine after a prior handover.

Attempts to:

- fetch current remote state
- detect and check out the correct work branch
- fast-forward local branches safely
- verify local and remote branch sync
- run the required verification gates before continuing work

Notes:

- This is a read-only recovery workflow. It never pushes.

### `deploy` / `deploy please`

Purpose:
Build the packaged SPFx solution and deploy it to the SharePoint App Catalog.

Attempts to:

- require a clean, synced branch
- run verification gates
- review deployment-impact documentation
- build `spfx/intranet-core/sharepoint/solution/intranet-core.sppkg`
- upload and deploy the package through the SharePoint App Catalog process
- validate the deployed result on a target site/page

Repo-specific deploy target:

- SharePoint Online App Catalog deployment of `intranet-core.sppkg`

Current deploy policy:

- `requireCleanTree: true`
- `requireSyncedBranch: true`
- `requireShipFirst: false`
- `migrationCommand: null`

### `status` / `status please`

Purpose:
Read-only operator snapshot of branch state, sync status, tags, and recommended next steps.

Use when:

- you want to know whether `resume`, `ship`, `handover`, or `abort` is needed before doing anything else

Notes:

- Shows a fuller `Origin`, `Local`, `Status`, `Action(s)` summary.
- Includes branch state, default-branch state, tag state, ahead/behind counts, working tree, and whether ship or resume/handover is recommended.

### `abort`

Purpose:
Inspect and recover from a partially completed SHIP, sync, or deploy workflow.

Use when:

- a prior workflow stopped part-way through
- version, tag, merge, or push state looks inconsistent
- branch sync state and release state disagree
- a version bump, release note update, or tag exists without the rest of the release state

Recovery expectations:

- inspect concrete partial states before proposing action
- preserve unpushed work before cleanup when needed
- never rewrite history or force-push without explicit extra confirmation

### `branch <new-branch-name>`

Purpose:
Close out current work cleanly and start the next branch.

Safety expectation:

- never discards local work to complete the transition
- never uses stash, reset, rebase, force-push, or destructive checkout as part of the branch workflow
- requires branch safety checks before merge or cleanup

## Docs Impact Reminder

Review docs when the change touches:

- user-visible features
- UI or interaction
- config or settings
- packaging or metadata
- roadmap or status

Repo-specific docs commonly reviewed:

- `README.md`
- `PLAN.md`
- `docs/runbooks/release.md`
- `docs/runbooks/how-to-deploy.md`
- `.github/TCTBP Agent.md`
- `.github/TCTBP Cheatsheet.md`
- `.github/copilot-instructions.md`

## Deployment Notes

- The build artefact is `spfx/intranet-core/sharepoint/solution/intranet-core.sppkg`.
- Deployment happens through the SharePoint App Catalog, not by copying files into the repo.
- Post-deploy validation should confirm the app is available on the target site and that the web part loads correctly.

## Approval Model

- `ship` may create local commit and tag state as part of the workflow.
- `handover` grants approval to push the branch, default branch, and relevant tags for that workflow only.
- `deploy` grants approval to run the repo-defined deployment steps for that workflow only.
- Any other remote push still requires explicit approval unless already covered by the active workflow.

## Quick Choice

- Need a release version or tag: use `ship`
- Need to stop on one machine and continue on another: use `handover`
- Need to restore the working branch on another machine: use `resume`
- Need the packaged SPFx solution built and deployed: use `deploy`
- Need a quick repo state check: use `status`
- Need to recover from partial workflow state: use `abort`