import type { Metadata } from "next";
import { getPublicRecords } from "@/lib/public-content";
import { EmptyEditorial, PageIntro, RecordCard } from "@/components/public-ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Industries",
  "Industry context for software, digital product and transformation work by LogicSphere Inc.",
  "/industries",
);
export default async function IndustriesPage() {
  const industries = await getPublicRecords("industries", "per_page=50");
  return (
    <main id="main" className="public-page">
      <PageIntro
        index="07"
        eyebrow="INDUSTRIES / CONTEXT MATTERS"
        title={
          <>
            Technology works
            <br />
            when it fits the <em>context.</em>
          </>
        }
        description="Different teams, constraints and workflows call for different systems. Explore the contexts LogicSphere works across."
      />
      <section className="section-wrap page-records">
        <div className="section-label">
          <span>INDUSTRY PERSPECTIVES</span>
          <span>TECHNOLOGY / IN CONTEXT</span>
        </div>
        {industries.length ? (
          <div className="record-grid">
            {industries.map((item, i) => (
              <RecordCard
                key={item.id}
                item={item}
                href={`/industries/${item.slug}`}
                index={i}
                kind="industry"
              />
            ))}
          </div>
        ) : (
          <EmptyEditorial
            title="Industry profiles are being prepared."
            description="Published industry profiles will appear here as LogicSphere adds them to the CMS."
          />
        )}
      </section>
    </main>
  );
}
