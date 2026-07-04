import webpush from "web-push";
import { storage } from "./storage";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@testifaith.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; tag?: string }) {
  try {
    const subs = await storage.getPushSubscriptionsForUser(userId);
    const payloadStr = JSON.stringify(payload);
    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payloadStr
        ).catch(async (err: any) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await storage.deletePushSubscription(sub.endpoint);
          }
        })
      )
    );
  } catch {
    // Non-critical — don't let push errors affect the main request
  }
}
