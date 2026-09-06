export const FIRST_TOUCH_COOKIE = "anm_ftp";
export const FIRST_TOUCH_MAX_AGE_S = 3456e4; // 34,560,000 seconds
export const KIT_TOUCH_COOKIE = "anm_kit";

// Mappings:
// u -> getParam
// D -> at
// e -> sid
// t -> subscriberId
export const buildKitTouch = ({ getParam, at = null }) => {
  const sid = getParam("sid");
  const subscriberId = sid && /^[0-9a-f]{16}$/.test(sid) ? sid : getParam("ck_subscriber_id");
  
  return subscriberId && /^(\d{1,20}|[0-9a-f]{16})$/.test(subscriberId)
    ? { id: subscriberId, campaign: getParam("utm_campaign") || null, at: at || null }
    : null;
};


export const parseFirstTouch = (cookieValue) => {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  
  try {
    const parsedData = JSON.parse(decodeURIComponent(cookieValue));
    
    if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
      return null;
    }
    
    return parsedData;
  } catch {
    return null;
  }
};

// Mappings:
// u -> touchData
// D -> serializedData
export const serializeFirstTouch = (touchData) => {
  try {
    const serializedData = encodeURIComponent(JSON.stringify(touchData));
    return serializedData.length <= 800 ? serializedData : null;
  } catch {
    return null;
  }
};

