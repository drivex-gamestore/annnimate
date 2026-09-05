const COOKIE_NAME = 'annnimate_consent';

export const defaultConsent = {
  version: 1,
  timestamp: null,
  essential: true,
  analytics: false,
  functional: false,
  marketing: false,
  method: null
};

export function setConsent(consentData) {
  if (typeof document === 'undefined') return;

  const payload = btoa(
    JSON.stringify({
      ...consentData,
      version: 1,
      timestamp: new Date().toISOString(),
      essential: true
    })
  );

  const expires = new Date();
  expires.setDate(expires.getDate() + 365);

  let cookieString = `${COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

  if (window.location.protocol === 'https:') {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

export function dispatchConsentChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('annnimate:consent-changed'));
  }
}

export function acceptAll() {
  setConsent({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false,
    method: 'explicit'
  });
  dispatchConsentChanged();
}

export function getConsent() {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const encodedValue = cookie.split('=')[1];
    const decodedValue = atob(decodeURIComponent(encodedValue));
    const parsedData = JSON.parse(decodedValue);

    if (parsedData.version !== 1) return null;

    return parsedData;
  } catch (err) {
    return null;
  }
}
