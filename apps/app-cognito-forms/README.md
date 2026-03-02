# Cognito Forms

> **Hub:** Administration · **Status:** Planning · **Web Part:** `cognitoForms`

## Overview

Embedded Cognito Forms for internal requests. This app provides a centralised location for staff to access and submit business forms hosted in Cognito Forms.

## Intended Use

- Help & Support requests
- IT service requests
- General internal request forms
- Any Cognito Forms–hosted form the business wants to surface in the intranet

## Key Requirements

- Embed Cognito Forms within the intranet shell
- Configurable list of forms (managed via web part properties or SharePoint list)
- Responsive layout for desktop and mobile
- Consistent styling with the intranet theme

## Data & Integration

- **Source:** Cognito Forms (external SaaS)
- **Integration method:** Embedded iframe or Cognito Forms API
- **Authentication:** Forms are public or use Cognito Forms' own auth — no tenant secrets needed in SPFx

## Notes

- Cognito Forms manages its own data storage and submissions
- The web part primarily acts as an embedding wrapper
- Form selection and configuration should be manageable by content editors

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/cognitoForms/` _(not yet created)_
- Plan: See `PLAN.md` § app-cognito-forms
