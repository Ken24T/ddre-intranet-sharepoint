# DDRE Intranet – GitHub Copilot Instructions

## Project Context

This repository contains the **DDRE Intranet** built on **SharePoint Online** using **SharePoint Framework (SPFx)** with **TypeScript and React**.

The intranet is:
- Hosted in SharePoint Online
- Authenticated via Microsoft Entra ID (SSO)
- Extended using SPFx web parts
- Integrated with Azure backend services via secure proxies

The primary developer is **Ken Boyle**.

---

## Architectural Principles (Always Follow)

- SharePoint Online is an **experience layer**, not an application server
- All custom UI is implemented via **SPFx (client-side)**
- No secrets, API keys, or tokens are ever embedded in front-end code
- Access control is **group-based and additive**
- Reuse platform services before inventing custom solutions

---

## Technology Stack

When generating code, prefer:

- **TypeScript** (strict typing)
- **React functional components** with hooks
- **Fluent UI** components for layout and controls
- **PnPjs** for SharePoint and Graph access
- **SPFx best practices** (no deprecated APIs)

Avoid:
- Plain JavaScript
- Inline scripts or global CSS
- Direct DOM manipulation
- Hard-coded tenant URLs

---

## SPFx Coding Guidelines

- All web parts must be reusable and configurable
- Use web part properties for site/list IDs and configuration
- Respect SharePoint permissions (do not re-implement auth)
- Handle loading, empty, and error states explicitly
- Log errors meaningfully (console + optional telemetry hook)

---

## Data Access Rules

- Prefer **SharePoint Lists** for simple data storage
- Use **Dataverse** only when relational complexity is required
- Never connect directly to databases from SPFx
- All external APIs must be accessed via an **Azure proxy**

---

## AI Integration Rules

- AI features use **Retrieval-Augmented Generation (RAG)**
- Knowledge sources are **read-only** (Dante Library)
- AI responses must include **source citations**
- No business rules are inferred without source grounding
- All AI calls go through a secure backend service

---

## UX Standards

- Consistent layout: header, navigation, content area, status
- Card-based entry points for tools
- Accessibility is mandatory (keyboard, contrast, semantics)
- Avoid over-customising SharePoint chrome

---

## Governance & Safety

- Never bypass SharePoint or Entra ID security
- Never grant direct user permissions in code
- Assume content and tools will be audited
- Prefer clarity and maintainability over cleverness

---

## Code Quality Expectations

- Clear naming and structure
- Comments explain *why*, not *what*
- Functions are small and testable
- Errors fail safely and visibly

---

## When Unsure

If there is ambiguity:
- Choose the **simplest, most maintainable** option
- Align with Microsoft 365 and SPFx guidance
- Avoid introducing new infrastructure without justification

---

## Summary Instruction to Copilot

> Generate code as if this intranet will be maintained long-term, audited for security, and extended incrementally by a small team.

