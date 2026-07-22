import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/admin/",
        "/*/cart",
        "/*/checkout",
        "/*/order-success/",
        "/api/",
        "/*/catalog?*",
        "/*?q=",
        "/*?*sort=",
        "/*?*page=",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
