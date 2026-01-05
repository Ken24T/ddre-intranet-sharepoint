# Roles and responsibilities

This document defines the core roles and responsibilities for the DDRE intranet
project.

## Purpose

- Clarify ownership and decision-making.
- Ensure security and compliance responsibilities are explicit.
- Provide a lightweight RACI-style reference.

## Guiding principles

- Least privilege and permission trimming (SharePoint + downstream systems).
- No secrets in the browser; all sensitive access via approved server-side boundary.
- Accessibility and usability are first-class requirements.
- Changes are tracked and reviewed (even when solo-developed).

## Identity and authorization model

### Identity (SSO)

- Users authenticate via Entra ID SSO.
- SPFx can reliably identify the signed-in user (for example: UPN/object ID
  via SharePoint context and/or Microsoft Graph).

### Authorization (where access is enforced)

- SharePoint is the primary authorization boundary for SharePoint content (sites,
  pages, lists, libraries, folders, files).
- For non-SharePoint systems (line-of-business apps), authorization must be
  enforced server-side (e.g., Azure Functions/App Service API). Client-side
  checks are for UX only.

### CRUD and RU definitions

- CRUD = Create, Read, Update, Delete.
- RU = Read, Update.

In SharePoint terms, these typically map to permission levels:

- Read = view/open/download.
- RU = typically a custom permission level or a scoped approach (see
  “Implementation notes” below).
- CRUD = typically Contribute/Edit (depending on whether users should edit pages
  or only list/library items).

## Roles

### Product owner / Business sponsor

- Owns business goals, scope, and priorities.
- Approves major changes to information architecture and navigation.
- Defines success metrics and adoption targets.

### Intranet administrator (SharePoint / M365)

- Manages site collections, permissions, hub associations, and app catalog.
- Maintains app registrations/permissions and tenant-level configuration.
- Owns operational readiness and deployment coordination.

### Hub administrators (Administration group)

- A small set of trusted users who administer hub content and functionality.
- Can be granted elevated rights across hubs (site/library administration)
  without granting “God” capabilities.

### God user (break-glass)

- Ultimate permissions across the intranet.
- Intended for emergency recovery, configuration, and oversight.
- Should remain a very small membership (ideally a single account) with strong
  MFA/CA policies.

### Technical lead / SPFx engineer

- Owns SPFx architecture, implementation, and code quality.
- Maintains CI/release automation and versioning discipline.
- Ensures client-side code follows security constraints (no secrets, no direct
  privileged calls).

### Identity & access (Entra ID)

- Reviews SSO requirements and token scopes.
- Approves app registrations, permissions, and conditional access policies.
- Validates that access to data sources aligns with least privilege.

### Security / Compliance

- Reviews threat model and data handling for intranet features.
- Approves data retention, audit logging, and incident response expectations.
- Validates that AI/RAG features meet governance requirements.

### Content owners (by department)

- Own and maintain their department pages and content lifecycle.
- Ensure content is accurate, current, and accessible.
- Provide approval for publishing and archival.

## Hub structure

The intranet is organized into five hubs:

- Administration
- Sales
- Property Management
- Office
- General

Users may belong to multiple hubs. Hub membership determines which
sites/libraries/apps a user can access, and with what permission level.

## Groups and permissions

### Entra groups (recommended naming)

Create Entra security groups by hub and access tier:

- Hub-Administration-RU
- Hub-Administration-CRUD
- Hub-Sales-RU
- Hub-Sales-CRUD
- Hub-PropertyManagement-RU
- Hub-PropertyManagement-CRUD
- Hub-Office-RU
- Hub-Office-CRUD
- Hub-General-RU
- Hub-General-CRUD

Admin and break-glass groups:

- Intranet-Admins (the Administration admin group)
- Intranet-God (break-glass)

### SharePoint group mapping

Each hub site should use standard SharePoint groups:

- Visitors: Read
- Members: Contribute/Edit (CRUD)
- Owners: Full Control

Map Entra groups into SharePoint groups as follows:

- Hub-<Hub>-RU  add to Visitors
- Hub-<Hub>-CRUD  add to Members
- Intranet-Admins  add to Owners (or a dedicated “Hub Admins” group with Full Control)
- Intranet-God  site collection admin on every hub site

This design supports users belonging to multiple hubs and having different
permissions per hub.

### Cross-hub access (Sales  Property Management)

Cross-hub access is implemented by adding the user to the appropriate Entra
group(s) for the target hub.

Example: Sales member needs RU in Property Management

- Add user to Hub-PropertyManagement-RU.
- Do not grant broad Property Management membership if only a subset of
  content/app features is required.

## Implementation notes (to keep governance manageable)

- Prefer site/library-level permissions over folder/file-level unique permissions.
- If “some files” need different access than the rest, prefer a separate library
  (e.g., “Sales Working (CRUD)” vs “Sales Shared (RU)”).
- Use folder/file unique permissions only for true exceptions; document them.

About RU:

- SharePoint’s built-in “Read” does not include Update.
- If RU is required, implement it as either:
  - a custom permission level for the specific library/list, or
  - a scoped approach where updates are performed via a controlled workflow/API
    and SharePoint remains Read for the underlying items.

## Responsibilities by area (summary)

- Intranet Admin: sites, hubs, permissions, app catalog operations.
- Hub Admins (Administration group): content/functionality administration across
  hubs.
- Tech Lead: SPFx architecture, CI/release automation, security constraints.
- Identity/Security: group strategy, conditional access, token scopes, auditing.
- Content Owners: publish/maintain hub content and validate accuracy.
- Ops: monitor builds/releases, deployment runbooks, incident response.

### Support / Operations

- Handles incident triage and routing.
- Maintains runbooks for deployment and rollback.
- Monitors workflow runs and build artifacts.

## RACI (high-level)

| Activity | Product | Intranet Admin | Tech Lead | Identity | Security | Content Owners | Ops |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Prioritize backlog | A/R | C | C | C | C | C | C |
| SPFx implementation | C | C | A/R | C | C | C | C |
| App Catalog deploy | C | A/R | R | C | C | C | R |
| Permissions model | C | R | R | A/R | A/R | C | C |
| Content publishing | C | C | C | C | C | A/R | C |
| AI/RAG governance | C | C | R | R | A/R | C | C |
| Release/tagging | C | C | A/R | C | C | C | R |

Legend: R = Responsible, A = Accountable, C = Consulted

## Open questions

- Who is the formal Product owner / Sponsor?
- Who owns the App Catalog deployment in production?
- What is the escalation path for security reviews?
- Which departments are content owners at launch?

- For each hub, which assets require RU vs CRUD vs Read-only?
- Do any hubs contain highly sensitive data requiring separate sites/libraries?
