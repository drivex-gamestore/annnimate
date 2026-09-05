const COOKIE_FTP = "anm_ftp";
const COOKIE_KIT = "anm_kit";
const SESSION_FT = "anm_ft";

function safeEncode(data) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(data));
    return encoded.length <= 800 ? encoded : null;
  } catch {
    return null;
  }
}

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
    utm_term: params.get("utm_term") || null,
    utm_content: params.get("utm_content") || null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    landing_path: typeof window !== "undefined" ? window.location.pathname || null : null
  };
}

export function captureFirstTouch() {
  const attributionData = {
    ...getUTMParams(),
    at: new Date().toISOString()
  };

  try {
    if (!sessionStorage.getItem(SESSION_FT)) {
      sessionStorage.setItem(SESSION_FT, JSON.stringify(attributionData));
    }
  } catch (e) {}

  try {
    if (typeof document !== "undefined" && !document.cookie.split("; ").some(c => c.startsWith(`${COOKIE_FTP}=`))) {
      const encoded = safeEncode(attributionData);
      if (encoded) {
        document.cookie = `${COOKIE_FTP}=${encoded}; Max-Age=34560000; Path=/; SameSite=Lax`;
      }
    }
  } catch (e) {}

  try {
    const params = new URLSearchParams(window.location.search);
    const subscriberId = params.get("ck_subscriber_id");
    
    if (subscriberId && /^\d{1,20}$/.test(subscriberId)) {
      const subData = {
        id: subscriberId,
        campaign: params.get("utm_campaign") || null,
        at: attributionData.at
      };

      let existingSub = null;
      if (typeof document !== "undefined") {
        const kitCookie = document.cookie.split("; ").find(c => c.startsWith(`${COOKIE_KIT}=`));
        if (kitCookie) {
          try {
            const raw = kitCookie.slice(COOKIE_KIT.length + 1);
            const parsed = JSON.parse(decodeURIComponent(raw));
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              existingSub = parsed;
            }
          } catch (e) {}
        }
      }

      if (!existingSub || existingSub.id !== subData.id || existingSub.campaign !== subData.campaign) {
        const encodedSub = safeEncode(subData);
        if (encodedSub) {
          document.cookie = `${COOKIE_KIT}=${encodedSub}; Max-Age=34560000; Path=/; SameSite=Lax`;
        }
      }
    }
  } catch (e) {}
}

export function collectAttribution() {
  try {
    const stored = sessionStorage.getItem(SESSION_FT);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return getUTMParams();
}
