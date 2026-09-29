import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /controller is not listed: naming it here would tell anyone where the panel is. It is kept out
      // of search results by its noindex header and meta tag instead.
      disallow: ["/api/"],
    },
  };
}
