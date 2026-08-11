import type { MetadataRoute } from "next";

import { SEO_PROBLEM_PAGES, getAppUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();

  const staticRoutes = [
    "",
    "/features",
    "/pricing",
    "/docs",
    "/contact",
    "/sign-in",
    "/sign-up",
    "/solutions",
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const solutionEntries: MetadataRoute.Sitemap = SEO_PROBLEM_PAGES.map((page) => ({
    url: `${baseUrl}/solutions/${page.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...solutionEntries];
}
