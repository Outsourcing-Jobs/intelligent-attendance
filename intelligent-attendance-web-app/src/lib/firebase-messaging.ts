import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { apiClient } from "@/lib/api-client";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:100000000000:web:mygallery2026v1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const initFcmMessaging = async () => {
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    console.log("🔔 [FCM] Quyền Notification hiện tại:", Notification.permission);

    const permission = await Notification.requestPermission();
    console.log("🔔 [FCM] Quyền Notification sau khi xin phép:", permission);

    if (permission === "granted") {
      const messaging = getMessaging(app);

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

        const tokenOpts: any = { serviceWorkerRegistration: registration };
        if (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
          tokenOpts.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        }

        const token = await getToken(messaging, tokenOpts).catch((err: any) => {
          console.warn("Lấy FCM Token:", err?.message);
          return null;
        });

        if (token) {
          console.log("🔥 [FCM Web Push Token]:", token);
          await apiClient("/users/me/fcm-token", {
            method: "POST",
            body: JSON.stringify({ fcmToken: token }),
          }).catch(() => null);
        }
      }

      onMessage(messaging, (payload: any) => {
        console.log("🔔 [FCM Foreground Notification]:", payload);
      });
    }
  } catch (error: any) {
    console.warn("FCM init error:", error?.message);
  }
};
