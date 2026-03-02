# QR Coder

> **Hub:** Office · **Status:** Planning · **Web Part:** `qrCoder`

## Overview

QR code generation utility for business use. Allows staff to quickly generate, download, and print QR codes for various business scenarios.

## Intended Use

- Generate QR codes from URLs, text, or structured data
- Download QR codes as images (PNG/SVG)
- Print QR codes directly from the intranet
- Batch generation for events, property listings, or marketing materials

## Key Requirements

- Simple, intuitive QR code generation interface
- Support for multiple QR code content types (URL, text, vCard, etc.)
- Customisable QR code appearance (size, colour, logo overlay)
- Download as PNG or SVG
- Print-friendly output

## Data & Integration

- **Source:** Client-side QR code generation (no external API needed)
- **Library:** To be selected (e.g., `qrcode`, `qrcode-generator`, or similar)
- **Storage:** QR codes are generated on-demand — no persistent storage required

## Notes

- QR generation is entirely client-side — no Azure proxy needed
- Consider DDRE branding options (brand colour overlay, logo in centre)
- Keep the UI simple; this is a utility tool

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/qrCoder/` _(not yet created)_
- Plan: See `PLAN.md` § app-qrcoder
