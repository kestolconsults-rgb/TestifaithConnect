---
name: User settings storage checklist
description: A pitfall where schema/UI support a settings field but the storage update method silently ignores it
---

`updateUserSettings` (or any partial-update storage method) can be written to only apply a subset of the fields defined in the corresponding Zod/Drizzle schema and exposed in the UI. Toggling the setting in the UI appears to succeed (200 response, no error) but the value is never persisted, because the storage method has an explicit `if (data.someField !== undefined) ...` for some fields but is missing it for others.

**Why:** This class of bug is invisible to type-checking — the input type still matches the schema, and the route handler passes the whole validated object through. It only surfaces when a user reports "my notification setting won't save," and is easy to miss during review since the schema, form, and route all look correct.

**How to apply:** Whenever you add a new field to a settings/preferences schema (e.g. `notifyNewsletter`, `notifyDailyDeclaration`), grep the storage layer's update method for that field name and confirm it has a corresponding assignment — don't assume "the schema supports it" implies "the storage layer persists it."
