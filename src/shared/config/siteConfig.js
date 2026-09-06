const isForceProd = process.env.NEXT_PUBLIC_FORCE_PRODUCTION === "true";
const forceTrueOverride = true;
const isProduction = forceTrueOverride || isForceProd;

const APP_PRICES_TEST = {
  pro: "price_1SmdgaRvKRKuKXmGKUEtcEIW",
  team: "price_1Sme0wRvKRKuKXmGxvFcJSSH",
  lifetimePro: "price_1So4YrRvKRKuKXmGGv53ZBWU"
};

const APP_PRICES_PROD = {
  pro: "price_1SgkfFRvKRKuKXmGBrzPYauv",
  team: "price_1SgkfDRvKRKuKXmGDhPp0Iex",
  lifetimePro: "price_1So4WaRvKRKuKXmGYkYZt35Z"
};

const LANDING_PRICES_TEST = {
  soloYearly: "price_1TdFEoRvKRKuKXmGEiYeo97J",
  soloMonthly: "price_1TdFEoRvKRKuKXmGV7jD9iQh",
  studioYearly: "price_1TdFEpRvKRKuKXmGRymGG43K",
  studioMonthly: "price_1TdFEqRvKRKuKXmGB65QEdGD",
  studioPlusYearly: "price_1TdFErRvKRKuKXmGK0DYsOMB",
  studioPlusMonthly: "price_1TdFErRvKRKuKXmGxGTqkdgI"
};

const LANDING_PRICES_PROD = {
  soloYearly: "price_1TdFH5RvKRKuKXmGDXlyHBFY",
  soloMonthly: "price_1TdFH5RvKRKuKXmGV7QKmzVy",
  studioYearly: "price_1TdFH6RvKRKuKXmGo7qkBvqi",
  studioMonthly: "price_1TdFH7RvKRKuKXmGyVfG3wrm",
  studioPlusYearly: "price_1TdFH8RvKRKuKXmGJOKCdxYD",
  studioPlusMonthly: "price_1TdFH8RvKRKuKXmGss4l59Cn"
};

const LAUNCH_OFFERS_TEST = {
  soloYearly: null,
  soloMonthly: null,
  studioYearly: null,
  studioMonthly: null,
  studioPlusYearly: null,
  studioPlusMonthly: null
};

const LAUNCH_OFFERS_PROD = {
  soloYearly: "price_1TfRAbRvKRKuKXmGrVbCZJxA",
  soloMonthly: "price_1TfRKuRvKRKuKXmGFpW9zSaJ",
  studioYearly: "price_1TfRAcRvKRKuKXmG0pFVPJWM",
  studioMonthly: "price_1TfRKvRvKRKuKXmG8QnoNbJw",
  studioPlusYearly: "price_1TfRAcRvKRKuKXmG7hO4XkFp",
  studioPlusMonthly: "price_1TfRKxRvKRKuKXmGR4qWpnDv"
};

export const prices = isProduction ? APP_PRICES_PROD : APP_PRICES_TEST;
export const landingPrices = isProduction ? LANDING_PRICES_PROD : LANDING_PRICES_TEST;
const launchOffers = isProduction ? LAUNCH_OFFERS_PROD : LAUNCH_OFFERS_TEST;

const QUARTERLY_PRICES_TEST = {
  soloQuarterly: "price_1U1UGJRvKRKuKXmGM8VegBXN",
  studioQuarterly: "price_1U1UGKRvKRKuKXmGRpBeCyzG",
  studioPlusQuarterly: "price_1U1UGMRvKRKuKXmGBf0wcs7Y"
};

const QUARTERLY_PRICES_PROD = {
  soloQuarterly: "price_1U1UHGRvKRKuKXmGFm3YYFT2",
  studioQuarterly: "price_1U1UHHRvKRKuKXmGQjtP5l3d",
  studioPlusQuarterly: "price_1U1UHJRvKRKuKXmG3vkO8i8k"
};

export const quarterlyPrices = isProduction ? QUARTERLY_PRICES_PROD : QUARTERLY_PRICES_TEST;

const KIT_PRICES_TEST = {
  reveal: "price_1TlTU4RvKRKuKXmGzj8ym0l2",
  menu: "price_1U8HC9RvKRKuKXmGSeaIMCbI",
  "landing-pack": "price_1UBAN6RvKRKuKXmGsqHMpbEY"
};

const KIT_PRICES_PROD = {
  reveal: "price_1TlTXHRvKRKuKXmGl62rlPoa",
  menu: "price_1U8HFfRvKRKuKXmGVBlPxC8O",
  "landing-pack": "price_1UBANXRvKRKuKXmG8FC9WzzA"
};

const kitPrices = isProduction ? KIT_PRICES_PROD : KIT_PRICES_TEST;


(function({
  prices = {},
  landingPricesTest = {},
  landingPricesProd = {},
  launchOfferTest = {},
  launchOfferProd = {},
  kitPricesTest = {},
  kitPricesProd = {},
  extra = []
} = {}) {
  let validPrices = new Set();
  let addPrice = (p) => {
    if (typeof p === "string" && p.startsWith("price_")) {
      validPrices.add(p);
    }
  };
  for (let group of [prices, landingPricesTest, landingPricesProd, launchOfferTest, launchOfferProd, kitPricesTest, kitPricesProd]) {
    for (let p of Object.values(group || {})) {
      addPrice(p);
    }
  }
  for (let p of extra) {
    addPrice(p);
  }
})({
  prices: {
    ...APP_PRICES_TEST,
    ...APP_PRICES_PROD
  },
  landingPricesTest: LANDING_PRICES_TEST,
  landingPricesProd: LANDING_PRICES_PROD,
  launchOfferTest: LAUNCH_OFFERS_TEST,
  launchOfferProd: LAUNCH_OFFERS_PROD,
  kitPricesTest: KIT_PRICES_TEST,
  kitPricesProd: KIT_PRICES_PROD,
  extra: [...Object.values(QUARTERLY_PRICES_TEST), ...Object.values(QUARTERLY_PRICES_PROD)]
});

