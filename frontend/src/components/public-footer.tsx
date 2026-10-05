import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { getPublicRecords, getPublicSettings } from "@/lib/public-content";
import { isSafeNavigationHref } from "@/lib/urls";
import { getPublicSections, isSectionVisible } from "@/lib/public-sections";

export async function PublicFooter() {
  const sections = await getPublicSections();
  const [contact, social, site, menus] = await Promise.all([
    getPublicSettings("contact"),
    getPublicSettings("social"),
    getPublicSettings("site"),
    getPublicRecords("menus"),
  ]);
  const email = contact.email;
  const phone = contact.phone;
  const socials = Object.entries(social).filter(([, url]) =>
    /^https:\/\//.test(url),
  );
  const footerMenu = (group: string) =>
    menus
      .filter((item) => item.attributes.menu === group)
      .map((item) => ({
        label: String(item.attributes.label ?? item.title),
        href: String(item.attributes.url ?? "/"),
      }))
      .filter(
        (item) =>
          isSafeNavigationHref(item.href) &&
          isSectionVisible(item.href, sections),
      );
  const serviceLinks = footerMenu("footer-services");
  const companyLinks = footerMenu("footer-company");
  const resourceLinks = footerMenu("footer-resources");
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Brand />
          <p>
            {site.footer_description ||
              "Digital products and software, thoughtfully engineered for modern business."}
          </p>
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>}
        </div>
        <div className="footer-column">
          <h3>Services</h3>
          {serviceLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-column">
          <h3>Company</h3>
          {companyLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-column">
          <h3>Resources</h3>
          {resourceLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        {socials.length > 0 && (
          <div className="footer-column">
            <h3>Elsewhere</h3>
            {socials.map(([network, url]) => (
              <a key={network} href={url} target="_blank" rel="noreferrer">
                {network}
                <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} LogicSphere Inc.</span>
        <span>Designed for what’s next.</span>
      </div>
      <div className="footer-legal-links">
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
      </div>
    </footer>
  );
}
