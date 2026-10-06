import { storage } from "./storage";
import { sendPushNotification } from "./pushService";
import { sendDailyDeclarationEmail, sendNewsletterEmail, sendExpectationEncouragementEmail } from "./emailService";
import { buildUnsubscribeUrl } from "./unsubscribeToken";

export async function sendDailyExpectationEncouragementNow(): Promise<{ recipientCount: number }> {
  const optedInUsers = await storage.getUsersOptedInto("notifyExpectationEncouragement");
  let recipientCount = 0;

  const verses = await storage.getActiveVerses();
  if (verses.length === 0) return { recipientCount };

  await Promise.allSettled(
    optedInUsers.map(async (u) => {
      const activeExpectations = await storage.getUserExpectations(u.id, "active");
      if (activeExpectations.length === 0) return;

      const expectation = activeExpectations[Math.floor(Math.random() * activeExpectations.length)];
      const verse = verses[Math.floor(Math.random() * verses.length)];

      await sendPushNotification(u.id, {
        title: `Encouragement for: ${expectation.title}`,
        body: `"${verse.verse}" — ${verse.reference}`,
        url: `/expectations/${expectation.id}`,
        tag: `expectation-${expectation.id}`,
      }, "notifyExpectationEncouragement");

      if (u.email) {
        await sendExpectationEncouragementEmail(
          u.email,
          u.firstName || undefined,
          expectation.title,
          verse.verse,
          verse.reference
        );
      }
      recipientCount++;
    })
  );

  return { recipientCount };
}

export async function sendDailyDeclarationNow(): Promise<{ recipientCount: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const declaration = await storage.getActiveFaithDeclaration(today);
  if (!declaration) {
    throw new Error("No active faith declaration found to send");
  }

  const optedInUsers = await storage.getUsersOptedInto("notifyDailyDeclaration");
  let recipientCount = 0;

  await Promise.allSettled(
    optedInUsers.map(async (u) => {
      await sendPushNotification(u.id, {
        title: "Today's Faith Declaration",
        body: declaration.declaration,
        url: "/",
        tag: "daily-declaration",
      }, "notifyDailyDeclaration");
      if (u.email) {
        await sendDailyDeclarationEmail(
          u.email,
          u.firstName || undefined,
          declaration.declaration,
          declaration.bibleVerse,
          declaration.bibleReference,
          buildUnsubscribeUrl(u.id, "declaration")
        );
      }
      recipientCount++;
    })
  );

  return { recipientCount };
}

export async function sendNewsletterNow(newsletterId: string): Promise<{ recipientCount: number }> {
  const newsletter = await storage.getNewsletter(newsletterId);
  if (!newsletter) {
    throw new Error("Newsletter not found");
  }

  const optedInUsers = (await storage.getUsersOptedInto("notifyNewsletter")).filter((u) => !!u.email);
  let recipientCount = 0;

  await Promise.allSettled(
    optedInUsers.map(async (u) => {
      const sent = await sendNewsletterEmail(u.email!, newsletter.subject, newsletter.body, u.firstName || undefined, buildUnsubscribeUrl(u.id, "newsletter"));
      if (sent) recipientCount++;
    })
  );

  await storage.markNewsletterSent(newsletterId, recipientCount);
  return { recipientCount };
}
