# RBAC plan (hubs, groups, and permissions)

This document defines the planned role-based access control (RBAC) model for
DDRE Intranet hubs and hub-specific resources.

It is intentionally tenant-agnostic: it focuses on group naming, where
permissions are applied, and how to avoid permission sprawl.

## Goals

- Support the five hubs: Administration, Sales, Property Management, Office,
  General.
- Allow users to belong to multiple hubs.
- Support different permissions per hub for the same user.
- Keep security enforceable at the platform boundary (SharePoint/M365 and
  server-side APIs).
- Minimize long-term maintenance risk.

## Terms

- CRUD: Create, Read, Update, Delete.
- RU: Read, Update.
- Read: View/open/download.

Important: SharePoint has built-in permission levels like Read and Contribute,
but RU is not typically a built-in level. RU needs an explicit implementation
choice (see “RU implementation options”).

## Identity and enforcement

- Identity comes from Entra ID SSO.
- Authorization for SharePoint content is enforced by SharePoint permissions.
- Authorization for non-SharePoint systems must be enforced server-side
  (Azure Function/App Service boundary). SPFx UI checks are not a security
  boundary.

## Hub model

Hubs provide navigation and rollups; hubs do not grant permissions.

Each hub should correspond to a SharePoint hub site (or a primary site) with
resources (pages, lists, libraries) that are permissioned independently.

## Group strategy

### Principle

Prefer Entra security groups as the source of truth for membership, and grant
those groups access via SharePoint groups (Visitors/Members/Owners) and/or
library permissions.

### Entra groups (recommended)

Per hub, define two primary access tiers:

- `Hub-<HubName>-RU`
- `Hub-<HubName>-CRUD`

Admin and break-glass:

- `Intranet-Admins` (Administration group; small)
- `Intranet-God` (break-glass; smallest possible)

Hub names (normalized):

- Administration
- Sales
- PropertyManagement
- Office
- General

Examples:

- `Hub-Sales-CRUD`
- `Hub-PropertyManagement-RU`

### Mapping to SharePoint groups

At the hub site level:

- Visitors: grant Read.
- Members: grant Contribute/Edit (CRUD).
- Owners: grant Full Control.

Recommended mapping:

- `Hub-<Hub>-RU` → Visitors
- `Hub-<Hub>-CRUD` → Members
- `Intranet-Admins` → Owners (or a dedicated “Hub Admins” group)
- `Intranet-God` → site collection admin on all hub sites

This supports a user having CRUD in one hub and RU in another simply by being a
member of both groups.

## Resource scoping (recommended patterns)

### Prefer library-level splits

If a hub has both read-only resources and editable resources, prefer separate
libraries over folder/file unique permissions.

Example within Sales hub:

- `Sales Shared (Read)`
- `Sales Working (CRUD)`
- `Sales Forms (RU/Workflow)` (if RU is needed)

### Folder/file unique permissions

Allowed for true exceptions but should be rare.

- Use folder/file unique permissions only when library-level separation is not
  practical.
- Document exceptions, owners, and review cadence.

## RU implementation options

Because RU (read + update) is not a standard built-in level everywhere, choose
one of these approaches per resource type.

Option A: Custom permission level (SharePoint)

- Create a custom permission level that allows updating items but not creating
  or deleting.
- Apply it at the library/list level for RU resources.
- Keep it narrow; avoid site-level custom permissions unless required.

Option B: Read in SharePoint + Update via controlled workflow/API

- SharePoint grants Read.
- Updates are performed via a controlled path:
  - Power Automate / workflow, or
  - server-side API that checks group membership and applies updates.
- This can be better when updates must be audited or validated.

## Cross-hub access

Cross-hub access is handled by adding users to the appropriate hub group(s).

Example: Sales user needs RU to some Property Management resources:

- Add the user to `Hub-PropertyManagement-RU`.
- If RU is limited to a single library, grant `Hub-PropertyManagement-RU` at
  that library (not necessarily at the entire site).

## Governance and responsibilities

- Intranet Admin: owns hub/site setup, permissions configuration, audits.
- Hub Admins (`Intranet-Admins`): administer hub content/functionality.
- Content owners: define what belongs in each library and who should have
  CRUD/RU/Read.
- Security/Identity: approves group strategy, CA policies, and any custom
  permission levels.

## Implementation checklist (when tenant is available)

- Create the five hub sites and associate them as needed.
- Create Entra groups for each hub tier (RU/CRUD).
- Map Entra groups into SharePoint Visitors/Members/Owners.
- Create libraries for resource scoping (Read vs CRUD vs RU) per hub.
- Decide RU implementation option (A or B) per resource type.
- Validate security trimming: navigation, search, and direct links.
- Document exceptions (any folder/file unique permissions).

## Open decisions

- RU approach: custom permission level vs workflow/API, per hub and resource.
- Which resources are scoped at site vs library vs folder/file.
- Whether Administration users are Owners everywhere or limited to specific
  hubs/resources.
