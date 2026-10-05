import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublicRecords } from "@/lib/public-content";
import { EmptyEditorial, PageIntro, RecordCard } from "@/components/public-ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Business software solutions",
  "ERP, CRM, POS, HRMS, inventory and custom enterprise software designed around your operation.",
  "/solutions",
);
export default async function SolutionsPage() {
  await requirePublicSection("/solutions");
  const items = await getPublicRecords("solutions");
  return (
    <main id="main" className="public-page">
      <PageIntro
        index="02"
        eyebrow="BUSINESS SOFTWARE / SYSTEMS"
        title={
          <>
            Your business is
            <br />
            unique. Your software
            <br />
            <em>should be too.</em>
          </>
        }
        description="Connected business software built to bring the right information and workflows together."
      />
      <section className="solution-selector section-wrap">
        <div className="selector-aside">
          <p className="eyebrow">A MORE CONNECTED OPERATION</p>
          <p>
            Choose an area to explore how purpose-built software can support
            your teams and processes.
          </p>
          <div className="selector-graphic" aria-hidden="true">
            <span>ERP</span>
            <i />
            <i />
            <i />
          </div>
        </div>
        {items.length ? (
          <div className="record-grid solution-grid">
            {items.map((item, i) => (
              <RecordCard
                key={item.id}
                item={item}
                href={`/solutions/${item.slug}`}
                index={i}
                kind="solution"
              />
            ))}
          </div>
        ) : (
          <div className="solution-fallback">
            {[
              [
                "01",
                "ERP",
                "Connect planning, purchasing, inventory, finance and reporting.",
              ],
              [
                "02",
                "CRM",
                "Bring customer relationships and sales workflows into focus.",
              ],
              [
                "03",
                "POS",
                "Support point-of-sale and retail operations with connected systems.",
              ],
              [
                "04",
                "HRMS & operations",
                "Coordinate people, inventory, manufacturing and daily workflows.",
              ],
              [
                "05",
                "Custom enterprise software",
                "Build around requirements unique to your organization.",
              ],
            ].map(([no, title, text]) => (
              <Link href="/contact" className="solution-row" key={no}>
                <span>{no}</span>
                <h2>{title}</h2>
                <p>{text}</p>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="software-note">
        <p className="eyebrow">A NOTE ON PRODUCTS</p>
        <p>
          We design and develop software for each client’s needs. Specific
          product availability and ownership should be confirmed directly with
          LogicSphere Inc.
        </p>
      </section>
      <section className="page-bottom-cta">
        <p className="eyebrow">ONE SYSTEM CAN CHANGE THE WAY YOU WORK</p>
        <h2>
          Let’s build around
          <br />
          <em>your real workflows.</em>
        </h2>
        <Link href="/contact" className="button">
          Explore a solution <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
