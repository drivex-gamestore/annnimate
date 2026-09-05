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

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 365);

  let cookieString = `${COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
  if (window.location.protocol === 'https:') {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

export function getConsent() {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  try {
    const rawValue = match.split('=')[1];
    const decoded = atob(decodeURIComponent(rawValue));
    const parsed = JSON.parse(decoded);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function dispatchConsentChanged() {
  window.dispatchEvent(new CustomEvent('annnimate:consent-changed'));
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
