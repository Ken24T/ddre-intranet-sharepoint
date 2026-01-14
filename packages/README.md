# Packages (Shared Libraries)

This folder contains **shared, reusable TypeScript packages** used across the DDRE Intranet.

Packages provide **technical building blocks**, not business features. They are designed to be consumed by SPFx solutions and apps without embedding business-specific assumptions.

---

## What Belongs in `/packages`

A package is appropriate when the code:

- Is reusable across multiple SPFx solutions or apps
- Encapsulates a technical concern (UI, data access helpers, API clients)
- Has no knowledge of a specific business process or department
- Would otherwise be copy-pasted between solutions

Examples:

- UI layout components and theming helpers
- SharePoint / PnPjs helper wrappers
- AI client wrappers for calling approved backend services
- Utility functions (formatting, validation, etc.)

---

## What Does *Not* Belong Here

Do **not** place the following in `/packages`:

- Business rules or workflows
- App-specific logic
- SPFx web parts or extensions
- Requirements or UX documentation

If users recognise it as a "tool", it belongs in `/apps`, not here.

---

## Package Structure

Each package lives in its own folder:

```
/packages
  /pkg-<name>
    README.md
    src/
    package.json
```

Packages should be:

- Small
- Focused
- Easy to reason about in isolation

---

## Naming Conventions

- Folder names: `pkg-<name>` (lowercase, hyphenated)
- Names should describe **capability**, not implementation detail

Examples:

- `pkg-ui`
- `pkg-sp`
- `pkg-ai-client`

---

## Dependency Rules

- Packages **may depend on other packages**
- Apps and SPFx solutions may depend on packages
- Packages must **not** depend on apps or SPFx solutions

Dependency direction:

```
packages -> apps -> spfx
```

(This keeps shared code clean and portable.)

---

## Versioning

- Packages are versioned via `package.json`
- Versions are bumped when public APIs change
- In early phases, versions may move in lockstep with the repo

Avoid premature versioning complexity.

---

## Quality Expectations

- Strong typing (TypeScript strict)
- Clear, stable public APIs
- Minimal surface area
- No direct SharePoint or tenant assumptions unless explicitly intended

---

## Documentation

Each package **must** include a README that explains:

- What the package does
- What problem it solves
- How it should (and should not) be used

If a package's purpose isn't obvious from its README, it probably doesn't belong here.

---

## When Unsure

If you're unsure whether code belongs in `/packages`:

- If it could be reused unchanged by another app, it belongs here
- If it knows about a specific business process, it does not
