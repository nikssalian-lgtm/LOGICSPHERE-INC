import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicRecord } from "@/lib/public-content";

function serviceFor(services: PublicRecord[], terms: string[]) {
  return services.find((item) =>
    terms.some((term) =>
      `${String(item.attributes.service_type ?? "")} ${item.title}`
        .toLowerCase()
        .includes(term),
    ),
  );
}

export function ChannelShowcase({ services }: { services: PublicRecord[] }) {
  const web = serviceFor(services, [
    "website",
    "web development",
    "e-commerce",
    "ecommerce",
  ]);
  const mobile = serviceFor(services, ["mobile"]);
  return (
    <section
      className="channel-showcase section-wrap"
      aria-labelledby="channel-showcase-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            DIGITAL EXPERIENCES / WEB, COMMERCE & MOBILE
          </p>
          <h2 id="channel-showcase-title">
            Built for how
            <br />
            people <em>connect.</em>
          </h2>
        </div>
        <p className="channel-lead">
          Websites, commerce and mobile applications—with the interfaces,
          integrations and management tools each project calls for.
        </p>
      </div>
      <div className="channel-grid">
        <article className="channel-panel channel-web">
          <div className="channel-copy">
            <p className="eyebrow">01 / WEB & COMMERCE</p>
            <h3>{web?.title ?? "Websites & e-commerce"}</h3>
            <p>
              {web?.summary ??
                "Website and e-commerce capabilities are configured to each project’s requirements."}
            </p>
            <Link
              className="text-link"
              href={web ? `/services/${web.slug}` : "/services"}
            >
              Explore capability <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="commerce-window" aria-hidden="true">
            <div className="commerce-bar">
              <span />
              <span />
              <span />
              <small>STOREFRONT / CONCEPT</small>
            </div>
            <div className="commerce-hero">
              <small>AN EXAMPLE DIGITAL STORE</small>
              <b>
                Discover
                <br />
                what’s possible.
              </b>
              <i />
            </div>
            <div className="commerce-items">
              <span>COLLECTION 01</span>
              <span>COLLECTION 02</span>
              <span>COLLECTION 03</span>
            </div>
          </div>
        </article>
        <article className="channel-panel channel-mobile">
          <div className="channel-copy">
            <p className="eyebrow">02 / MOBILE APPLICATIONS</p>
            <h3>{mobile?.title ?? "Mobile applications"}</h3>
            <p>
              {mobile?.summary ??
                "Mobile experiences, API connections and supporting tools are scoped to each project."}
            </p>
            <Link
              className="text-link"
              href={mobile ? `/services/${mobile.slug}` : "/services"}
            >
              Explore capability <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="phone-concept" aria-hidden="true">
            <div className="phone-frame">
              <div className="phone-camera" />
              <div className="phone-top">
                <span>09:41</span>
                <span>•••</span>
              </div>
              <div className="phone-greeting">
                <small>APP INTERFACE / CONCEPT</small>
                <b>Good day.</b>
                <span>Your workspace, at a glance.</span>
              </div>
              <div className="phone-card">
                <i />
                <span>WORKSPACE</span>
                <b>Overview</b>
                <small>Illustrative screen</small>
              </div>
              <div className="phone-shortcuts">
                <i />
                <i />
                <i />
              </div>
              <div className="phone-nav">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
          <span className="channel-note">
            ILLUSTRATIVE INTERFACE — NOT A RELEASED PRODUCT
          </span>
        </article>
      </div>
    </section>
  );
}