export const PACK_SLUGS = ["landing-pack"];

export function getKitPriceId(slug) {
  return kitPrices[slug] || null;
}

export function isOfferActive() {
  return true;
}

export function effectiveCyclePrice(cycleObj) {
  if (!cycleObj) return null;
  if (isOfferActive()) return cycleObj.price;
  return cycleObj.listPrice ?? cycleObj.price;
}

export function effectiveCycleTotal(cycleObj) {
  if (!cycleObj?.cycleTotal) return null;
  if (isOfferActive()) return cycleObj.cycleTotal;
  return cycleObj.listCycleTotal ?? cycleObj.cycleTotal;
}

const siteConfig = {
  appName: "Annnimate",
  appDescription: "Production GSAP motion components for React and Vue. Every component shipped on a real brand site before it reached the library. By Good Fella.",
  domainName: "annnimate.com",
  crisp: {
    id: "",
    onlyShowOnRoutes: ["/"]
  },
  stripe: {
    plans: [
      {
        isFeatured: true,
        priceId: prices.pro,
        name: "Pro",
        description: "Perfect for individual designers and developers.",
        price: 199,
        priceAnchor: null,
        userAmount: 1,
        isBillingCycle: "yearly",
        features: [
          { name: "Full access to animation library" },
          { name: "All code formats (HTML, React, Webflow)" },
          { name: "GSAP integration" },
          { name: "Save & organize favorites" },
          { name: "New animations monthly" },
          { name: "Documentation & support" },
          { name: "All future updates" }
        ]
      },
      {
        priceId: prices.team,
        name: "Team",
        description: "For agencies and teams collaborating on projects.",
        price: 300,
        priceAnchor: null,
        isBillingCycle: "yearly",
        userAmount: 3,
        additionalInfo: "Includes 3 seats, +€159/year per additional seat",
        features: [
          { name: "Everything in Pro" },
          { name: "Minimum 3 team members included" },
          { name: "Shared team workspace" },
          { name: "Team collaboration tools" },
          { name: "Priority support" },
          { name: "Additional seats: €159/year each" }
        ]
      }
    ],
    landingPlans: [
      {
        key: "solo",
        name: "Solo",
        cta: "Get Solo",
        surface: "dark",
        isPopular: true,
        seatTag: "1 seat",
        pitch: "For one developer working solo or on freelance work.",
        yearly: {
          price: 199,
          listPrice: 249,
          priceId: landingPrices.soloYearly,
          cycleLabel: "/year"
        },
        quarterly: {
          price: 20,
          listPrice: 29,
          cycleTotal: 60,
          listCycleTotal: 87,
          priceId: quarterlyPrices.soloQuarterly,
          cycleLabel: "/month"
        },
        features: [
          { componentCount: true },
          { shippedRecently: true },
          "React, Vue and HTML",
          "MCP server for Cursor and Claude Code",
          "New components as they ship",
          "Documentation and support"
        ]
      },
      {
        key: "studio",
        name: "Studio",
        cta: "Get Studio",
        surface: "surface",
        seatTag: "5 seats",
        pitch: "For a small studio or team shipping client work.",
        yearly: {
          price: 549,
          listPrice: 699,
          priceId: landingPrices.studioYearly,
          cycleLabel: "/year"
        },
        quarterly: {
          price: 55,
          listPrice: 79,
          cycleTotal: 165,
          listCycleTotal: 237,
          priceId: quarterlyPrices.studioQuarterly,
          cycleLabel: "/month"
        },
        features: [
          "5 seats, one subscription",
          "Everything in Solo, for every seat",
          "MCP server for the whole team",
          "Priority support"
        ]
      },
      {
        key: "studio-plus",
        name: "Studio+",
        cta: "Get Studio+",
        surface: "surface-light",
        seatTag: "15 seats",
        pitch: "For a larger team shipping a lot of client work.",
        yearly: {
          price: 1199,
          listPrice: 1499,
          priceId: landingPrices.studioPlusYearly,
          cycleLabel: "/year"
        },
        quarterly: {
          price: 119,
          listPrice: 169,
          cycleTotal: 357,
          listCycleTotal: 507,
          priceId: quarterlyPrices.studioPlusQuarterly,
          cycleLabel: "/month"
        },
        features: [
          "15 seats, one subscription",
          "Everything in Studio, for every seat",
          "Priority support"
        ]
      }
    ],
    addons: []
  },
  aws: {
    bucket: "bucket-name",
    bucketUrl: "https://bucket-name.s3.amazonaws.com/",
    cdn: "https://cdn-id.cloudfront.net/"
  },
  resend: {
    fromNoReply: "Annnimate <noreply@annnimate.com>",
    fromAdmin: "Team at Annnimate <team@annnimate.com>",
    supportEmail: "support@annnimate.com",
    contactEmail: "contact@annnimate.com"
  },
  colors: {
    main: "#b3fca0"
  },
  auth: {
    loginUrl: "/login",
    callbackUrl: "/animations"
  },
  animationStats: {
    totalCount: 89,
    displayCount: "80+"
  },
  featureFlags: {
    earlyAccessFeatures: ["ai_code_generation_v2", "animation_composer", "team_workspaces", "advanced_customization"],
    adminOnlyFeatures: [],
    disabledFeatures: []
  },
  adminMetrics: {
    monthlyInfraCostEur: 20
  }
};

export default SiteConfig;