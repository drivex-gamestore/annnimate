"use client";

import React from "react";
import CheckoutButton from "@/components/checkout/CheckoutButton";
import KitPrice from "@/components/pricing/KitPrice";
import ShowreelVideo from "@/components/ui/ShowreelVideo";
import { getKitPriceId } from "@/utils/pricingUtils";
import { t } from "@/lib/i18n";


export default function KitSpotlight({ className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-24 lg:grid-cols-3 ${className}`}>
      
      {}
      <div
        data-theme="dark"
        className="flex flex-col gap-24 bg-background p-24 text-foreground lg:col-span-2 lg:flex-row lg:items-center lg:p-32"
      >
        <ShowreelVideo
          className="aspect-[16/10] w-full shrink-0 lg:order-first lg:w-[300px]"
          label="The Menu Kit showreel"
        />
        <div className="flex flex-1 flex-col">
          <div className="mb-12 flex flex-wrap items-center gap-12">
            <h3 className="text-h4 m-0 text-foreground">
              {t("landing.kitSpotlight.menu.headline")}
            </h3>
            <span className="text-accent-xs bg-brand px-10 py-4 text-[#141314]">
              {t("landing.kitSpotlight.menu.badge")}
            </span>
          </div>
          <p className="text-body-sm m-0 max-w-[52ch] text-foreground-muted">
            {t("landing.kitSpotlight.menu.body")}
          </p>
          <div className="mt-24 flex flex-wrap items-center gap-24">
            <span className="text-h3 leading-none text-foreground">
              <KitPrice
                kitSlug="menu"
                fallback={t("landing.kitSpotlight.menu.price")}
                struckClassName="text-body text-foreground-muted"
              />
            </span>
            <CheckoutButton
              priceId={getKitPriceId("menu")}
              kitSlug="menu"
              kitTitle="Menu"
              size="sm"
            />
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col bg-surface p-24 lg:p-32">
        <div className="mb-12 flex flex-wrap items-center gap-12">
          <h3 className="text-h4 m-0 text-foreground">
            {t("landing.kitSpotlight.reveal.headline")}
          </h3>
          <span className="text-accent-xs bg-brand px-10 py-4 text-[#141314]">
            {t("landing.kitSpotlight.reveal.badge")}
          </span>
        </div>
        <p className="text-body-sm m-0 max-w-[52ch] text-foreground-muted">
          {t("landing.kitSpotlight.reveal.body")}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-24 pt-24">
          <span className="text-h3 leading-none text-foreground">
            <KitPrice
              kitSlug="reveal"
              fallback={t("landing.kitSpotlight.reveal.price")}
              struckClassName="text-body text-foreground-muted"
            />
          </span>
          <CheckoutButton
            priceId={getKitPriceId("reveal")}
            kitSlug="reveal"
            kitTitle="Reveal"
            size="sm"
          />
        </div>
      </div>

    </div>
  );
}