import type { Metadata } from "next";
import { requirePublicSection } from "@/lib/public-sections";
import { getPublicRecords } from "@/lib/public-content";
import { PageIntro, RecordCard } from "@/components/public-ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Services",
  "Custom software, ERP, CRM, POS, web, e-commerce and mobile application development.",
  "/services",
);
export default async function ServicesPage() {
  await requirePublicSection("/services");
  const services = await getPublicRecords("services");
  return (
    <main id="main" className="public-page">
      <PageIntro
        index="01"
        eyebrow="SERVICES / ENGINEERING CAPABILITIES"
        title={
          <>
            Complexity, meet
            <br />
            <em>clarity.</em>
          </>
        }
        description="Software development shaped around the details of your business: how it runs, where it is going and what needs to work better."
      />
      <section className="section-wrap page-records">
        <div className="section-label">
          <span>OUR CAPABILITIES</span>
          <span>SOFTWARE / DELIVERY</span>
        </div>
        {services.length ? (
          <div className="record-grid">
            {services.map((item, i) => (
              <RecordCard
                key={item.id}
                item={item}
                href={`/services/${item.slug}`}
                index={i}
                kind="service"
              />
            ))}
          </div>
        ) : (
          <div className="capability-directory">
            {[
              "Custom software",
              "ERP development",
              "CRM development",
              "POS software",
              "Website development",
              "E-commerce development",
              "Mobile applications",
              "Web applications",
              "API & integrations",
              "Dedicated development resources",
            ].map((name, i) => (
              <article key={name}>
                <span>0{i + 1}</span>
                <h2>{name}</h2>
                <p>
                  Thoughtfully engineered around your requirements, workflows
                  and users.
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="page-bottom-cta">
        <p className="eyebrow">NOT SURE WHERE TO BEGIN?</p>
        <h2>
          Start with the challenge.
          <br />
          <em>We’ll shape the solution.</em>
        </h2>
        <a className="button" href="/contact">
          Talk with our team <span>↗</span>
        </a>
      </section>
    </main>
  );
}
