"use client";

import React from "react";
import { usePppTier } from "@hooks/usePppGeo";


const PPP_PLANS = {
  solo: {
    quarterly: { list: 87, T2: 42, T3: 30 },
    yearly: { list: 249, T2: 139, T3: 99 }
  },
  studio: {
    quarterly: { list: 237, T2: 115, T3: 85 },
    yearly: { list: 699, T2: 385, T3: 275 }
  },
  "studio-plus": {
    quarterly: { list: 507, T2: 249, T3: 179 },
    yearly: { list: 1499, T2: 839, T3: 599 }
  }
};

export function getPppEffectivePrice(plan, cycle, tier) {
  const planData = PPP_PLANS[plan]?.[cycle];
  return planData && (tier === "T2" || tier === "T3") ? planData[tier] ?? null : null;
}

export const PPP_KIT_PRICING = {
  reveal: { list: 149, T2: 105, T3: 75 },
  menu: { list: 149, T2: 105, T3: 75 }
};

export function getPppKitEffectivePrice(kitSlug, tier) {
  const kitData = PPP_KIT_PRICING[kitSlug];
  return kitData && (tier === "T2" || tier === "T3") ? kitData[tier] ?? null : null;
}

export function getPppDisplayPrice(plan, cycle, tier) {
  const effectivePrice = getPppEffectivePrice(plan, cycle, tier);
  if (effectivePrice == null) return null;

  return cycle === "quarterly"
    ? { price: Math.ceil(effectivePrice / 3), cycleTotal: effectivePrice }
    : { price: effectivePrice, cycleTotal: null };
}


export default function KitPrice({ kitSlug, fallback = null, struckClassName = "" }) {
  const pppTier = usePppTier();
  const pppPrice = pppTier ? getPppKitEffectivePrice(kitSlug, pppTier) : null;

  if (pppPrice == null) return fallback;

  const listPrice = PPP_KIT_PRICING[kitSlug]?.list;

  return (
    <span aria-label={`€${pppPrice}, regularly €${listPrice}`}>
      €{pppPrice}{" "}
      <s aria-hidden="true" className={struckClassName}>
        €{listPrice}
      </s>
    </span>
  );
}
