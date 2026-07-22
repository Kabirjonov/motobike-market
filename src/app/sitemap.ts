import type { MetadataRoute } from "next";

import { buildSitemap } from "@/lib/sitemap";
import { getIndexableCatalogUrls } from "@/server/repositories/seo-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await getIndexableCatalogUrls());
}
