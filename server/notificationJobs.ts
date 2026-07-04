import { storage } from "./storage";
import { sendPushNotification } from "./pushService";
import { sendDailyDeclarationEmail, sendNewsletterEmail } from "./emailService";
import { buildUnsubscribeUrl } from "./unsubscribeToken";

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
      });
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
