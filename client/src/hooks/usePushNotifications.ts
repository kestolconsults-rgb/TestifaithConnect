import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";


function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushPermission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const [isConfigReady, setIsConfigReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  const hasVapidKey = Boolean(vapidPublicKey);

  const checkSubscription = useCallback(async () => {
    if (!supported) {
      setIsReady(true);
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      // Keep the prompt from blocking the rest of the app if push is unavailable.
    } finally {
      setIsReady(true);
    }
  }, [supported]);

  useEffect(() => {
    let active = true;
    fetch("/api/push/config", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Push configuration unavailable");
        return response.json() as Promise<{ publicKey?: unknown }>;
      })
      .then((config) => {
        if (active) setVapidPublicKey(typeof config.publicKey === "string" ? config.publicKey : null);
      })
      .catch(() => {
        if (active) setVapidPublicKey(null);
      })
      .finally(() => {
        if (active) setIsConfigReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supported) {
      setIsReady(true);
      return;
    }
    setPermission(Notification.permission as PushPermission);
    void checkSubscription();
  }, [supported, checkSubscription]);

  const subscribe = useCallback(async () => {
    setError(null);
    if (!supported) {
      setError("Notifications are not supported by this browser.");
      return;
    }
    if (!vapidPublicKey) {
      setError("Notifications are not configured yet. Please try again later.");
      return;
    }

    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission as PushPermission);
      if (nextPermission !== "granted") {
        if (nextPermission === "denied") {
          setError("Notifications are blocked in your browser settings. Allow them for Testifaith to continue.");
        }
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await apiRequest("POST", "/api/push/subscribe", {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
      setError("We couldn't enable notifications right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [supported, vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setError(null);
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiRequest("POST", "/api/push/unsubscribe", { endpoint: sub.endpoint });
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      setError("We couldn't update your notification settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [supported]);

  return { supported, hasVapidKey, permission, isSubscribed, isLoading, isReady: isReady && isConfigReady, error, subscribe, unsubscribe };
}
