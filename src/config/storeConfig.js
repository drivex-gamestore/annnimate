const isForceProduction = process.env.NEXT_PUBLIC_FORCE_PRODUCTION === "true";

const isDevEnv = true;
const useTestPrices = isDevEnv || isForceProduction;

const pricesProd = {
  pro: "price_1SmdgaRvKRKuKXmGKUEtcEIW",
  team: "price_1Sme0wRvKRKuKXmGxvFcJSSH",
  lifetimePro: "price_1So4YrRvKRKuKXmGGv53ZBWU"
};

const pricesTest = {
  pro: "price_1SgkfFRvKRKuKXmGBrzPYauv",
  team: "price_1SgkfDRvKRKuKXmGDhPp0Iex",
  lifetimePro: "price_1So4WaRvKRKuKXmGYkYZt35Z"
};

const landingPricesProd = {
  soloYearly: "price_1TdFEoRvKRKuKXmGEiYeo97J",
  soloMonthly: "price_1TdFEoRvKRKuKXmGV7jD9iQh",
  studioYearly: "price_1TdFEpRvKRKuKXmGRymGG43K",
  studioMonthly: "price_1TdFEqRvKRKuKXmGB65QEdGD",
  studioPlusYearly: "price_1TdFErRvKRKuKXmGK0DYsOMB",
  studioPlusMonthly: "price_1TdFErRvKRKuKXmGxGTqkdgI"
};

const landingPricesTest = {
  soloYearly: "price_1TdFH5RvKRKuKXmGDXlyHBFY",
  soloMonthly: "price_1TdFH5RvKRKuKXmGV7QKmzVy",
  studioYearly: "price_1TdFH6RvKRKuKXmGo7qkBvqi",
  studioMonthly: "price_1TdFH7RvKRKuKXmGyVfG3wrm",
  studioPlusYearly: "price_1TdFH8RvKRKuKXmGJOKCdxYD",
  studioPlusMonthly: "price_1TdFH8RvKRKuKXmGss4l59Cn"
};

const launchOfferProd = {
  soloYearly: null,
  soloMonthly: null,
  studioYearly: null,
  studioMonthly: null,
  studioPlusYearly: null,
  studioPlusMonthly: null
};

const launchOfferTest = {
  soloYearly: "price_1TfRAbRvKRKuKXmGrVbCZJxA",
  soloMonthly: "price_1TfRKuRvKRKuKXmGFpW9zSaJ",
  studioYearly: "price_1TfRAcRvKRKuKXmG0pFVPJWM",
  studioMonthly: "price_1TfRKvRvKRKuKXmG8QnoNbJw",
  studioPlusYearly: "price_1TfRAcRvKRKuKXmG7hO4XkFp",
  studioPlusMonthly: "price_1TfRKxRvKRKuKXmGR4qWpnDv"
};

export const prices = useTestPrices ? pricesTest : pricesProd;
export const landingPrices = useTestPrices ? landingPricesTest : landingPricesProd;
const launchOfferPrices = useTestPrices ? launchOfferTest : launchOfferProd;

const quarterlyPricesProd = {
  soloQuarterly: "price_1U1UGJRvKRKuKXmGM8VegBXN",
  studioQuarterly: "price_1U1UGKRvKRKuKXmGRpBeCyzG",
  studioPlusQuarterly: "price_1U1UGMRvKRKuKXmGBf0wcs7Y"
};

const quarterlyPricesTest = {
  soloQuarterly: "price_1U1UHGRvKRKuKXmGFm3YYFT2",
  studioQuarterly: "price_1U1UHHRvKRKuKXmGQjtP5l3d",
  studioPlusQuarterly: "price_1U1UHJRvKRKuKXmG3vkO8i8k"
};

export const quarterlyPrices = useTestPrices ? quarterlyPricesTest : quarterlyPricesProd;

export function isOfferActive() {
  return true;
}

const kitPricesProd = {
  reveal: "price_1TlTU4RvKRKuKXmGzj8ym0l2",
  menu: "price_1U8HC9RvKRKuKXmGSeaIMCbI",
  "landing-pack": "price_1UBAN6RvKRKuKXmGsqHMpbEY"
};

const kitPricesTest = {
  reveal: "price_1TlTXHRvKRKuKXmGl62rlPoa",
  menu: "price_1U8HFfRvKRKuKXmGVBlPxC8O",
  "landing-pack": "price_1UBANXRvKRKuKXmG8FC9WzzA"
};

const kitPrices = useTestPrices ? kitPricesTest : kitPricesProd;


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
  let uniquePrices = new Set();
  let addPrice = (priceId) => {
    if (typeof priceId === "string" && priceId.startsWith("price_")) {
      uniquePrices.add(priceId);
    }
  };

  for (let group of [prices, landingPricesTest, landingPricesProd, launchOfferTest, launchOfferProd, kitPricesTest, kitPricesProd]) {
    for (let priceId of Object.values(group || {})) {
      addPrice(priceId);
    }
  }

  for (let priceId of extra) {
    addPrice(priceId);
  }
})({
  prices: {
    ...pricesProd,
    ...pricesTest
  },

  landingPricesTest: landingPricesProd,
  landingPricesProd: landingPricesTest,
  launchOfferTest: launchOfferProd,
  launchOfferProd: launchOfferTest,
  kitPricesTest: kitPricesProd,
  kitPricesProd: kitPricesTest,
  extra: [...Object.values(quarterlyPricesProd), ...Object.values(quarterlyPricesTest)]
});

export const PACK_SLUGS = ["landing-pack"];

export const getKitPriceId = (slug) => {
  return kitPrices[slug] || null;
};

const storeConfig = {
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

export const effectiveCyclePrice = (plan) => {
  return plan
    ? isOfferActive()
      ? plan.price
      : (plan.listPrice ?? plan.price)
    : null;
};

export const effectiveCycleTotal = (plan) => {
  return plan?.cycleTotal
    ? isOfferActive()
      ? plan.cycleTotal
      : (plan.listCycleTotal ?? plan.cycleTotal)
    : null;
};

export default storeConfig;

