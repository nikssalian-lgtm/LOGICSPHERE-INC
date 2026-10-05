import type { Metadata } from "next";
import { Code2 } from "lucide-react";
import { getPublicRecords } from "@/lib/public-content";
import { EmptyEditorial, PageIntro } from "@/components/public-ui";
import { TechnologyBrowser } from "@/components/technology-browser";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Technology ecosystem",
  "The technologies published in LogicSphere Inc's development ecosystem.",
  "/technologies",
);
export default async function TechnologiesPage() {
  const technologies = await getPublicRecords("technologies", "per_page=50");
  return (
    <main id="main" className="public-page">
      <PageIntro
        index="08"
        eyebrow="TECHNOLOGY / A PRACTICAL ECOSYSTEM"
        title={
          <>
            The right tools
            <br />
            for the <em>work.</em>
          </>
        }
        description="An evolving toolkit across software, web, mobile, data and integrations. Technologies shown here are managed by LogicSphere in the CMS."
      />
      <section className="technology-page section-wrap">
        <div className="technology-intro">
          <span className="technology-emblem">
            <Code2 size={28} />
          </span>
          <div>
            <p className="eyebrow">SELECTED TECHNOLOGY</p>
            <h2>
              Tools with a <em>purpose.</em>
            </h2>
            <p>
              Technology choices depend on the project: the users, constraints,
              integrations and long-term needs.
            </p>
          </div>
        </div>
        {technologies.length ? (
          <TechnologyBrowser items={technologies} />
        ) : (
          <EmptyEditorial
            title="The ecosystem will grow here."
            description="Technology entries appear once they are published in the admin CMS."
          />
        )}
      </section>
    </main>
  );
}
