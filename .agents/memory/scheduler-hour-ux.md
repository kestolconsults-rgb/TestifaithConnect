---
name: Scheduler hour UX
description: Convention for displaying admin-configurable send-hour fields (schedulers) in local time while storing UTC
---

Admin-configurable "send at hour X" fields (e.g. daily declaration send hour, newsletter digest send hour) are stored and sent to the backend as a UTC hour integer (0-23), since the scheduler cron job runs server-side in UTC. However, showing raw UTC hours ("14:00 UTC") in the admin UI is confusing for non-technical admins who think in their own timezone.

**Why:** An admin who wants "the declaration to go out at 8am for me" has no easy way to compute the UTC offset themselves, and a critical review of this feature flagged this as a real usability gap.

**How to apply:** Build hour-picker options client-side by converting each UTC hour (0-23) into the browser's local time label (`Intl`/`toLocaleTimeString`) for display, sorted in local chronological order, while the underlying `value` sent on change stays the raw UTC hour. Optionally show the resolved timezone abbreviation (via `Intl.DateTimeFormat(...).formatToParts` with `timeZoneName: "short"`) next to the picker for clarity. Never change what's persisted — only the display layer changes.
