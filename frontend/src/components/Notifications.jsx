const PUBLIC_VAPID_KEY =
  "BHMoOD-_Jr8g-p0-BYTAF1W2lO96LQNpsYnfapLGg3f13QLmvx-Q9jAF-_Vy2SU73GZVr1OgP14ODbeuigltCGE";

export function Notifications(user) {
  async function registerPush() {
    if ("serviceWorker" in navigator) {
      try {
        let registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: PUBLIC_VAPID_KEY,
        });

        let data = { user, subscription };
        // Send subscription data to the backend
        await fetch(`/api/subscribe`, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        }).then(() => {
          let notify = {
            target: user.email,
            title: "Subscribed",
            message: "Notifications enabled while logged in",
          };
          sendNotification(notify);
        //   console.log("Subscribed successfully!");
        });
      } catch (error) {
        console.error("Error registering push notifications:", error);
      }
    }
  }

  const sendNotification = async (data) => {
    try {
    //   console.log("Sending notification...");

      await fetch(`/api/send-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("Notification sent!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const requestNotificationPermission = async () => {
    alert("approving notifications");
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();

    if (result === "granted") {
      registerPush();
    } else {
      alert("Notifications permission denied.");
    }
  };

  return { sendNotification, requestNotificationPermission };
}
