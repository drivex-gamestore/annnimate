"use client";

import React from "react";
import Switch from "@animations/utils/Switch";
import SegmentedControl from "@animations/components/SegmentedControl";
import siteConfig, { effectiveCyclePrice } from "@config/siteConfig";
import { analytics } from "@lib/analytics/analytics";
import { t } from "@components/helpers/translate";
import { cn } from '@lib/vendor';


export default function PricingCycleToggle({
  cycle,
  onChange,
  variant = "default"
}) {
  const isQuarterly = cycle === "quarterly";

  const maxDiscountPercent = (() => {
    const plans = SiteConfig.stripe?.landingPlans || [];
    let maxDiscount = 0;
    
    for (const plan of plans) {
      const quarterlyPrice = effectiveCyclePrice(plan.quarterly);
      const yearlyPrice = effectiveCyclePrice(plan.yearly);
      
      if (!quarterlyPrice || !yearlyPrice) continue;
      
      const annualizedQuarterlyPrice = 12 * quarterlyPrice;
      if (annualizedQuarterlyPrice <= 0) continue;
      
      const discount = Math.round(
        ((annualizedQuarterlyPrice - yearlyPrice) / annualizedQuarterlyPrice) * 100
      );
      
      if (discount > maxDiscount) {
        maxDiscount = discount;
      }
    }
    
    return maxDiscount > 0 ? maxDiscount : null;
  })();

  const showSavingsHint = isQuarterly && !!maxDiscountPercent;

  const handleToggle = (newCycle) => {
    analytics.track("pricing_cycle_toggled", {
      cycle: newCycle
    });
    onChange(newCycle);
  };

  if (variant === "compact") {
    const getCompactBtnClass = (isActive) => cn(
      "text-mono-sm transition-colors duration-(--duration-quick) ease-(--ease-expo-out)",
      isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground"
    );

    return (
      <div className="inline-flex items-center gap-12">
        <button
          type="button"
          onClick={() => handleToggle("quarterly")}
          className={getCompactBtnClass(isQuarterly)}
        >
          Quarterly
        </button>
        <Switch
          checked={!isQuarterly}
          onChange={(checked) => handleToggle(checked ? "yearly" : "quarterly")}
          label={t("pricing.cycle.toggleAria")}
        />
        <button
          type="button"
          onClick={() => handleToggle("yearly")}
          className={getCompactBtnClass(!isQuarterly)}
        >
          Yearly
        </button>
        {isQuarterly && maxDiscountPercent ? (
          <span className="text-mono-sm text-brand">
            −{maxDiscountPercent}%
          </span>
        ) : null}
      </div>
    );
  }

  const getDefaultBtnClass = (isActive) => cn(
    "relative z-10 px-24 py-12 text-mono-sm transition-colors duration-(--duration-quick) ease-(--ease-expo-out)",
    isActive ? "text-background" : "text-foreground-muted hover:text-foreground"
  );

  return (
    <div className="inline-flex flex-col items-center">
      <SegmentedControl
        activeId={cycle}
        pillClassName="bg-foreground"
        containerClassName="border border-foreground/15 p-4"
        role="radiogroup"
        aria-label={t("pricing.cycle.toggleAria")}
      >
        <button
          type="button"
          role="radio"
          aria-checked={isQuarterly}
          data-flip-id="quarterly"
          onClick={() => handleToggle("quarterly")}
          className={getDefaultBtnClass(isQuarterly)}
        >
          Quarterly
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isQuarterly}
          data-flip-id="yearly"
          onClick={() => handleToggle("yearly")}
          className={getDefaultBtnClass(!isQuarterly)}
        >
          Yearly
        </button>
      </SegmentedControl>
      
      <div
        className="grid w-full overflow-hidden transition-[grid-template-rows,opacity] duration-(--duration-snap) ease-(--ease-power3-out)"
        style={{
          gridTemplateRows: showSavingsHint ? "1fr" : "0fr",
          opacity: showSavingsHint ? 1 : 0
        }}
        aria-hidden={!showSavingsHint}
      >
        <div className="min-h-0">
          <button
            type="button"
            onClick={() => handleToggle("yearly")}
            tabIndex={showSavingsHint ? 0 : -1}
            className="text-mono-sm mt-12 inline-flex items-center gap-8 text-brand transition-opacity duration-(--duration-fast) ease-(--ease-power3-out) hover:opacity-80"
          >
            <span aria-hidden="true" className="relative inline-flex size-8">
              <span className="absolute inset-0 animate-ping bg-brand opacity-60" />
              <span className="relative block size-8 bg-brand" />
            </span>
            {t("pricing.cycle.savingsHint", {
              percent: maxDiscountPercent
            })}
          </button>
        </div>
      </div>
    </div>
  );
}












