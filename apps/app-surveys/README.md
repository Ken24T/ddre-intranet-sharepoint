# Surveys

> **Hub:** Administration · **Status:** Planning · **Web Part:** `surveys`

## Overview

Internal survey creation and management tool. Allows administrators to create, distribute, and analyse surveys for gathering staff feedback and business insights.

## Intended Use

- Create internal surveys with various question types
- Distribute surveys to staff via the intranet
- Collect and store survey responses
- Visualise survey results with charts and summaries

## Key Requirements

- Survey builder with support for multiple question types (multiple choice, text, rating, etc.)
- Survey distribution and notification
- Response collection and storage (SharePoint Lists or similar)
- Results dashboard with basic charts and export
- Anonymous and identified response modes

## Data & Integration

- **Storage:** SharePoint Lists for survey definitions and responses
- **Authentication:** Entra ID for identified surveys; anonymous mode for optional surveys
- **Notifications:** Consider integration with Power Automate for survey distribution

## Notes

- Evaluate whether Microsoft Forms or a custom solution better fits the need
- If custom, keep the builder simple — avoid over-engineering
- Responses should be exportable to CSV/Excel for further analysis

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/surveys/` _(not yet created)_
- Plan: See `PLAN.md` § app-surveys
