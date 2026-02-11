# Dante Library

> **Hub:** Office · **Status:** Planning · **Web Part:** `danteLibrary`

## Overview

AI-powered document library search using Dante AI. This app provides intelligent search and conversational access to documents stored in the business's document library.

## Intended Use

- Natural-language search across company documents
- Conversational AI interface for querying document content
- Quick access to policies, procedures, and reference material

## Key Requirements

- Integrate Dante AI chat widget within the intranet shell
- Connect Dante AI to the organisation's document corpus
- Provide contextual responses based on SharePoint-hosted documents
- Responsive layout suitable for sidebar or full-content display

## Data & Integration

- **Source:** Dante AI (external SaaS) + SharePoint document libraries
- **Integration method:** Dante AI embedded widget or API
- **Authentication:** Dante AI manages its own auth; SharePoint documents may need Graph API for context

## Notes

- Dante AI is a third-party service — no secrets should be stored in SPFx code
- Document indexing and AI model management happens in the Dante AI platform
- The web part acts as the user-facing interface within the intranet

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/danteLibrary/` _(not yet created)_
- Plan: See `PLAN.md` § app-dante-library
