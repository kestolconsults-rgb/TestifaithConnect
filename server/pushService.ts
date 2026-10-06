import webpush from "web-push";
import { storage } from "./storage";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.trim() || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
export const isPushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (isPushConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@testifaith.app",
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn("[push] VAPID public/private keys are not both configured; push delivery is disabled");
}

type PushPreference = "notifyOnAmen" | "notifyOnEncourage" | "notifyOnComment" | "notifyDailyDeclaration" | "notifyExpectationDaily";

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url?: string; tag?: string },
  preference?: PushPreference,
) {
  if (!isPushConfigured) return;

  try {
    if (preference) {
      const user = await storage.getUser(userId);
      if (!user || user[preference] === false) return;
    }

    const subs = await storage.getPushSubscriptionsForUser(userId);
    if (!subs.length) return;

    const payloadStr = JSON.stringify(payload);
    const deliveries = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payloadStr
        )
      )
    );

    await Promise.all(deliveries.map(async (delivery, index) => {
      if (delivery.status === "fulfilled") return;
      const error = delivery.reason as { statusCode?: number; message?: string };
      if (error.statusCode === 410 || error.statusCode === 404) {
        await storage.deletePushSubscription(subs[index].endpoint);
        return;
      }
      console.error("[push] Delivery failed", {
        userId,
        statusCode: error.statusCode,
        message: error.message || "Unknown push delivery error",
      });
    }));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown push service error";
    console.error("[push] Notification delivery failed", { userId, message: detail });
  }
}
