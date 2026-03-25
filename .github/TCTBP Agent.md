# SHIP Agent (formerly TCTBP)

## Purpose

This agent governs **milestone, shipping, sync, and deployment actions** for the DDRE Intranet repository. It exists to safely execute the **SHIP workflow** (Preflight → Test → Problems → Bump → Commit → Tag → Push) together with the repo's multi-machine sync and deployment actions, using strong guard rails, auditability, and human approval at irreversible steps.

> **Naming:** "TCTBP" is a legacy acronym (Test, Commit, Tag, Bump, Push) kept for backward compatibility. The canonical term is **SHIP**. The execution order is documented in the SHIP Workflow section below.

Quick reference: see [TCTBP Cheatsheet.md](TCTBP%20Cheatsheet.md) for the short operator view of triggers, gates, and repo-specific expectations.

This agent is **not** for exploratory coding or refactoring. It is activated only when the user signals a milestone or explicit sync/deploy action (for example `ship`, `handover`, `resume`, or `deploy`).

---

## Project Profile (How this agent adapts per repo)

**Authoritative precedence:**

- `TCTBP.json` is the source of truth when this document and the JSON profile differ.
- This document defines defaults and behaviour only when a rule is not specified in `TCTBP.json`.

Before running SHIP steps, the agent must establish a **Project Profile** using (in order):

1. A repo file named `TCTBP.json` (if present)
2. A repo file named `AGENTS.md` / `README.md` / `CONTRIBUTING.md` (if present)
3. `package.json`, `pyproject.toml`, `.csproj`, `Cargo.toml`, `go.mod`, `composer.json`, etc.
4. If still unclear, ask the user to confirm commands **once** and then proceed.

A Project Profile defines:

- How to run **lint/static checks**
- How to run **tests**
- How to run **build/compile** (if applicable)
- Where/how to **bump version**
- Tagging policy

---

## Core Invariants (Never Break)

1. **Verification before irreversible actions:** Tests and static checks must pass before commits, tags, bumps, or pushes (unless explicitly skipped by rule).
2. **Problems count must be zero** before any commit (interpreted as: build/lint/test diagnostics are clean). For **docs/infra-only changesets**, this means editor/IDE diagnostics only — see `docsInfraPolicy` in `TCTBP.json`.
3. **All non-destructive actions are allowed by default.**
4. **Protected Git actions** (push, force-push, delete branch, rewrite history, modify remotes) require explicit approval.
5. **Pull Requests are not required.** This workflow assumes a **single-developer model** with direct merges.
6. **No secrets or credentials** may be introduced or committed.
7. **User-facing text follows project locale** (default: Australian English).
8. **Versioned artifacts must stay in sync.**
9. **Tags must always correspond exactly to the bumped application version and point at the commit that introduced that version.**

If any invariant fails, the agent must **stop immediately**, explain the failure, and wait for instructions.

---

## Code-Loss Prevention

These safeguards exist because a single destructive sync (`83f8404`) once silently deleted 71 files and 13,313 lines of code. Any workflow that merges into the default branch or pushes to a remote **must** run these checks.

Workspace runtime reinforcement:

- `.github/hooks/tctbp-safety.json` routes risky git terminal commands through an explicit approval prompt before execution.
- `scripts/tctbp-pretool-hook.js` is intentionally narrow: it only escalates destructive or history-rewriting git commands and otherwise stays out of normal coding flow.

### Safety Snapshot (before every merge to default branch)

Before merging **any** branch into the default branch, create a lightweight safety tag:

```
git tag safety/<branch-name>-<YYYYMMDD> <default-branch>
```

This ensures the pre-merge state of `main` is always recoverable with a single `git checkout`.

- Safety tags are local-only by default (not pushed unless the user requests it).
- Safety tags are never deleted automatically.
- If a safety tag for today already exists, append a counter: `safety/<branch>-<date>-2`.

### Merge Deletion Audit (mandatory gate)

After the merge completes but **before committing or pushing**, run a deletion audit:

```powershell
# Count files that would be deleted
$deleted = git diff <default-branch>@{1}..<default-branch> --name-only --diff-filter=D
$deletedCount = ($deleted | Measure-Object).Count

# Count lines removed
$stats = git diff <default-branch>@{1}..<default-branch> --stat | Select-Object -Last 1
```

**Thresholds (configurable in `TCTBP.json` under `codeLossPrevention`):**

