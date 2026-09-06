"use client";

import React from "react";
import AnimatedButton from '@animations/components/AnimatedButton'; 
import NavLink from "@components/NavLink";
import RollerNumber from "@animations/components/RollerNumber";
import { CheckList as FeatureList } from "@components/sections/FAQSection";
import { PppLabel } from "@/components/pricing/PppLabel";
import SiteConfig, { effectiveCyclePrice, effectiveCycleTotal } from "@config/siteConfig";

import { relativeShipped } from "@components/sections/JustShipped";

import { isOfferActive } from "@config/siteConfig";

import { getPppDisplayPrice, getPppEffectivePrice } from "@components/checkout/KitPrice";

import { usePppTier } from "@hooks/usePppGeo";

import { analytics } from "@lib/analytics/analytics";

import { t } from "@/lib/i18n";

const THEME_CLASSES = {
  dark: "bg-foreground text-background",
  surface: "bg-surface text-foreground",
  "surface-light": "bg-foreground/[0.06] text-foreground"
};

const TOTAL_COMPONENTS = SiteConfig?.animationStats?.totalCount ?? 50;

export default function PricingCard({
  plan,
  cycle,
  isLoading = false,
  onCheckout,
  rollerDuration = 2,
  latestShip = null,
  shippedRecently = 0
}) {
  const cycleDetails = plan[cycle];
  const themeClass = THEME_CLASSES[plan.surface] ?? THEME_CLASSES.surface;
  const isDark = plan.surface === "dark";
  const mutedTextClass = isDark ? "text-background/70" : "text-foreground-muted";
  const dimTextClass = isDark ? "text-background/70" : "text-foreground/70";

  const offerActive = isOfferActive();
  const pppTier = usePppTier();

  const pppDisplay = pppTier ? getPppDisplayPrice(plan.key, cycle, pppTier) : null;
  const defaultPrice = effectiveCyclePrice(cycleDetails);

  const displayPrice = pppDisplay ? pppDisplay.price : defaultPrice;
  const cycleTotal = pppDisplay ? pppDisplay.cycleTotal : effectiveCycleTotal(cycleDetails);

  const hasPpp = !!pppDisplay;
  const showOfferStrike = !hasPpp && offerActive && typeof cycleDetails.listPrice === "number" && cycleDetails.listPrice > displayPrice;

  const strikethroughPrice = hasPpp ? defaultPrice : showOfferStrike ? cycleDetails.listPrice : null;
  const priceId = cycleDetails.priceId;

  const calculateSavings = (planObj, tier) => {
    if (tier) {
      const pppQuarterly = getPppEffectivePrice(planObj.key, "quarterly", tier);
      const pppYearly = getPppEffectivePrice(planObj.key, "yearly", tier);
      if (pppQuarterly != null && pppYearly != null) {
        const pppSavings = 4 * pppQuarterly - pppYearly;
        return pppSavings > 0 ? pppSavings : 0;
      }
    }
    const defaultQuarterly = effectiveCyclePrice(planObj.quarterly) ?? 0;
    const defaultYearly = effectiveCyclePrice(planObj.yearly) ?? 0;
    const defaultSavings = (defaultQuarterly * 12) - defaultYearly;
    return defaultSavings > 0 ? defaultSavings : 0;
  };

  const savingsAmount = calculateSavings(plan, pppTier);
  const showSavings = cycle === "yearly" && savingsAmount > 0;

  const formatFeatures = (features, { shippedRecently: recentCount = 0 } = {}) => {
    return features.map(feature => {
      if (typeof feature === "string") return feature;
      
      if (feature?.componentCount) {
        return {
          label: t("pricing.tiers.allComponents", { count: TOTAL_COMPONENTS }),
          highlight: true
        };
      }
      
      if (feature?.shippedRecently) {
        return recentCount >= 2 ? {
          label: t("pricing.tiers.shippedRecently", { count: recentCount }),
          solid: true
        } : null;
      }
      
      return feature?.label || "";
    }).filter(Boolean);
  };

  const featuresList = formatFeatures(plan.features || [], { shippedRecently }).map(feature => {
    if (typeof feature === "string") return feature;
    
    if (feature.highlight) {
      return {
        label: feature.label,
        className: isDark ? "!text-background font-medium" : "!text-foreground font-medium"
      };
    }
    
    if (feature.solid) {
      return {
        label: feature.label,
        className: isDark ? "!text-background" : "!text-foreground"
      };
    }
    
    return feature;
  });

  return (
    <article
      className={`pricing-card relative flex h-full flex-col p-32 lg:p-40 ${themeClass}`}
      data-popular={plan.isPopular ? "true" : undefined}
    >
      <header className="flex items-start justify-between gap-16">
        {plan.isPopular ? (
          <span className="text-mono-sm text-brand">
            {t("pricing.tiers.mostPopular")}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        {plan.seatTag ? (
          <span className={`text-mono-sm ${dimTextClass}`}>
            {plan.seatTag}
          </span>
        ) : null}
      </header>

      <div className="mt-32">
        <p className={`text-h4 font-normal ${dimTextClass}`}>
          {plan.name}
        </p>
        
        {hasPpp ? (
          <div className="mt-4 flex justify-start">
            <PppLabel />
          </div>
        ) : showOfferStrike ? (
          <p className="mt-4 text-mono-sm text-brand">
            {t("pricing.tiers.offerName")}
          </p>
        ) : null}
        
        <div
          className="mt-8 flex items-baseline gap-6"
          aria-label={
            hasPpp
              ? t("pricing.tiers.pppAria", { price: defaultPrice, cycle: cycleDetails.cycleLabel })
              : showOfferStrike
              ? t("pricing.tiers.offerAria", { price: cycleDetails.listPrice, cycle: cycleDetails.cycleLabel })
              : undefined
          }
        >
          <span className="text-h2 font-medium tracking-tight inline-flex items-baseline">
            <span>€</span>
            <RollerNumber
              value={displayPrice}
              triggerMode="immediate"
              duration={rollerDuration}
              valueChangeDuration={0.8}
              className="text-h2 font-medium leading-none"
            />
          </span>
          {strikethroughPrice != null ? (
            <span className={`text-body line-through ${mutedTextClass}`}>
              €{strikethroughPrice}
            </span>
          ) : null}
          <span className={`text-body ${mutedTextClass}`}>
            {cycleDetails.cycleLabel}
          </span>
        </div>

        {cycleTotal ? (
          <p className={`text-body-sm mt-6 ${mutedTextClass}`}>
            {hasPpp
              ? t("pricing.tiers.billedQuarterlyExact", { total: cycleTotal })
              : t("pricing.tiers.billedQuarterly")}
          </p>
        ) : null}

        <div
          className="grid transition-all duration-500 ease-power4-in-out"
          style={{ gridTemplateRows: showSavings ? "1fr" : "0fr" }}
          aria-hidden={!showSavings}
        >
          <div className="overflow-hidden">
            <p className="text-mono-sm pt-12 text-brand">
              {t("pricing.tiers.savings", { amount: savingsAmount })}
            </p>
          </div>
        </div>
      </div>

      {plan.pitch ? (
        <p className={`text-body mt-24 max-w-[28ch] ${mutedTextClass}`}>
          {plan.pitch}
        </p>
      ) : null}

      <div className="mb-auto mt-32">
        <FeatureList
          items={featuresList}
          itemClassName={`text-body leading-snug ${isDark ? "text-background/90" : "text-foreground/85"}`}
        />
        {latestShip ? (
          <p className={`text-body-sm mt-20 ${mutedTextClass}`}>
            {t("pricing.tiers.latestShip")}:{" "}
            <NavLink
              href={`/animations/${latestShip.slug}`}
              inline={true}
              className={isDark ? "text-background" : "text-foreground"}
            >
              {latestShip.title}
            </NavLink>{" "}
            ·{" "}
            {relativeShipped(latestShip.published_at || latestShip.created_at)}
          </p>
        ) : null}
      </div>

      <div className="mt-40 flex">
        <AnimatedButton
          theme="brand"
          size="sm"
          className="w-full justify-center sm:w-auto"
          onClick={() => {
            analytics.track("pricing_plan_selected", {
              plan: plan.key,
              cycle: cycle,
              price: displayPrice,
              ...(pppTier ? { ppp_tier: pppTier } : {})
            });
            onCheckout?.(plan.key, priceId);
          }}
          aria-label={t("pricing.tiers.ctaAria", { cta: plan.cta, cycle: cycle })}
          loading={isLoading}
        >
          {plan.cta}
        </AnimatedButton>
      </div>
      
      <p className={`text-body-sm mt-16 ${mutedTextClass}`}>
        {t("pricing.tiers.cardFinePrint")}
      </p>
    </article>
  );
}