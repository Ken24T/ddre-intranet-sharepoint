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

## SharePoint permission mapping

This section explains how the project terms map onto SharePoint capabilities.

### Read

- Typical SharePoint mapping: Visitors group with the built-in Read permission
  level.
- Intended for: hub-wide information, policies, reference documents, published
  content.

### CRUD

- Typical SharePoint mapping: Members group with Contribute.
- Contribute commonly supports: add, edit, delete items/files in the scoped
  library/list.
- If users must edit Site Pages, validate whether Members should also have
  rights in Site Pages (many orgs prefer content owners only).

### RU

RU means update without create/delete.

- Typical SharePoint mapping: a custom permission level applied at a list or
  library that allows Edit Items but does not allow Add Items or Delete Items.
- Use RU when: users should correct/update existing items or metadata but not
  add new items or remove content.

### Decision table

| Term | Create | Update | Delete | Typical SharePoint mapping | Recommended scope | Use when |
| --- | --- | --- | --- | --- | --- | --- |
| Read | No | No | No | Visitors with built-in Read | Site or library | Published/policy/reference content |
| RU | No | Yes | No | Custom permission level or workflow/API | Library/list | Updates to existing items/metadata only |
| CRUD | Yes | Yes | Yes | Members with Contribute | Library/list | Working areas where teams create/change content |

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

### Group ownership

- Intranet Admin owns the creation and lifecycle of Entra groups.
- Hub Admins request membership changes through an agreed process (ticket,
  email approval, etc.).
- Content owners decide which resources require Read vs RU vs CRUD.

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

Implementation steps:

1. Create a custom permission level on the hub site (for example, “RU”).
2. Start from Contribute/Edit as a baseline, then remove capabilities that
  enable create/delete.
3. Apply RU at the library/list level (preferably) for RU resources.
4. Grant the hub RU group that permission at the RU library/list.
5. Validate with a test user:
  - can open and edit existing items/metadata
  - cannot add new items/files
  - cannot delete items/files
6. Record the custom level name and where it is used for auditing.

Option B: Read in SharePoint + Update via controlled workflow/API

- SharePoint grants Read.
- Updates are performed via a controlled path:
  - Power Automate / workflow, or
  - server-side API that checks group membership and applies updates.
- This can be better when updates must be audited or validated.

Implementation steps:

1. Grant the hub RU group Read in SharePoint for the scope.
2. Provide a controlled update path (workflow or server-side API) that:
  - verifies the user is in the hub RU group
  - writes the update using a privileged identity (not the browser)
  - logs who requested the change and what changed
3. Decide whether updates require approval (recommended for sensitive content).
4. Periodically review workflow/API access logs and group membership.

## Hub blueprint (starting point)

This is a recommended starting blueprint for each hub. It is designed to make
cross-hub access and differing permissions straightforward and auditable.

Principle: prefer separate libraries over folder/file unique permissions.

Recommended defaults:

- By default, grant `Hub-<Hub>-CRUD` Contribute to each hub's “Working” library.
- By default, grant `Hub-<Hub>-RU` Read to each hub's “Shared” library.
- If an RU library/list exists:
  - grant `Hub-<Hub>-RU` RU at that library/list
  - grant `Hub-<Hub>-CRUD` Contribute at that library/list
- Prefer library/list permissions over site-wide permissions for hub groups.

### Administration hub

Suggested libraries/lists:

- Administration Shared (Read)
- Administration Working (CRUD)
- Administration Forms (RU) (optional; only if RU is needed)

Notes:

- Administration hub is for administering the intranet (content, utilities,
  configuration) and should remain small in membership.

### Sales hub

Suggested libraries/lists:

- Sales Shared (Read)
- Sales Working (CRUD)
- Sales Updates (RU) (optional; only if RU is needed)

### Property Management hub

Suggested libraries/lists:

- Property Management Shared (Read)
- Property Management Working (CRUD)
- Property Management Updates (RU) (optional; only if RU is needed)

### Office hub

Suggested libraries/lists:

- Office Shared (Read)
- Office Working (CRUD)
- Office Updates (RU) (optional; only if RU is needed)

### General hub

Suggested libraries/lists:

- General Shared (Read)
- General Working (CRUD)

Notes:

- General/Office typically host cross-cutting resources. Expect more Read and
  fewer CRUD/RU scopes.

## Cross-hub access

Cross-hub access is handled by adding users to the appropriate hub group(s).

Example: Sales user needs RU to some Property Management resources:

- Add the user to `Hub-PropertyManagement-RU`.
- If RU is limited to a single library, grant `Hub-PropertyManagement-RU` at
  that library (not necessarily at the entire site).

If cross-hub access applies to a recurring shared area, consider a dedicated
shared library (or shared site) rather than copying the same resource into
multiple hubs.

## Admin and God model

### Intranet-Admins

- Intended for the Administration group.
- Recommended scope: Full Control where they must administer hub content and
  configuration.
- Prefer not to use Intranet-Admins as a general membership group.

### Intranet-God

- Break-glass only.
- Recommended implementation: site collection admin on all hub sites.
- Enforce strong protections (MFA, conditional access, minimal membership).

## Governance and responsibilities

- Intranet Admin: owns hub/site setup, permissions configuration, audits.
- Hub Admins (`Intranet-Admins`): administer hub content/functionality.
- Content owners: define what belongs in each library and who should have
  CRUD/RU/Read.
- Security/Identity: approves group strategy, CA policies, and any custom
  permission levels.

## Auditing and review cadence

- Quarterly (or at least biannual) review of:
  - Entra group memberships
  - Unique permissions (libraries, folders, files)
  - Any custom permission levels
- Maintain an exceptions list for any folder/file unique permissions with:
  owner, justification, date created, next review.

## Implementation checklist (when tenant is available)

- Create the five hub sites and associate them as needed.
- Create Entra groups for each hub tier (RU/CRUD).
- Map Entra groups into SharePoint Visitors/Members/Owners.
- Create libraries for resource scoping (Read vs CRUD vs RU) per hub.
- Decide RU implementation option (A or B) per resource type.
- Validate security trimming: navigation, search, and direct links.
- Document exceptions (any folder/file unique permissions).

## Examples

Sales user has CRUD in Sales and RU in Property Management:

- Add user to `Hub-Sales-CRUD`
- Add user to `Hub-PropertyManagement-RU`
- Ensure Property Management RU is granted at the intended scope (site or
  specific library)

## Open decisions

- RU approach per resource type:
  - for simple “edit existing metadata only” cases, prefer Option A (custom)
  - for audited/validated updates, prefer Option B (workflow/API)
- Resource scoping:
  - default to library/list scoping
  - allow folder/file unique permissions only as documented exceptions
- Administration scope:
  - default to Owners only where required to administer content/config
  - keep break-glass (`Intranet-God`) separate and tightly controlled
