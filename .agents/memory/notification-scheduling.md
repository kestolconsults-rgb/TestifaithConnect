---
name: Notification scheduling architecture
description: How automatic recurring sends (daily declarations, newsletter digests) are scheduled without a dedicated job queue
---

Recurring/automatic sends (daily faith declaration, newsletter digest) are driven by a singleton `appSettings` DB row (id="default") plus a `node-cron` job that polls every 15 minutes and checks `<field>Enabled && currentHour === <field>SendHour && last<Field>SentDate !== today`.

**Why:** No dedicated job queue/worker infra in this stack (single Express process). Polling + DB-persisted "last sent date" makes sends idempotent and safe across process restarts/multiple ticks, without needing exact-time cron triggers or an external scheduler service.

**How to apply:** For any new "admin enables automatic recurring X" feature, add fields to `appSettings` (enabled flag, send hour, last-sent-date) rather than building a new scheduling mechanism. Newsletters use an `isRecurring` boolean per-newsletter-row as the "digest template" — recurring newsletters are simply re-sent by the scheduler on each due cycle rather than regenerated from scratch.