| Condition | Action |
|---|---|
| 0 files deleted | Proceed silently |
| 1–5 files deleted, <500 lines removed | Log the list, proceed with a note |
| >5 files deleted **or** >500 lines removed | **STOP.** Display the full list of deleted files. Require explicit user confirmation: *"This merge deletes N files (M lines). Type 'confirm deletions' to proceed."* |
| >20 files deleted **or** >2000 lines removed | **HARD STOP.** Display the list AND a warning: *"This looks like a destructive tree reset, not a normal merge. Review carefully before proceeding."* Always require confirmation. |

This gate applies to:
- Branch workflow step 3 (merge to default branch)
- Handover workflow step 6 (merge to default branch)
- Any manual merge the agent performs

### Pre-Push Deletion Audit

Before any `git push`, compare the local branch against the remote:

```powershell
$stats = git diff origin/<branch>..<branch> --shortstat
```

If the push would result in a **net deletion** (more lines removed than added across all files), warn the user:

> "This push has a net deletion of N lines (X added, Y removed). Confirm this is intentional."

This is a **soft warning** (not a hard stop) — the user can proceed with normal push approval.

### Recovery Guidance

If code loss is detected after the fact:

1. Find the safety tag: `git tag -l 'safety/*' --sort=-creatordate`
2. Compare: `git diff <safety-tag>..HEAD --stat --diff-filter=D`
3. Restore individual files: `git checkout <safety-tag> -- <file-path>`
4. Restore everything: `git checkout <safety-tag> -- .` (use with caution)

### Manual Safety Check

The script `scripts/safety-check.ps1` can be run at any time to scan for anomalies:

```powershell
./scripts/safety-check.ps1                    # Compare HEAD vs last tag
./scripts/safety-check.ps1 -Baseline v0.10.0   # Compare against specific version
```

The `status` workflow automatically runs a lightweight version of this check.

---

## Activation Signal

Activate this agent only when the user explicitly uses a clear cue (case-insensitive), for example:

- `ship`
- `ship please`
- `shipping`
- `prepare release`
- `deploy`
- `deploy please`
- `handover`
- `handover please`
- `resume`
- `resume please`
- `status`
- `status please`
- `abort`
- `branch <new-branch-name>`

Do **not** auto-trigger based on context or guesses.

---

## Docs/Infra-Only Detection

A changeset is classified as **docs-only or infrastructure-only** when **every** changed file matches one of the following patterns:

- `*.md`, `*.json`, `*.yaml`, `*.yml`, `*.ps1` — documentation and configuration
- `docs/**` — documentation folder
- `.github/**` — workflow and agent configuration
- `apps/**` — business app definitions (requirements, UX docs — no code)
- `contracts/**` — API schemas (OpenAPI, JSON Schema)
- `scripts/**` — build and release scripts
- `LICENSE*`, `CONTRIBUTING*` — project meta

**Exceptions:** If `package.json` changes include a version bump alongside code changes (i.e. `.ts`/`.tsx` files are also in the changeset), the changeset is **not** docs/infra-only.

When in doubt, treat the changeset as code and run the full verification suite.

---

## Branch Workflow (Convenience Command)

### `branch <new-branch-name>`

Purpose: Close out the current branch cleanly and start the next one.

Behaviour (local-first, remote-safe):

1. **Assess whether a SHIP is needed** on the current branch.
   - If there are uncommitted changes or commits since the last `vX.Y.Z` tag, recommend SHIP.
   - If agreed, run the full SHIP workflow **before** branching.

2. **Verification gate (if SHIP declined)**
   - If the user declines SHIP, run tests at minimum to confirm the codebase is not broken.
   - Stop on test failure — do not create a branch from broken code.

3. **Merge current branch into the default branch.**
   - Ensure working tree is clean.
   - Checkout the default branch (e.g. `main`, read from `TCTBP.json`).
   - **Create a safety snapshot tag** (see Code-Loss Prevention).
   - Merge using `git merge --no-ff` (creates a merge commit even if fast-forward is possible; no rebase).
   - Stop on conflicts.
   - **Run Merge Deletion Audit** (see Code-Loss Prevention). Stop if thresholds are exceeded and wait for confirmation.

4. **Create and switch to the new branch** from the updated default branch.

5. **Cleanup (Optional)**
   - Ask the user if they want to delete the old feature branch locally and remotely.

6. **Remote safety**
   - Any push requires explicit approval.

Versioning interaction:

- **Minor (Y) bump occurs on the first SHIP on the new branch**, not at branch creation — **only for `feature/` and `app/` branches** (governed by `minorBranchPrefixes`). Other branch types (e.g. `fix/`, `docs/`) receive a patch bump.

---

## Handover Workflow

Trigger: `handover` / `handover please`

Purpose: Cleanly sync work so development can continue on another computer.

Behaviour (safe, deterministic):

