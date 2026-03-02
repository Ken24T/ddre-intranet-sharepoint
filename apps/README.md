# Apps (User-Facing Tools)

This folder contains **user-facing intranet tools** ("apps") for the DDRE Intranet.

Apps represent **business capabilities**, not deployment units. They describe
*what the tool is*, *who it is for*, and *how it behaves* from a business
and UX perspective.

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

```text
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

- An app can exist in `/apps` as a **concept** before any code is written.
- When ready to build, the app's code is added as a **web part** inside `spfx/intranet-core/`.
- There is **one SPFx solution** (`intranet-core`) that bundles all web parts.

---

## Relationship to SPFx

- `/apps` answers **what** the tool is (business definition, UX, requirements)
- `/spfx/intranet-core/src/webparts/<name>/` answers **how** it is built (code)
- The single `intranet-core.sppkg` carries all web parts and is the deployment unit

Each app maps to **one web part folder** inside `spfx/intranet-core/src/webparts/`.

Current apps:

| App | Hub | Web Part | Status |
|-----|-----|----------|--------|
| `app-cognito-forms` | Administration | `cognitoForms` | Planning |
| `app-dante-library` | Office | `danteLibrary` | Planning |
| `app-marketing-budget` | Administration | `marketingBudget` | Active |
| `app-pm-dashboard` | Property Management | `pmDashboard` | Planning |
| `app-qrcoder` | Office | `qrCoder` | Planning |
| `app-surveys` | Administration | `surveys` | Planning |
| `app-vault-batcher` | Sales | `vaultBatcher` | Planning |

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

## Adding a New App (Step by Step)

1. **Define** — Create `/apps/app-<name>/README.md` with business requirements, UX docs, data model
2. **Code** — Add web part folder at `spfx/intranet-core/src/webparts/<camelCaseName>/`
3. **Register** — Add the web part's bundle entry and localized resources to `spfx/intranet-core/config/config.json`
4. **Test** — `cd spfx/intranet-core && npm run test` runs all tests (shell + all apps)
5. **Build** — `npm run build` produces a single `.sppkg` containing all web parts
6. **Deploy** — Upload `intranet-core.sppkg` to the SharePoint App Catalog

See `spfx/README.md` for the detailed new-web-part checklist.

---

## When Unsure

If it's unclear whether something belongs in `/apps`:

- If users recognise it as a tool, it probably belongs here
- If it's reusable code, it belongs in `/packages`
- If it's deployment mechanics, it belongs in `/spfx`
