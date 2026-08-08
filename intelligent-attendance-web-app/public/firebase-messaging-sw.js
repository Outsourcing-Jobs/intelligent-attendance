importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDDP5DQcDLpIlJbnODUxVCssWhUhVeI6Uw",
  authDomain: "mygallery-2026-v1.firebaseapp.com",
  projectId: "mygallery-2026-v1",
  storageBucket: "mygallery-2026-v1.appspot.com",
  messagingSenderId: "100000000000",
  appId: "1:100000000000:web:mygallery2026v1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Nhận thông báo FCM ngầm: ", payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || "Thông báo mới";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
