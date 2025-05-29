const webPush = require("web-push");
const queryDatabase = require("./database.js");

// keys for webpush
const publicVapidKey =
  "BHMoOD-_Jr8g-p0-BYTAF1W2lO96LQNpsYnfapLGg3f13QLmvx-Q9jAF-_Vy2SU73GZVr1OgP14ODbeuigltCGE";
const privateVapidKey = "mmrqXoxDsNi-YsqhlFH4vRvS5_4ZEX-Qe_V9pHSgXvk";

webPush.setVapidDetails(
  "mailto:your-email@example.com",
  publicVapidKey,
  privateVapidKey
);

async function sendPushNotification(data) {
  if (!data.target) {
    console.error("No target specified.");
    return;
  }

  const payload = JSON.stringify({
    title: data.title,
    body: data.message,
  });

  const query = "SELECT * FROM subscriptions WHERE email = ?";
  const params = [data.target];

  queryDatabase(query, params, async (err, results) => {
    if (err || results.length === 0) {
      console.error(`No subscriptions found for ${data.target}`);
      return;
    }

    for (const { email, endpoint, p256dh, auth } of results) {
      const subscription = {
        endpoint,
        keys: { p256dh, auth },
      };

      try {
        await webPush.sendNotification(subscription, payload);
      } catch (err) {
        console.error(`Push failed for ${email}:`);
      }
    }
  });
}


module.exports = sendPushNotification;
