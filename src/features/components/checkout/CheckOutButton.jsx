"use client";

import React from "react";
import AnimatedButton from '@animations/components/AnimatedButton'; 
import { analytics } from "@lib/analytics/analytics";

import { usePppTier } from "@/hooks/usePppTier";

export default function CheckoutButton({
  priceId,
  kitSlug,
  kitTitle,
  size,
  theme = "brand",
  className = "",
  label = "Get the Kit"
}) {
  const isValid = !!priceId && !!kitSlug;
  const pppTier = usePppTier();

  const handleCheckoutClick = () => {
    analytics.track?.("kit_checkout_cta_clicked", {
      kit: kitTitle,
      ...(pppTier ? { ppp_tier: pppTier } : {})
    });
  };

  return (
    <AnimatedButton
      href={isValid ? `/checkout?kit=${kitSlug}` : undefined}
      onClick={handleCheckoutClick}
      theme={theme}
      size={size || "default"}
      className={className}
      disabled={!isValid}
    >
      {label}
    </AnimatedButton>
  );
}
