# Audit & Logging – Technical Guide

This guide explains the intranet’s audit/logging system for technical readers. It covers what is captured, where it appears in the UI, and how to interpret audit events.

## Overview

The audit system captures user interactions and system events to provide visibility, diagnostics, and compliance reporting. Events are surfaced in the **Audit Logs** view and recorded through the shared audit client.

Key objectives:
- **Traceability** – who did what, when, and where.
- **Diagnostics** – understand usage and errors.
- **Governance** – support compliance and reporting requirements.

> [!suggestion] What you should see
> - An Audit Logs tool in the Administration hub.
> - A table of audit entries when opened.

## UI entry point

1. Open the **Administration** hub.
2. Select the **Audit Logs** card.

> [!suggestion] What you should see
> - An Audit Logs view with filters at the top.
> - A table of entries with timestamps, user, action, hub, and tool.

## Data model (high level)

Audit events are emitted via the shared client in `pkg-api-client` and include:
- **Action type** (e.g., content view, search, system, error).
- **Actor** (user id / display name).
- **Context** (hub, tool, module).
- **Metadata** (event-specific details).
- **Timestamp** (ISO string).

This allows consistent event capture across the intranet without coupling to individual components.

> [!suggestion] What you should see
> - Audit rows with consistent action naming and metadata.

## Audit Logs UI

### Filters
The filter area supports:
- **User** search.
- **Action** type.
- **Hub** filter.
- **Date range**.

> [!suggestion] What you should see
> - Filters at the top of the Audit Logs page.
> - Filtering updates the table immediately.

### Table columns
Standard columns include:
- **Timestamp** – ISO date/time with local formatting.
- **User** – display name or id.
- **Action** – human‑readable action label.
- **Hub** – hub name.
- **Tool** – tool or module identifier.
- **Metadata** – event-specific context.

> [!suggestion] What you should see
> - A table with consistent column ordering.

## Event categories

Audit events are categorised to simplify analysis:
- **Content view** – opening cards or dashboards.
- **Search** – user searches and filters.
- **User interaction** – button clicks, navigation.
- **Notification** – read/dismiss events.
- **System** – health checks or system operations.
- **Error** – recoverable or fatal errors.

> [!suggestion] What you should see
> - Categories grouped and searchable by filters.

## Common event flows

### Content view
When a user opens a dashboard or tool, an audit event is sent with:
- **Hub** and **tool** identifiers.
- **Card title** and context.

### Search
When a user runs a search, an audit event is sent with:
- **Query** text.
- **Filters** and scope.

### Notifications
When a user marks notifications as read or dismisses alerts, an event is recorded.

> [!suggestion] What you should see
> - Events appear shortly after the action is performed.

## Technical integration points

### Client
The audit client is provided by `pkg-api-client` and is used by UI components to emit events. This avoids direct dependency on transport details in UI code.

### Emission pattern
Events should be emitted:
- **After** a successful user action.
- With **minimal PII** (display names only where needed).
- With consistent **action naming**.

### Error logging
Errors should be logged with:
- A clear error name.
- A short message.
- Context about where the error occurred.

> [!suggestion] What you should see
> - Error entries in Audit Logs when exceptions occur.

## Governance and compliance

- **No secrets** should be captured.
- **Tenant‑specific URLs** should be avoided.
- Use **environment configuration** for endpoints.

> [!suggestion] What you should see
> - Audit entries that are safe for compliance review.

## Troubleshooting

- **Audit Logs empty:** Check filters and date range first.
- **Events missing:** Confirm the emitting component is wired to the audit client.
- **Unexpected spikes:** Validate if automated processes are logging events.

> [!suggestion] What you should see
> - A consistent event cadence matching user activity.
