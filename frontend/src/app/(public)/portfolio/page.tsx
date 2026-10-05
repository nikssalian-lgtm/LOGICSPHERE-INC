import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import { getPublicRecords } from "@/lib/public-content";
import { EmptyEditorial, PageIntro } from "@/components/public-ui";
import { PortfolioBrowser } from "@/components/portfolio-browser";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Portfolio",
  "Selected software, web and digital product work by LogicSphere Inc.",
  "/portfolio",
);
export default async function PortfolioPage() {
  await requirePublicSection("/portfolio");
  const items = await getPublicRecords("portfolio", "per_page=50");
  return (
    <main id="main" className="public-page">
      <PageIntro
        index="03"
        eyebrow="PORTFOLIO / SELECTED WORK"
        title={
          <>
            Good work starts
            <br />
            with a <em>real problem.</em>
          </>
        }
        description="Explore the systems, products and digital experiences published by LogicSphere Inc. Each project is presented with the context and details available in the CMS."
      />
      <section className="section-wrap page-records">
        <div className="section-label">
          <span>SELECTED WORK / PROJECT STORIES</span>
        </div>
        {items.length ? (
          <PortfolioBrowser projects={items} />
        ) : (
          <EmptyEditorial
            title="The right work starts with your challenge."
            description="Project stories will appear here as approved work is ready to share. Until then, tell us what you’re looking to build."
            href="/contact"
            action="Start a conversation"
          />
        )}
      </section>
    </main>
  );
}