1. **Preflight**
   - Report current branch explicitly.
   - Confirm working tree state.

2. **Stage everything**
   - Stage all local changes (tracked + new files).

3. **Test gate**
   - Run the repo test command(s) from the Project Profile.
   - Proceed only if tests pass at 100%.
   - Stop immediately on failure and report.
   - **Skip condition:** If the changeset is docs/infra-only (see Docs/Infra-Only Detection), skip `npm test` (Heft/Jest). Still run editor/IDE diagnostics.

4. **Commit everything**
   - If staged changes exist, commit them automatically with a clear message.

5. **Ship if needed**
   - If there are commits since the last `vX.Y.Z` tag on this branch, run the full SHIP workflow.
   - If tests already passed at step 3 in this handover, the SHIP test step may be skipped.
   - If changes are **docs-only or infrastructure-only** (plans, runbooks, internal guidance), skip bump/tag and continue.
   - Otherwise continue without bump/tag when no new commits since last tag.

6. **Merge to default branch**
   - Checkout the default branch (e.g. `main`).
   - **Create a safety snapshot tag** (see Code-Loss Prevention).
   - Merge the current branch using `git merge --no-ff` (creates a merge commit; no rebase).
   - Stop on conflicts.
   - **Run Merge Deletion Audit** (see Code-Loss Prevention). Stop if thresholds are exceeded and wait for confirmation.

7. **Push (all three: feature branch, default branch, tags)**
   - Push the **current feature branch** to origin.
   - Push the default branch to origin.
   - Push tags (if a SHIP occurred or tags exist).
   - All three pushes must succeed. Report any failures immediately.

8. **Verify sync**
   - Confirm local default branch matches `origin/<default-branch>` (same commit SHA).
   - Confirm local feature branch matches `origin/<feature-branch>` (same commit SHA).
   - If either is out of sync, stop and report.

9. **Checkout feature branch**
   - Switch back to the feature branch so the working directory is on the correct branch for continued development.

10. **Summary**
    - Summarise: branch, commits created, tests run, merge result, and pushes performed.
    - Explicitly confirm: feature branch, default branch, and tags are all synced to origin.

Approval rules:

- Using the `handover` trigger grants approval to push the **feature branch**, the default branch, and tags **for this workflow only**.
- Any other remote push still requires explicit approval.

---

## Resume Workflow

Trigger: `resume` / `resume please`

Purpose: Restore the working environment on a different computer after a handover, so development continues from exactly where it left off.

Behaviour (read-only, never pushes):

1. **Preflight (dirty tree guard)**
   - Check working tree status.
   - If uncommitted changes exist, **stop immediately** and warn the user to deal with local changes before proceeding.
   - Report current branch.

2. **Fetch**
   - Run `git fetch --all --prune --tags` to sync all remote state.

3. **Detect and checkout the active feature branch**
   - Auto-detect the branch from the last handover: inspect remote branches sorted by most recent commit (`git branch -r --sort=-committerdate`), filter out `origin/<default-branch>` and `origin/HEAD`, and select the top result.
   - **Confirmation:** Explicitly state the detected branch and its last commit date, and ask the user to confirm before checking it out (mitigates the "committer date vs push date" edge case).
   - If already on the correct branch, skip checkout.
   - If on the default branch or a different branch, checkout the detected feature branch and set up tracking.
   - If detection is ambiguous, ask the user which branch to resume.

4. **Pull latest**
   - Fast-forward the feature branch to match the remote (`git pull --ff-only`).
   - Also update the local default branch to match its remote counterpart (`git checkout <default-branch> && git pull --ff-only && git checkout <feature-branch>`).
   - Stop on merge conflicts or non-fast-forward situations.

5. **Verify sync**
   - Confirm local feature branch matches `origin/<feature-branch>` (same commit SHA).
   - Confirm local default branch matches `origin/<default-branch>` (same commit SHA).
   - If either is out of sync, stop and report the discrepancy before proceeding.

6. **Verification gate**
   - Run the full verification suite per Project Profile:
     - Tests — 100% pass required.
     - Static checks (e.g. `eslint --max-warnings=0`, `typecheck`) — zero warnings required.
     - IDE/editor diagnostics (e.g. VS Code Problems tab) — zero issues required.
   - Stop immediately on any failure and report.

7. **Summary**
   - Report: branch checked out, commits pulled in (with short log of new commits since local was last updated), verification results.
   - Explicitly confirm: feature branch and default branch are both in sync with origin.
   - Confirm: "Ready to continue where you left off."

Approval rules:

- Resume is entirely read-only — it fetches, checks out, and pulls but never pushes.
- No approval is required for any step.

---

## Status Workflow (Quick state check)

