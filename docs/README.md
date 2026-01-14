# Docs (Architecture, Governance & Runbooks)

This folder contains **human-readable documentation** for the DDRE Intranet.

The goal of `/docs` is to capture decisions, intent, and operational knowledge that would otherwise live only in someone's head (usually Ken's).

Documentation here should explain **why** things are the way they are, not repeat what the code already says.

---

## What Belongs in `/docs`

Appropriate content includes:

- Architecture overviews and diagrams
- Design decisions and trade-offs
- Environment and tenant notes
- Deployment and operational runbooks
- Governance rules and conventions
- IT-facing explanations and assumptions

If a future developer or IT admin asks *"why did you do it this way?"*, the answer should live here.

---

## What Does *Not* Belong Here

Do **not** place the following in `/docs`:

- App-specific requirements -> `/apps`
- API schemas or interface definitions -> `/contracts`
- Reusable code documentation -> `/packages`
- One-off notes with no long-term value

Avoid duplicating information that is already enforced by code or configuration.

---

## Suggested Structure

This folder is intentionally flexible, but common patterns include:

```
/docs
  /architecture
    overview.md
    spfx-strategy.md
  /governance
    access-model.md
    naming-conventions.md
  /operations
    deployment.md
    rollback.md
```

Use folders only when they add clarity.

---

## Writing Guidelines

- Keep documents concise and focused
- Prefer short Markdown files over large, all-in-one documents
- Use headings and lists for scannability
- Date or version documents when context matters

Good documentation reduces rework and approval friction.

---

## Living Documents

Documents in this folder are expected to evolve.

When making a significant architectural or governance decision:

1. Implement the change
2. Capture the reasoning here
3. Reference the document in commit messages if relevant

This keeps intent and implementation aligned.

---

## When Unsure

If you're unsure whether something belongs in `/docs`:

- If it explains intent, decisions, or operations, it belongs here
- If it explains how code works line-by-line, it probably doesn't
