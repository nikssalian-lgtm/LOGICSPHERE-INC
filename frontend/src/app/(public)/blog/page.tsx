import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import { getPublicRecords } from "@/lib/public-content";
import { BlogBrowser } from "@/components/blog-browser";
import { PageIntro } from "@/components/public-ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Insights",
  "Ideas and perspectives on software, digital products and building better business systems.",
  "/blog",
);
export default async function BlogPage() {
  await requirePublicSection("/blog");
  const posts = await getPublicRecords("blog");
  return (
    <main id="main" className="public-page">
      <PageIntro
        index="06"
        eyebrow="INSIGHTS / NOTES FROM THE WORK"
        title={
          <>
            Ideas for a more
            <br />
            <em>thoughtful digital world.</em>
          </>
        }
        description="Perspectives on software, product design and the details that make technology work for people."
      />
      <section className="section-wrap page-records">
        <BlogBrowser items={posts} />
      </section>
    </main>
  );
}