Trigger: `status` / `status please`

Purpose: Lightweight read-only report of the current repo state. Does not modify anything.

Behaviour:

1. **Fetch** (non-destructive)
   - Run `git fetch --all --prune --tags` to ensure remote refs are current.

2. **Report**
   - Current branch.
   - Working tree state (clean / number of uncommitted changes).
   - Current version (from `versionFiles` in `TCTBP.json`) and last tag.
   - Sync state: local vs remote SHA for current branch and the default branch.
   - Commits ahead/behind for both branches.
   - Whether a SHIP is needed (uncommitted changes or unshipped commits since last tag).
   - **Code health snapshot:** Compare file count on current branch against the last safety tag or shipped tag. Flag if >5 source files (`.ts`/`.tsx`) are missing.

3. **Recommend next step(s)**
   - Provide 1–3 actionable recommendations with a one-line reason for each.
    - Use this priority order when multiple are valid (highest priority first): `abort` → `resume` → `ship` → `handover` → `none`.
   - Recommendation rules:
     - `abort`: partial workflow state detected (e.g. merge in progress, bump/tag mismatch, previous workflow failed mid-way).
       - `resume`: local/remote branch SHA mismatch or default branch not synced with origin.
       - `ship`: unshipped commits since last tag, version/tag drift detected, or shipped user-facing changes lack release note updates.
       - `handover`: branch is ahead or working tree is dirty and the user likely needs to move machines.
     - `none`: repo is clean, synced, and no SHIP is needed.
   - Never execute recommended actions automatically from `status`; only report recommendations.

No approval required. No changes made.

---

## Abort Workflow (Partial operation recovery)

Trigger: `abort`

Purpose: Inspect and recover from a partially completed SHIP, sync, or deploy workflow (for example bump committed but push failed, tag created but commit is wrong, or deployment state is ambiguous).

Behaviour:

1. **Inspect state**
   - Report current branch, working tree, last commit, last tag.
   - Identify whether a partial operation is in progress (e.g. version bumped but not tagged, tagged but not pushed, merge started but not completed, release notes updated without the matching version or tag, deploy stopped after build but before validation).

2. **Propose recovery**
    - List specific recovery actions with consequences:
     - Revert the bump commit (`git revert` or `git reset --soft HEAD~1`).
     - Delete a local tag (`git tag -d vX.Y.Z`).
     - Abort a merge (`git merge --abort`).
       - Re-run post-deploy validation or redeploy from the last known-good shipped commit when deployment state is unclear.
   - Never execute recovery actions without explicit user approval.

3. **Execute approved actions**
   - Perform only the actions the user explicitly approves.
   - History rewriting (reset, force-push) requires extra confirmation.

Approval rules:

- All recovery actions require explicit approval.
- Force-push and history rewriting require double confirmation.

---

## Deploy Workflow

Trigger: `deploy` / `deploy please`

Purpose: Build the packaged SPFx solution and deploy it to the SharePoint App Catalog safely.

Behaviour:

1. **Preflight**
   - Confirm current branch, working tree state, and working directory.
   - Stop immediately if `HEAD` is detached.
   - Confirm the branch is clean and synced with origin.

2. **Verification gate**
   - Run the normal SPFx verification gates from `spfx/intranet-core`.
   - Stop immediately on failure.

3. **Documentation impact**
   - Review deployment and packaging docs when the deployable artefact, App Catalog steps, or environment configuration changes.
   - Record either `Docs updated` or `No docs impact` with a short reason.

4. **Runtime build**
   - Build `spfx/intranet-core/sharepoint/solution/intranet-core.sppkg` using `npm run build` from `spfx/intranet-core`.

5. **Deploy target**
   - Upload the `.sppkg` to the SharePoint App Catalog.
   - Confirm deployment and make the solution available to the target site collection according to governance.

6. **Post-deploy validation**
   - Confirm the DDRE Intranet app is available in Site contents.
   - Add the relevant web part to a modern page and verify it loads correctly.
   - Confirm environment-aware proxy endpoints are used without tenant-specific hard-coding.

Approval rules:

- Using `deploy` grants approval to run the repo-defined deployment steps for that workflow only.
- If deployment also requires SHIP or a sync step, those workflows keep their normal approval rules.

---

## SHIP Workflow

> **SHIP** = Preflight → Test → Problems → Docs Impact → Bump → Commit → Tag → Push
>
> The agent may proceed through **Bump → Commit → Tag** without pausing unless a core invariant fails.

### 1. Preflight

- Confirm current branch
- Confirm working tree state
- Confirm correct working directory

---

### 2. Test

Run repo test commands per Project Profile. Stop on failure.

