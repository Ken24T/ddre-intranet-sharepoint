# @ddre/pkg-app-bridge

Shared PostMessage protocol types for communication between embedded apps
(running in iframes or inline via the dev harness) and the DDRE Intranet Shell.

## What's included

| Export | Description |
|--------|-------------|
| `IAppNavItem` | Navigation item an app can inject into the shell sidebar |
| `AppToShellMessage` | Union of all App → Shell message types |
| `ShellToAppMessage` | Union of all Shell → App message types |
| `isAppToShellMessage()` | Type guard for incoming App → Shell messages |
| `isShellToAppMessage()` | Type guard for incoming Shell → App messages |

## Usage

```typescript
import type { IAppNavItem, AppToShellMessage } from "@ddre/pkg-app-bridge";
import { isShellToAppMessage } from "@ddre/pkg-app-bridge";
```

## Building

```bash
npm install
npm run build
```

The compiled output lands in `lib/` and is consumed by the SPFx solution
and the Vite dev harness via local `file:` installs.
