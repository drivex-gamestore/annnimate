import { sanityClient } from "@sanity/sanityClient";

const previewImageProjection = `{
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
}`;

const animationItemProjection = `{
  _key,
  id,
  title,
  category,
  "preview_image": preview_image${previewImageProjection}
}`;

const PLATFORM_MOCKUP_QUERY = `*[_type == "platformMockupSection" && _id == "platformMockupSection"][0]{
  revealOnPageEnter,
  filterBarDemo,
  totalCount,
  "animations": animations[]${animationItemProjection},
  "filterPool": filterPool[]${animationItemProjection}
}`;

export async function getPlatformMockupData() {
  return sanityClient.fetch(PLATFORM_MOCKUP_QUERY, {}, { next: { revalidate: 60 } });
}
