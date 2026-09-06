// lib/events.js

async function sendEvent(eventName, properties = {}) {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: eventName, ...properties }),
    });

    if (!res.ok) {
      console.warn(`[Events] Failed to send event ${eventName}:`, res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Events] Error sending event ${eventName}:`, err.message);
    return false;
  }
}

export const events = {
  animationCopied: (animationId, title, category, platform) =>
    sendEvent("animation_copied", {
      animation_id: animationId,
      animation_title: title,
      category,
      platform,
    }),

  animationSaved: (animationId, title, category) =>
    sendEvent("animation_saved", {
      animation_id: animationId,
      animation_title: title,
      category,
    }),

  userActive: () => sendEvent("user_active"),
};

export default events;
