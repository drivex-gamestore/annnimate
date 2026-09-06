import { sanityClient } from "@lib/sanity/client";

export async function getProjectBySlug(slug) {
  const query = `*[_type == "project" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    tags,
    hero,
    pageBuilder[]{
      sectionType,
      enabled,
      contentBlockRef->{content, layout, theme},
      mediaSectionRef->{theme, items}
    }
  }`;

  return sanityClient.fetch(query, { slug });
}
