import cron from "node-cron";
import { storage } from "./storage";
import { sendDailyDeclarationNow, sendNewsletterNow } from "./notificationJobs";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDigestDueToday(settings: { newsletterDigestFrequency: string; newsletterDigestDayOfWeek: number; newsletterDigestDayOfMonth: number }): boolean {
  const now = new Date();
  if (settings.newsletterDigestFrequency === "monthly") {
    return now.getUTCDate() === settings.newsletterDigestDayOfMonth;
  }
  return now.getUTCDay() === settings.newsletterDigestDayOfWeek;
}

async function runSchedulerTick() {
  try {
    const settings = await storage.getAppSettings();
    const now = new Date();
    const currentHour = now.getUTCHours();
    const today = todayStr();

    if (
      settings.dailyDeclarationSchedulerEnabled &&
      currentHour === settings.dailyDeclarationSendHour &&
      settings.lastDailyDeclarationSentDate !== today
    ) {
      try {
        await storage.markDailyDeclarationSent(today);
        const { recipientCount } = await sendDailyDeclarationNow();
        console.log(`[scheduler] Sent daily declaration to ${recipientCount} users`);
      } catch (err) {
        console.error("[scheduler] Failed to send daily declaration:", err);
      }
    }

    if (
      settings.newsletterDigestEnabled &&
      currentHour === settings.newsletterDigestSendHour &&
      settings.lastNewsletterDigestSentDate !== today &&
      isDigestDueToday(settings)
    ) {
      try {
        const recurringNewsletters = await storage.getActiveRecurringNewsletters();
        if (recurringNewsletters.length > 0) {
          await storage.markNewsletterDigestSent(today);
          for (const newsletter of recurringNewsletters) {
            const { recipientCount } = await sendNewsletterNow(newsletter.id);
            console.log(`[scheduler] Sent recurring newsletter "${newsletter.subject}" to ${recipientCount} users`);
          }
        }
      } catch (err) {
        console.error("[scheduler] Failed to send newsletter digest:", err);
      }
    }
  } catch (err) {
    console.error("[scheduler] Tick error:", err);
  }
}

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;
  // Runs every 15 minutes; actual send decisions are gated by DB-persisted
  // settings/last-sent-date so this is safe across restarts and duplicate ticks.
  cron.schedule("*/15 * * * *", () => {
    runSchedulerTick();
  });
  console.log("[scheduler] Notification scheduler started (checks every 15 min)");
}
