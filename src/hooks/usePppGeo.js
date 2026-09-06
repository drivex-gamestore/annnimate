import { useState, useEffect } from 'react';

let cachedPppGeo;
let fetchPromise = null;

export function usePppGeo() {
  const [pppGeo, setPppGeo] = useState(
    cachedPppGeo === undefined ? null : cachedPppGeo
  );

  useEffect(() => {
    let isMounted = true;

    const getPppGeo = () => {
      if (cachedPppGeo !== undefined) {
        return Promise.resolve(cachedPppGeo);
      }
      
      if (!fetchPromise) {
        fetchPromise = fetch("/api/geo/ppp")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            cachedPppGeo =
              data?.tier === "T2" || data?.tier === "T3"
                ? {
                    tier: data.tier,
                    country: data.country || null,
                  }
                : null;
            return cachedPppGeo;
          })
          .catch(() => {
            cachedPppGeo = null;
            return null;
          })
          .finally(() => {
            fetchPromise = null;
          });
      }
      
      return fetchPromise;
    };

    getPppGeo().then((result) => {
      if (isMounted && result) {
        setPppGeo(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return pppGeo;
}

export function usePppTier() {
  const pppGeo = usePppGeo();
  return pppGeo?.tier ?? null;
}