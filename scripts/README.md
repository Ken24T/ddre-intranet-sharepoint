# Scripts (Developer Utilities)

This folder contains **developer-facing scripts** used to support development, validation, and maintenance of the DDRE Intranet repository.

Scripts exist to automate **repeatable, low-risk tasks** and to reduce manual error - not to act as hidden build systems or deployment pipelines.

---

## What Belongs in `/scripts`

Appropriate scripts include:

- Repo hygiene and validation (lint helpers, checks, audits)
- Local development helpers
- Safe automation for repetitive tasks
- One-off utilities that are still worth keeping

Scripts should be:

- Explicit
- Readable
- Safe to run multiple times

---

## What Does *Not* Belong Here

Do **not** place the following in `/scripts`:

- Production deployment logic (use CI/CD instead)
- Destructive scripts with side effects by default
- Anything that requires secrets or privileged credentials
- Long-running background processes

If a script could cause data loss or tenant changes, it does not belong here.

---

## Supported Environments

- Scripts should assume **Windows + PowerShell** by default
- Cross-platform scripts are welcome, but clarity beats portability
- Avoid assumptions about globally installed tools

If a script requires prerequisites, document them clearly.

---

## Naming Conventions

- Use descriptive, verb-based names
- Prefer clarity over brevity

Examples:

- `check-repo-health.ps1`
- `validate-spfx-config.ps1`
- `sync-docs-index.ps1`

---

## Safety Rules

- Scripts must default to **dry-run / read-only** where possible
- Destructive actions must:
  - require explicit confirmation, and
  - clearly state what will change

Never surprise the operator.

---

## Documentation

Each script should:

- Contain a header comment explaining its purpose
- Document inputs, outputs, and assumptions
- Indicate whether it is safe, read-only, or destructive

If a script needs more than a few lines of explanation, add a short README alongside it.

---

## When Unsure

If you're unsure whether something belongs in `/scripts`:

- If it automates a repeatable dev task, it probably belongs here
- If it feels like a build system, it probably doesn't
