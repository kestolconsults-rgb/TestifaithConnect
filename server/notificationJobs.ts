import { storage } from "./storage";
import { isPushConfigured, sendPushNotification } from "./pushService";
import { sendDailyDeclarationEmail, sendNewsletterEmail } from "./emailService";
import { buildUnsubscribeUrl } from "./unsubscribeToken";

export async function sendExpectationEncouragementNow(userId: string, localDate: string): Promise<boolean> {
  const expectations = await storage.getUserExpectations(userId, "active");
  if (!isPushConfigured || expectations.length === 0) return false;

  const dayIndex = [...localDate].reduce((sum, char) => sum + char.charCodeAt(0), 0) % expectations.length;
  const expectation = expectations[dayIndex];
  const scripture = expectation.scriptures?.find((item) => item.isPrimary) || expectation.scriptures?.[0];
  const verse = scripture?.passageText
    ? { verse: scripture.passageText, reference: scripture.reference }
    : await storage.getDailyVerse();
  if (!verse?.verse) return false;

  const subscriptions = await storage.getPushSubscriptionsForUser(userId);
  if (subscriptions.length === 0) return false;
  const body = scripture?.passageText
    ? `Take heart today: “${scripture.passageText}” — ${scripture.reference}`
    : `A word for your faith journey: “${verse.verse}” — ${verse.reference}`;
  await sendPushNotification(userId, {
    title: "A word for your faith journey",
    body: body.slice(0, 240),
    url: `/expectations/${expectation.id}`,
    tag: "faith-expectation-daily",
  }, "notifyExpectationDaily");
  await storage.markExpectationReminderSent(userId, localDate);
  return true;
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
