# Modern Intranet Implementation Plan

## 1. Project Overview

**Goal:**\
Deliver a modern, cloud-based intranet that supports staff communication, self-service, and collaboration using Microsoft 365 services, optimised for Windows 11 and Single Sign-On (SSO).

**Objectives:**

- Provide a single, trusted source of internal information
- Improve discoverability of policies, procedures, and resources
- Integrate seamlessly with Microsoft Teams and SharePoint
- Support future extensibility without re-platforming

**Audience:** All internal staff, segmented by role, department, and function\
**Ownership:** IT (platform) + Internal Communications (content) + Business sponsors

**Delivery Responsibilities (Initial):**

- **Primary Developer:** Ken Boyle (SPFx, React, TypeScript, front-end architecture, tool development)
- **Backend & Platform Configuration:** Grey Fox (3rd-party vendor)
  - Azure resources (Functions, App Services, Key Vault)
  - API proxy implementation and security
  - Entra ID / SharePoint configuration support
  - CI/CD assistance where required

**Intranet URL (Target):** [https://intranet.disher.com.au](https://intranet.disher.com.au)

### URL Implementation Notes (to confirm with IT)

- DNS: `intranet.disher.com.au` CNAME/alias to the SharePoint Online intranet landing page
- Decide whether the vanity URL is:
  - A friendly redirect to the SharePoint URL, or
  - The primary user-facing URL (where supported)
- Document ownership of DNS and certificate-related responsibilities (if any)

---

## 2. Guiding Principles

- Cloud-first, Microsoft-first
- Security and compliance by default
- Simple information architecture
- Mobile and accessibility friendly
- Low-code over custom code where possible

---

## 3. Technology Stack

### Hosting & Execution Model (Recommended)

The intranet will be **hosted natively in SharePoint Online**, using the modern SharePoint experience as the primary web hosting platform.

This means:

- Microsoft-hosted infrastructure (no on-prem or IaaS web servers)
- Built-in scalability, availability, and patching
- Native integration with Microsoft Entra ID for Single Sign-On
- No traditional server-side code execution within SharePoint

**Design Position:**
SharePoint Online is treated as an **experience and presentation layer**, not a general-purpose application server. Business logic and compute are handled via approved platform services (Power Platform and Azure) when required.

---

### Development & UX Stack (Recommended)

To deliver a **clean, modern, dynamic UX** (sidebar, navbar, status bar, function cards, dashboards), the recommended code layer is:

- **SharePoint Framework (SPFx)** for custom intranet components
- **TypeScript + React** for UI development (VS Code)
- **Fluent UI** (Microsoft design system) for consistent, accessible components
- **PnPjs** for SharePoint/Graph data access ergonomics

#### Delivery Model

- SharePoint pages provide overall structure and navigation
- SPFx web parts provide interactive tools and rich experiences
- Power Platform used for rapid process apps (forms/approvals) where appropriate

#### Build & Release (Suggested)

- Source control: GitHub (aligned with DDRE Intranet workflow)
- CI/CD: GitHub Actions to package and deploy SPFx solutions
- Deployment: SharePoint App Catalog
- Environments: Dev / Test / Production tenants or environment separation via app catalog + site collections

---

### Core Platform

- **Microsoft SharePoint Online (Modern Experience)**\
  Primary intranet platform (Home site, hub sites, communication sites)

- **Microsoft Entra ID**\
  Identity, authentication, and Single Sign-On

- **Microsoft Teams**\
  Collaboration layer and intranet entry point

- **Viva Connections / Viva Engage**\
  Employee engagement and intranet surfacing inside Teams

### Automation & Apps

- **Power Automate** – workflows, approvals, notifications
- **Power Apps** – lightweight internal tools and forms

### Reporting & Insights

- **Power BI** – usage and adoption reporting
- **Microsoft 365 Analytics** – platform-level insights

### Security & Compliance

- **Microsoft Purview** – data governance, retention, DLP
- **Conditional Access & MFA** – enforced via Entra ID

---

## 4. Identity & Access Management

### Identity Model

- Microsoft Entra ID is the authoritative identity provider
- All intranet access is authenticated via Entra ID (SSO)
- SharePoint, Teams, Viva, and Power Platform share a common identity context

### Authentication

- Seamless SSO across SharePoint Online, Teams, and Power Platform
- No separate intranet credentials required

### Access Control

- Role-based access to sites and content
- Use Microsoft 365 groups and security groups
- Permissions inherited wherever possible to reduce complexity

### Security Controls

- Mandatory MFA
- Conditional access policies (location, device, risk)
- Guest access governed, time-bound, and audited

---

## 5. Information Architecture

### Site Structure

- **Intranet Home Site** (global landing page)
- **Hub Sites** for departments and functions
- **Communication Sites** for publishing and reference content

### Navigation

- Global navigation bar (home site)
- Consistent hub navigation across sites

### Metadata & Search

- Defined taxonomy for content classification
- Managed metadata for documents and pages
- Promoted search results for key resources

---

## 6. Governance Model

### Delivery RACI (Initial)

| Area | Ken Boyle (Primary Dev) | Grey Fox (Vendor) | IT | Business Owners |
| ------ | ------------------------- | ------------------- | ---- | ----------------- |
| Intranet architecture & UX | R | C | C | I |
| SPFx / React development | R | I | I | I |
| Backend services (APIs, Functions) | C | R | C | I |
| Azure configuration & security | I | R | C | I |
| SharePoint tenant configuration | C | C | R | I |
| CI/CD pipelines | R | C | C | I |
| Content ownership & accuracy | I | I | I | R |
| Access approvals (business) | I | I | C | R |

> *R = Responsible, C = Consulted, I = Informed*



### Roles, Responsibilities & Access Control Model

The intranet uses **Microsoft Entra ID + SharePoint permissions** to enforce role-based access control (RBAC) across sites, content, and tools. Access is granted to **groups, not individuals**, wherever possible.

#### Core Access Roles

| Role                     | Typical Permissions               | Notes                                                         |
| ------------------------ | --------------------------------- | ------------------------------------------------------------- |
| **Visitor / Reader**     | Read-only                         | Default for most staff; can view pages, documents, dashboards |
| **Contributor / Author** | Create & edit pages/items         | Departmental content authors                                  |
| **Tool User**            | Read/write to specific lists/apps | Scoped to specific tools (e.g. PM Dashboard)                  |
| **Tool Admin**           | Full control of tool data         | Usually senior staff or system owners                         |
| **Site Owner**           | Full control of site              | Limited and tightly governed                                  |
| **Platform Admin**       | Tenant-level admin                | IT only                                                       |

#### Group Strategy

- Use **Microsoft 365 Groups** for:
  - Departmental access
  - Tool-specific access (e.g. `PM-Dashboard-Users`, `PM-Dashboard-Admins`)
- Use **Security Groups** where mailboxes/Teams are not required
- Avoid direct user permissions on sites, lists, or libraries

#### Permission Scoping

- **Site-level permissions** control broad access (read vs edit)
- **Hub-level permissions** align to departments
- **List/library-level permissions** used for tools and sensitive data
- **Item-level permissions** used sparingly (exception cases only)

---

### Department-Based Access Model (Initial)

The intranet will use a **department-first access model**, layered on top of the core access roles. This model is intentionally simple and can be refined over time.

#### Departments in Scope

- **Administration**
- **Property Management**
- **Sales**
- **Office (General Staff)**

#### Standard Department Groups (Initial Proposal)

Each department has two primary groups:

- `<Dept>-Readers` – read-only access
- `<Dept>-Contributors` – content/tool editing where appropriate

Examples:

- `Administration-Readers`, `Administration-Contributors`
- `PropertyManagement-Readers`, `PropertyManagement-Contributors`
- `Sales-Readers`, `Sales-Contributors`
- `Office-Readers`

#### High-Level Access Matrix (v1)

| Site / Area               | Administration | Property Management | Sales | Office |
| ------------------------- | -------------- | ------------------- | ----- | ------ |
| **Intranet Home**         | Read           | Read                | Read  | Read   |
| **Company Policies**      | Edit           | Read                | Read  | Read   |
| **Admin Hub**             | Edit           | Read                | Read  | None   |
| **PM Hub**                | Read           | Edit                | Read  | None   |
| **Sales Hub**             | Read           | Read                | Edit  | None   |
| **PM Dashboard Tool**     | Read           | Edit                | Read  | None   |
| **Marketing Budget Tool** | Read           | Read                | Edit  | None   |

> *Note: "None" indicates the area is hidden via permissions and/or audience targeting.*

#### Design Notes

- Everyone can see the **Intranet Home** (baseline transparency)
- Department hubs are writable only by their owning department
- Cross-department visibility is read-only by default
- Office group receives access only to general content unless explicitly granted

#### Evolution Strategy

- Add tool-specific groups as complexity grows (e.g. `PM-Dashboard-Admins`)
- Introduce sub-department or role-based groups later if required
- Review and adjust the matrix quarterly based on usage and feedback

---

### Access Requests & Group Management (Administrator Experience)

The intranet will provide an **Admin-facing access management page** to support day-to-day changes (new starters, role changes, cross-department access) without ad-hoc permission changes on individual sites.

#### Important Platform Note

- SharePoint Online does **not** provide a fully-featured, built-in “manage all groups” UI within the intranet itself.
- Source-of-truth management for membership remains:
  - **Microsoft Entra ID / Microsoft 365 Admin Centre** for groups
  - **SharePoint site permissions** for sites/libraries/lists

The intranet Admin page is therefore treated as a **controlled front-end** for *requesting* and *approving* access, and (where permitted) automating group membership updates.

#### Recommended Pattern (Self-Service, Governed)

1. **Access Management Page (SharePoint + SPFx)**

   - Displays:
     - Department groups and tool groups (read-only list)
     - Who the group owners are
     - User’s current access (where feasible)
   - Provides actions:
     - “Request Access” (select group/tool, justification)
     - “Request Removal”

2. **Approval Workflow (Power Automate)**

   - Requests route to the correct approver:
     - Group Owner (department/tool owner)
     - Optional IT approval for high-privilege groups
   - Approved requests:
     - Automatically add/remove user from the relevant group (preferred)
     - Or generate an IT service ticket if policy requires manual changes

3. **Audit & Reporting**

   - All requests stored in a SharePoint List (audit trail)
   - Quarterly review of:
     - High-privilege groups
     - Cross-department exceptions

#### Ownership & Safeguards

- Each group must have:
  - At least **two owners** (to avoid access bottlenecks)
  - A documented purpose and scope
- “Admin/Owner” roles are limited and periodically reviewed
- Avoid direct user permissions; group membership is the only supported exception path

---

### Intranet Administration & Permissions Management

To support day-to-day access changes and controlled crossover between departments, the intranet will include a **dedicated Administration area** for authorised administrators.

#### Purpose

- Provide visibility of intranet groups and their intent
- Enable controlled management of group membership
- Reduce reliance on IT for routine access changes
- Maintain auditability and governance

#### Implementation Model (Recommended)

- An **Administration Hub** accessible only to authorised Admin roles
- An **SPFx-based Admin Page** that:
  - Displays department groups and tool-specific groups
  - Shows group purpose and access scope (read/write/admin)
  - Links directly to Microsoft Entra ID / M365 group management
  - Optionally surfaces membership lists (read-only or delegated edit)

> *Note: The Admin page does not replace Entra ID or SharePoint security. It acts as a governed front-end to approved group operations.*

#### Who Can Use This Area

- Platform Admins (IT)
- Delegated Intranet Administrators (trusted business users)

#### What Can Be Managed

- Add/remove users to existing approved groups
- Assign users to multiple department or tool groups (crossover support)
- View effective access for a given user (where supported)

#### What Is Explicitly Out of Scope

- Creating new security groups without governance approval
- Changing permission inheritance on sites/lists
- Granting direct user permissions

---

### Governance Standards

- Least-privilege by default

- Groups before individuals

- Clear ownership for every site, list, and tool

- Permissions reviewed quarterly

- No broken inheritance without documented justification

- Naming conventions

- Page templates and layouts

- Branding and accessibility guidelines

### Lifecycle Management

- Site provisioning process
- Quarterly content review
- Archival and retention policies

---

## 7. Content & User Experience Strategy

### Content Types

- News and announcements
- Policies and procedures
- Forms and self-service tools
- Onboarding and training materials

### UX Principles

- Audience-targeted content
- Minimal clicks to key resources
- Consistent layouts and visual cues

### Prototyping

- Early wireframes for home and hub sites
- Pilot content with selected departments

---

## 8. Integrations

### AI Assistant (Site-wide Chatbot and Knowledge Q&A)

The intranet will include an **AI assistant** (chatbot) to help staff find answers about policies, processes, and procedures. The **Dante Library** (Obsidian Vault in SharePoint) will act as the **single source of truth** for business rules and internal guidance.

#### Primary Use Cases

- “How do I…?” guidance for procedures and internal workflows
- Policy and process Q&A with citations/links back to source pages
- Guided navigation to the correct form/tool/site area
- Summarisation of long policies and step-by-step checklists

#### Recommended Architecture (RAG: Retrieval-Augmented Generation)

- **Chat UI:** SPFx (React) web part available site-wide (and optionally surfaced in Teams via Viva Connections)
- **AI Service Layer (Required):** Azure Functions / App Service acting as a secure proxy
  - Stores OpenAI/API secrets securely (e.g., Azure Key Vault)
  - Handles authentication/authorisation and permission trimming
  - Performs retrieval + prompt assembly + model call
- **Knowledge Index:**
  - Index content from the Obsidian Vault (SharePoint document library)
  - Maintain a searchable vector/text index for fast retrieval
  - Return answers with **source citations** (links to SharePoint documents/pages)

#### Security & Governance Requirements

- Enforce **SSO** and ensure responses are **permission-trimmed** (users only see content they are allowed to access)
- No secrets stored in SPFx (browser) code
- Logging/auditing of queries and responses (with appropriate privacy controls)
- Clear “AI is an assistant” disclaimer and feedback mechanism

#### Content Ingestion & Index Refresh (Initial Approach)

- Scheduled or event-driven sync from SharePoint library
- Chunk Markdown files, extract metadata (folder/tags/frontmatter), generate embeddings, and update the index
- Define a “published” convention (e.g., folder or frontmatter flag) to control what the AI can use

#### Model & Vendor Considerations

- Use OpenAI (existing accounts/API keys) via a secure backend service layer
- Keep the architecture flexible to support alternative providers later if required

#### Success Measures (AI-specific)

- Reduction in repetitive questions to Admin/PM/Sales leads
- Time-to-answer for common process questions
- Feedback ratings and “answer helpful” signals

---

### Departmental Tools & Utilities (Dashboards, Calculators, Apps)

The intranet will include departmental tools such as a **PM Dashboard** (currently spreadsheet-based) and a **Sales Marketing Budget Calculator** (currently HTML/CSS/JS and using SQLite), plus additional tools as the intranet evolves.

#### Recommended Implementation Pattern

- Build each tool as an **SPFx (React) web part** for a consistent UX and governance-friendly deployment.
- Reuse existing logic where possible:
  - Existing HTML/CSS/JS tools are migrated into SPFx by:
    - Converting the UI into React components, and/or
    - Reusing existing JS calculation logic inside the SPFx web part

#### Data Approach (by tool type)

- **Spreadsheet-like trackers (e.g., PM Dashboard):**

  - Move data into a governed store such as **SharePoint Lists** (simple, fast, permissions-friendly) or **Dataverse** (if relational complexity/workflows/reporting justify it).
  - Present the UI using Fluent UI tables (sorting/filtering), with optional Power BI reporting.

- **Standalone calculators (e.g., Marketing Budget):**

  - Host as an SPFx tool to avoid unsupported script embedding.
  - If the calculator is truly stateless: no database required.
  - If the calculator needs saving scenarios/presets/history: store those in a SharePoint List.

- **Existing SQLite-backed tools (e.g., Marketing Budget today):**

  - **SharePoint Online cannot run SQLite as a server-side database.** SQLite is file-based and typically embedded in an app runtime.
  - Preferred migration paths:
    1. **Replace SQLite with SharePoint Lists** (common for simple tables/config/presets)
    2. **Replace SQLite with Dataverse** (if relationships, validations, workflows, and auditing are important)
    3. **Keep SQLite only as a client-side cache (advanced/limited):** using a browser-compatible SQLite implementation (e.g., WebAssembly) for offline/local use, with an authoritative store still in SharePoint/Dataverse
    4. **Move the DB to Azure SQL (only if justified):** access via an API layer (Azure Functions/App Service) – SPFx does not connect directly to SQL

#### UX Standards

- Common layout shell: sidebar + navbar + page header + status bar
- Function cards for tool entry points
- Consistent styling via Fluent UI (and DDRE branding)

### Obsidian Vault (Markdown Knowledge Base)

The organisation maintains an existing Obsidian Vault containing Markdown-formatted policies, processes, and guidelines. **This vault already exists as a SharePoint Online document library**, and Obsidian is used as the primary authoring tool.

The intranet must present a **dynamic, read-only view** of this content to staff, while preserving SharePoint as the storage layer and Obsidian as the authoring experience.

#### Key Requirements

- Single source of truth remains the SharePoint-hosted Obsidian Vault
- No duplication of content between systems
- Markdown rendered dynamically as modern web pages
- Folder structure, tags, and frontmatter leveraged for navigation and search
- Access controlled via SharePoint permissions and Microsoft Entra ID

#### Recommended Approaches (to validate with IT)

1. **SharePoint-Native Markdown Rendering (Preferred)**

   - Obsidian Vault stored in a dedicated SharePoint document library
   - Custom SharePoint Framework (SPFx) web parts render Markdown directly
   - Pages generated dynamically without content copying

2. **Automated Markdown-to-Page Publishing**

   - Power Automate or Azure-based process converts Markdown to modern SharePoint pages
   - Updates triggered on file change or scheduled sync
   - Read-only published pages linked back to source files

3. **Azure Rendering Service (Fallback / Advanced)**

   - Azure Static Web App or App Service reads Markdown directly from SharePoint
   - Content embedded into the intranet with SSO
   - Considered only if SharePoint-native rendering proves insufficient

#### Governance Considerations

- Editorial workflow remains entirely within Obsidian
- Draft vs published state managed via folders, metadata, or frontmatter
- Clear ownership for both source content and rendering components

---

### Microsoft Teams

- Intranet accessible via Viva Connections
- SharePoint libraries surfaced as Teams tabs

### Power Platform

- Automated approvals and notifications
- Forms replacing email-based processes

### Future Integrations (Optional)

- HR or CRM systems via APIs or connectors
- Knowledge base or AI-assisted search

---

### Vault (Sales Portal) API Integration

The intranet will integrate with the organisation’s **Vault (Sales Portal) API** from specific functional areas (e.g., sales tools, dashboards, lookups).

#### API Characteristics (Known)

- Uses an **API key + token** model
- CORS issues have been encountered during development and must be addressed for SharePoint Online usage

#### Recommended Integration Pattern

- **Do not embed API keys or long-lived secrets in SPFx code** (client-side code is inspectable)
- Use a secure **API proxy layer** (preferred):
  - Azure Functions / App Service
  - Secrets stored in Azure Key Vault
  - SPFx calls the proxy using Entra ID auth
  - Proxy calls Vault API using key + token

#### CORS Strategy

- Prefer the proxy approach to reduce CORS exposure and avoid placing secrets in the browser.
- Where direct browser calls are required, the Vault API must explicitly permit SharePoint Online origins and headers.

#### SharePoint Online CORS Requirements (for SPFx / browser-based calls)

- Allow origins for the relevant M365 hosts (environment-specific), typically including:
  - `https://<tenant>.sharepoint.com`
  - `https://<tenant>-my.sharepoint.com` (if OneDrive-hosted assets are involved)
  - `https://<tenant>.sharepoint.com/sites/<site>` (some CORS implementations require explicit site origins)
- Allow required HTTP methods (as needed): `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allow required headers (as needed): `Authorization`, `Content-Type`, and any custom headers used for tokens/correlation
- Support preflight requests (`OPTIONS`) reliably
- Decide whether credentials (cookies) are required; if so, configure `Access-Control-Allow-Credentials` and avoid wildcard origins

#### Proxy Option CORS Requirements (preferred)

- Configure the proxy API to allow origins from SharePoint Online (`https://<tenant>.sharepoint.com`) and (optionally) Teams/Viva surfaces
- Keep Vault API CORS internal to the proxy where possible (Vault only needs to trust the proxy)

#### Open Questions (to confirm with IT)

- Where the proxy will be hosted (Azure subscription, network boundaries)
- Token acquisition/refresh strategy
- Rate limits and caching requirements
- Audit logging expectations

---

## 9. Execution Capabilities & Constraints (SharePoint Online)

### Supported Capabilities

- Interactive client-side components using SharePoint Framework (SPFx)
- Rich UI built with JavaScript / TypeScript (e.g. React)
- Secure API calls using the user’s Entra ID context
- Dynamic content rendering and personalization
- Integration with Power Apps and Power Automate

### Platform Constraints

- No server-side code execution within SharePoint
- No background services or long-running processes
- No direct filesystem or OS-level access
- Browser sandbox and performance constraints apply

### Architectural Implications

- SharePoint is used for **navigation, presentation, and security**
- Business logic and automation handled via:
  - Power Platform (preferred)
  - Azure Functions / APIs (when justified)
- Heavy processing and custom backends are explicitly out of scope for SharePoint

This model ensures a secure, supportable intranet without introducing unmanaged infrastructure.

---

## 10. Security & Compliance

- Least-privilege access model
- Data classification and sensitivity labels
- Audit logging and monitoring
- Compliance with internal policies

---

## 11. Deployment Approach

> *Note: Development is led by a single primary developer with backend and platform support provided by a third-party vendor. Delivery sequencing and scope will reflect this resourcing model.*

### Support & Handover Boundaries

- **Front-end (SPFx, React, intranet UX):** Owned and maintained by Ken Boyle
- **Backend services (Azure Functions, APIs, Key Vault):** Owned and maintained by Grey Fox
- **Platform operations (tenant config, security, licensing):** Owned by IT

#### Handover Expectations

- All backend services delivered by Grey Fox must include:
  - Architecture overview
  - Deployment documentation
  - Runbooks for support and recovery
- Source code and configuration must be accessible to IT for continuity



> *Note: Development is led by a single primary developer with backend and platform support provided by a third-party vendor. Delivery sequencing and scope will reflect this resourcing model.*

### Phase 1 – Discovery & Planning

- Stakeholder workshops
- Content audit
- Architecture and governance definition

### Phase 2 – Prototype

- Home site and one hub site
- Initial navigation and templates

### Phase 3 – Pilot

- Limited user group
- Feedback and refinement

### Phase 4 – Full Rollout

- Company-wide launch
- Training and communications

### Phase 5 – Continuous Improvement

- Analytics-driven iteration
- Regular roadmap reviews

---

## 12. Training & Adoption

- Role-based training sessions
- Quick reference guides
- Champions network
- Ongoing support model

---

## 13. Success Measures

### Quantitative

- Active users
- Page views and search usage
- Content freshness metrics

### Qualitative

- Staff feedback
- Survey results
- Support ticket trends

---

## 14. Risks & Mitigations

| Risk | Mitigation |
| ------ | ------------ |
| Low adoption | Strong launch comms, Teams integration |
| Content sprawl | Governance and regular reviews |
| Security gaps | Enforced policies and audits |
| **Single-developer dependency** | Modular architecture, source control, documentation standards, vendor-backed backend services |
| **Developer availability (leave/turnover)** | Clear handover documentation, IT visibility into repos and pipelines, scoped Phase-based delivery |


| Risk           | Mitigation                             |
| -------------- | -------------------------------------- |
| Low adoption   | Strong launch comms, Teams integration |
| Content sprawl | Governance and regular reviews         |
| Security gaps  | Enforced policies and audits           |

---

## 15. Open Questions for IT Workshop (Jan 2026)

- Identity model and tenant constraints
- Licensing assumptions and gaps
- Network or compliance considerations
- Integration boundaries and API access
- Long-term ownership and support model
- Confirm approach for intranet.disher.com.au vanity URL (redirect vs primary) and ownership (DNS, any certificate responsibilities)
- Confirm CORS policy for SharePoint Online and Teams/Viva surfaces, and whether all Vault API calls will be routed through an Azure proxy
- Confirm AI assistant hosting and governance: Azure subscription/location for the AI proxy, indexing approach (e.g., Azure AI Search / vector store choice), permission-trimming method, and logging/privacy requirements

