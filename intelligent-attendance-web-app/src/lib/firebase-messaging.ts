import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { apiClient } from "@/lib/api-client";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const initFcmMessaging = async () => {
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const messaging = getMessaging(app);

      if ("serviceWorker" in navigator) {
        const swParams = new URLSearchParams({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
        }).toString();

        const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${swParams}`);

        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        }).catch((err: any) => {
          console.warn("Lấy FCM Token:", err?.message);
          return null;
        });

        if (token) {
          await apiClient("/users/me/fcm-token", {
            method: "POST",
            body: JSON.stringify({ fcmToken: token }),
          }).catch(() => null);
        }
      }

      onMessage(messaging, (payload: any) => {
        const notificationTitle = payload.notification?.title || payload.data?.title || "Thông báo mới";
        const notificationOptions = {
          body: payload.notification?.body || payload.data?.body || "",
          icon: "/R-circle.svg",
        };

        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(notificationTitle, notificationOptions);
          }).catch(() => {
            new Notification(notificationTitle, notificationOptions);
          });
        } else {
          new Notification(notificationTitle, notificationOptions);
        }
      });
    }
  } catch (error: any) {
    console.warn("FCM init error:", error?.message);
  }
};
