
import { useState, useEffect, Suspense, Fragment } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { createClient } from '../supabase/supabaseClient'; 
import siteConfig from '@config/siteConfig'; 
import { analytics } from '../analytics/analytics'; 
import { getConsent } from '@config/consent';

const POSTHOG_KEY = 'phc_Yecr0Uo2VzDFAMckw6XdMeHxMC8JorR3xFeMYmtBm3v';
const POSTHOG_PROXY = '/relay-A8q3';
const POSTHOG_UI = 'https://eu.posthog.com';
const SENSITIVE_KEYS = ['token_hash', 'token', 'code', 'access_token', 'refresh_token'];

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !window.posthog || typeof window.posthog.capture !== 'function') return;

    let sanitizedQuery = '';
    if (searchParams?.toString()) {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of SENSITIVE_KEYS) {
        params.delete(key);
      }
      sanitizedQuery = params.toString();
    }

    let currentUrl = window.origin + pathname;
    if (sanitizedQuery) {
      currentUrl += `?${sanitizedQuery}`;
    }

    window.posthog.capture('$pageview', {
      $current_url: currentUrl,
      $pathname: pathname,
      $search_params: sanitizedQuery
    });
  }, [pathname, searchParams]);

  return null;
}

function ConsentConfigListener() {
  useEffect(() => {
    const syncPostHogConsent = () => {
      const ph = window.posthog;
      if (!ph || typeof ph.set_config !== 'function') return;

      let isAnalyticsAllowed = false;
      try {
        const cookieMatch = document.cookie.match(/(?:^|; )annnimate_consent=([^;]+)/);
        if (cookieMatch) {
          const parsed = JSON.parse(atob(decodeURIComponent(cookieMatch[1])));
          isAnalyticsAllowed = parsed && parsed.analytics === true;
        }
      } catch {
        isAnalyticsAllowed = false;
      }

      if (isAnalyticsAllowed) {
        ph.set_config({
          persistence: 'localStorage+cookie',
          autocapture: true,
          disable_session_recording: false
        });
        if (typeof ph.startSessionRecording === 'function') {
          ph.startSessionRecording();
        }
      } else {
        if (typeof ph.stopSessionRecording === 'function') {
          ph.stopSessionRecording();
        }
        ph.set_config({
          persistence: 'memory',
          autocapture: false,
          disable_session_recording: true
        });
        document.cookie.split('; ').forEach((cookieStr) => {
          const cookieName = cookieStr.split('=')[0];
          if (cookieName.startsWith('ph_')) {
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        });
      }
    };
    window.addEventListener('annnimate:consent-changed', syncPostHogConsent);
    return () => window.removeEventListener('annnimate:consent-changed', syncPostHogConsent);
  }, []);

  return null;
}

function PostHogLoader() {
  if (!POSTHOG_KEY || POSTHOG_KEY.includes('YOUR_PROJECT_API_KEY')) return null;

  return (
    <Fragment>
      <Script
        id="posthog-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags startSessionRecording stopSessionRecording captureException".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

            (function () {
              var allowed = false;
              try {
                var match = document.cookie.match(/(?:^|; )annnimate_consent=([^;]+)/);
                if (match) {
                  var data = JSON.parse(atob(decodeURIComponent(match[1])));
                  allowed = data && data.analytics === true;
                }
              } catch (_) { allowed = false; }

              var SENSITIVE_RE = /([?&])(token_hash|token|code|access_token|refresh_token)=[^&#]*/g;
              var sanitize = function (props) {
                for (var k in props) {
                  if (typeof props[k] === 'string' && props[k].indexOf('=') !== -1) {
                    props[k] = props[k].replace(SENSITIVE_RE, '$1$2=REDACTED');
                  }
                }
                return props;
              };

              var cookieless = {
                api_host: '${POSTHOG_PROXY}',
                ui_host: '${POSTHOG_UI}',
                sanitize_properties: sanitize,
                persistence: 'memory',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: false,
                autocapture: false,
                capture_dead_clicks: false,
                capture_heatmaps: false,
                disable_surveys: true,
                disable_session_recording: true,
                disable_web_experiments: true
              };

              var full = {
                api_host: '${POSTHOG_PROXY}',
                ui_host: '${POSTHOG_UI}',
                sanitize_properties: sanitize,
                persistence: 'localStorage+cookie',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                autocapture: true,
                capture_dead_clicks: false,
                capture_heatmaps: false,
                disable_surveys: true,
                disable_session_recording: false,
                disable_web_experiments: true,
                session_recording: { maskAllInputs: true, maskTextContent: false }
              };

              posthog.init('${POSTHOG_KEY}', allowed ? full : cookieless);
            })();
          `
        }}
      />
      <ConsentConfigListener />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </Fragment>
  );
}

function CrispChat() {
  const pathname = usePathname();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  useEffect(() => {
    if (userId && window.$crisp) {
      window.$crisp.push(['set', 'session:data', [[['userId', userId]]]]);
    }
  }, [userId]);

  useEffect(() => {
    if (!siteConfig?.crisp?.id) return;
    const timer = setTimeout(() => {
      if (
        window.$crisp &&
        siteConfig.crisp.onlyShowOnRoutes &&
        !siteConfig.crisp.onlyShowOnRoutes.includes(pathname)
      ) {
        window.$crisp.push(['do', 'chat:hide']);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!siteConfig?.crisp?.id) return null;

  return (
    <Fragment>
      <Script
        id="crisp-stub"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.$crisp=[];window.CRISP_WEBSITE_ID="${siteConfig.crisp.id}";
          `
        }}
      />
      <Script
        id="crisp-loader"
        strategy="afterInteractive"
        type="text/partytown"
        src="https://client.crisp.chat/l.js"
        async
      />
    </Fragment>
  );
}

function GlobalErrorReporter() {
  useEffect(() => {
    let errorCount = 0;
    const reportedKeys = new Set();

    const report = (source, err, extra) => {
      const message = err?.message || String(err ?? '');
      if (!message || errorCount >= 25) return;

      const dedupeKey = `${source}|${message.slice(0, 200)}`;
      if (!reportedKeys.has(dedupeKey)) {
        reportedKeys.add(dedupeKey);
        errorCount += 1;
        try {
          analytics.error.exception(err instanceof Error ? err : Error(message), {
            source,
            ...extra
          });
        } catch {
          
        }
      }
    };

    const handleError = (e) => {
      report('uncaught_error', e?.error || Error(e?.message || ''), {
        file: e?.filename,
        line: e?.lineno,
        path: window.location?.pathname
      });
    };

    const handleRejection = (e) => {
      const reason = e?.reason;
      report('unhandled_rejection', reason instanceof Error ? reason : Error(String(reason ?? '')), {
        path: window.location?.pathname
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}

export function ConsentAwareAnalytics() {
  const [consent, setConsentState] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsentState(getConsent());

    const updateConsent = () => setConsentState(getConsent());
    window.addEventListener('annnimate:consent-changed', updateConsent);
    return () => window.removeEventListener('annnimate:consent-changed', updateConsent);
  }, []);

  if (!mounted) return null;

  return (
    <Fragment>
      <PostHogLoader />
      <GlobalErrorReporter />
      {consent?.functional && <CrispChat />}
    </Fragment>
  );
}

export default ConsentAwareAnalytics;
