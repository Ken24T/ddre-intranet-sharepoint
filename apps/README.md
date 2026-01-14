# Apps (User-Facing Tools)

This folder contains **user-facing intranet tools** ("apps") for the DDRE Intranet.

Apps represent **business capabilities**, not deployment units. They describe *what the tool is*, *who it is for*, and *how it behaves* from a business and UX perspective.

Actual deployment is handled separately via SPFx solutions under `/spfx`.

---

## What an App Is (in this repo)

An app is:

- A clearly defined business tool (e.g. Marketing Budget, CRM Lite)
- Owned by a business function or department
- Governed by permissions and access rules
- Potentially long-lived and evolving over time

An app is **not**:

- A Git repository
- An SPFx solution
- A shared utility library

There must be **no `.git` folders** inside `/apps`.

---

## Folder Structure

Each app lives in its own folder:

```
/apps
  /app-<name>
    README.md
    app.json        (optional)
    notes/
    ux/
    data/
```

Not all subfolders are required, but the structure encourages consistency.

---

## Recommended Contents per App

Each app folder should aim to contain:

### README.md (required)

At minimum:

- What the app does
- Who it is for
- Business owner
- Access model (read / write / admin)
- High-level data sources

### app.json (optional)

Lightweight metadata, for example:

```json
{
  "name": "app-marketing-budget",
  "displayName": "Marketing Budget",
  "owner": "Sales",
  "status": "planned",
  "introduced": "Phase 2"
}
```

### notes/

- Requirements
- Constraints
- Decisions
- Open questions

### ux/

- Wireframes
- UX notes
- Screenshots

### data/

- List definitions
- Field notes
- Permissions assumptions

---

## Lifecycle & Phases

- Phase 1: apps may exist here as **concepts only** (no SPFx solution yet)
- Phase 2+: apps gain their own SPFx solution under `/spfx`

An app can exist in `/apps` before it is built.

---

## Relationship to SPFx

- `/apps` answers **what** the tool is
- `/spfx` answers **how** it is shipped

From Phase 2 onward:

- Each app normally maps to **one SPFx solution**
- That SPFx solution carries the authoritative deployed version

---

## Naming Conventions

- Folder names: `app-<name>` (lowercase, hyphenated)
- Names should reflect business language, not technical detail

---

## Governance Notes

- Every app should have a clear owner
- Permissions must be group-based
- Cross-department access should be read-only by default
- If scope changes significantly, document it here

---

## When Unsure

If it's unclear whether something belongs in `/apps`:

- If users recognize it as a tool, it probably belongs here
- If it's reusable code, it belongs in `/packages`
- If it's deployment mechanics, it belongs in `/spfx`