**Skip condition:** If the change set is **docs-only or infrastructure-only**, skip this step entirely (there is no code to test). The test command for this repo is `npm test` (Heft/Jest) run from `spfx/intranet-core/`.

---

### 3. Problems

Ensure lint, build, and test diagnostics are clean (zero warnings if enforced).

**Docs/infra-only changes:** Skip code-level checks (e.g. `eslint`, `typecheck`) but still run editor/IDE diagnostics (e.g. VS Code Problems tab) to catch syntax errors, markdown lint issues, and JSON validation errors in the changed files.

---

### 4. Docs Impact

- Classify the changeset using the documentation rules in `TCTBP.json`.
- Review the required docs for user-visible features, configuration changes, packaging changes, or roadmap/status updates.
- Update `releaseNotes.ts` for user-visible shipped changes when appropriate.
- If no documentation updates are needed, explicitly record `No docs impact` with a short reason before version bumping.

---

### 5. Bump Version

**Versioning rules:**

- **Z (patch)** increments on **every SHIP**, **except** when the change set is **docs-only or infrastructure-only** (plans, runbooks, internal guidance).
- **Y (minor)** increments on the **first SHIP of a new work branch**, resetting Z to 0, **only when the branch prefix matches `minorBranchPrefixes`** (default: `feature/`, `app/`).
  - Operational definition: "first SHIP on a branch" means no prior shipped tag (`vX.Y.Z`) exists on commits unique to the current branch since it diverged from the default branch.
  - Branches with non-feature prefixes (e.g. `fix/`, `docs/`, `infrastructure/`) receive a **patch** bump on their first SHIP, not a minor bump.
- **X (major)** only by explicit instruction

The bump must be applied to all files listed in `versionFiles` in `TCTBP.json` **before committing**, so the resulting commit contains the new version. Note: `package-solution.json` requires 4-part format `X.Y.Z.0`; see `scripts/release.ps1` for the bump logic.

---

### 6. Commit

- Stage relevant changes
- Propose a conventional commit message

---

**Release Notes (if applicable):**
This repo does not use `CHANGELOG.md`. User-facing release notes go in `releaseNotes.ts` (see `spfx/intranet-core/src/webparts/intranetShell/components/data/releaseNotes.ts`). Use `scripts/add-release-note.ps1 -Title "..." -Category feature|improvement|bugfix|security` to add entries. Skip for docs/infra-only changesets.

---

### 7. Tag

- Tag format: `vX.Y.Z` (example: `v0.5.27`)
- One tag per shipped commit
- Tag must point at the commit that introduced the version

---

### 8. Push (Approval Required)

- **Run Pre-Push Deletion Audit** (see Code-Loss Prevention). Warn if the push is net-negative.
- Push current branch only
- Never push to protected branches

**SHIP within handover:** When SHIP runs as part of a handover workflow, the handover push rules override this step. The handover pushes all three (feature branch, main, tags) as a single operation — see Handover Workflow step 7.

---

## Build Profile

Builds performed during or after a SHIP use the **dev profile** by default (`npm run build` via Heft). A **production build** (`heft test --clean --production && heft package-solution --production`, which bundles and produces the `.sppkg`) is only performed when the user explicitly requests it (e.g. "production build", "build for deployment").

This keeps iteration fast during development and avoids unnecessary long build times.

---

## Permissions Expectations (Authoritative)

### Allowed by Default

- Local file operations
- Tests, lint, build
- Commits and local tags
- Branch switching and merging
- **Non-destructive remote reads** (`fetch`, logs, diffs)
- **Resume operations** (fetch, checkout, pull) — entirely read-only, no approval needed

### Require Explicit Approval

- Push (any remote)
- Delete branches
- Force push
- Rewrite history
- Modify remotes

**Clarification:** There is no concept of a "push to a local branch". Local commits are always allowed; any `git push` that updates a remote always requires approval.

---

## Failure Behaviour

On any failure:

- Stop immediately
- Explain the failure
- Propose safe recovery options (revert bump commit, delete local tag)
- Never rewrite history without approval
- Suggest using `abort` trigger for guided recovery if the failure left partial state

**Merge Conflicts:** If a workflow stops due to a merge conflict (e.g. during Handover or Branch creation), instruct the user to resolve the conflict manually, commit the resolution, and then re-trigger the workflow to complete the remaining steps.

---

## Appendix: `TCTBP.json`

The authoritative JSON configuration is in `.github/TCTBP.json`. That file is the **single source of truth** for all workflow parameters — do not duplicate its contents here.

To view the current config:

```powershell
Get-Content .github/TCTBP.json | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

