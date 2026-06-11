import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const canonicalUrl = "https://learn-grep-regex.paulatienza.dev/";
const authorName = "Paul Henry Atienza";
const authorUrl = "https://paulatienza.dev/";
const rootDir = join(__dirname, "..");

describe("SEO files", () => {
  it("declares search metadata for the canonical learning app", () => {
    const html = readFileSync(join(rootDir, "index.html"), "utf8");

    expect(html).toContain("<title>Learn Grep Regex by Paul Henry Atienza</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain("Interactive beginner regex lessons using grep");
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toContain('name="author" content="Paul Henry Atienza"');
    expect(html).toContain(`rel="canonical" href="${canonicalUrl}"`);
    expect(html).toContain(`property="og:url" content="${canonicalUrl}"`);
    expect(html).toContain('property="og:title" content="Learn Grep Regex by Paul Henry Atienza"');
    expect(html).toContain('name="twitter:card" content="summary"');
  });

  it("links Paul Henry Atienza to the app in JSON-LD", () => {
    const html = readFileSync(join(rootDir, "index.html"), "utf8");
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

    expect(jsonLdMatch).not.toBeNull();

    const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? "{}");

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Learn Grep Regex",
      url: canonicalUrl,
      applicationCategory: "EducationalApplication",
      author: {
        "@type": "Person",
        name: authorName,
        url: authorUrl
      },
      creator: {
        "@type": "Person",
        name: authorName,
        url: authorUrl
      },
      sameAs: [authorUrl]
    });
  });

  it("publishes a sitemap with the canonical URL", () => {
    const sitemap = readFileSync(join(rootDir, "public", "sitemap.xml"), "utf8");

    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(sitemap).toContain(`<loc>${canonicalUrl}</loc>`);
  });

  it("publishes robots.txt with the sitemap location", () => {
    const robots = readFileSync(join(rootDir, "public", "robots.txt"), "utf8");

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain(`Sitemap: ${canonicalUrl}sitemap.xml`);
  });
});
