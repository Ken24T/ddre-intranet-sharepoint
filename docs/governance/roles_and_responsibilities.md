# Roles and responsibilities

This document defines the core roles and responsibilities for the DDRE intranet project.

## Purpose

- Clarify ownership and decision-making.
- Ensure security and compliance responsibilities are explicit.
- Provide a lightweight RACI-style reference.

## Guiding principles

- Least privilege and permission trimming (SharePoint + downstream systems).
- No secrets in the browser; all sensitive access via approved server-side boundary.
- Accessibility and usability are first-class requirements.
- Changes are tracked and reviewed (even when solo-developed).

## Roles

### Product owner / Business sponsor

- Owns business goals, scope, and priorities.
- Approves major changes to information architecture and navigation.
- Defines success metrics and adoption targets.

### Intranet administrator (SharePoint / M365)

- Manages site collections, permissions, hub associations, and app catalog.
- Maintains app registrations/permissions and tenant-level configuration.
- Owns operational readiness and deployment coordination.

### Technical lead / SPFx engineer

- Owns SPFx architecture, implementation, and code quality.
- Maintains CI/release automation and versioning discipline.
- Ensures client-side code follows security constraints (no secrets, no direct privileged calls).

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
