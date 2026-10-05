import type { Metadata } from "next";
import { ArrowDownRight, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getPublicSettings } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Tell LogicSphere Inc about your software, website, e-commerce or mobile application project.",
  "/contact",
);
export default async function ContactPage() {
  const contact = await getPublicSettings("contact");
  return (
    <main id="main" className="public-page contact-page">
      <section className="contact-intro">
        <p className="eyebrow">
          <span>05</span>CONTACT / START A PROJECT
        </p>
        <h1>
          Every good thing
          <br />
          starts with a <em>conversation.</em>
        </h1>
        <p>
          Tell us where you want to go. We’ll help you work out what it takes to
          get there.
        </p>
        <div className="contact-mark" aria-hidden="true">
          <span>LS</span>
          <i />
          <i />
          <i />
        </div>
        <a href="#contact-form" className="scroll-cue">
          <ArrowDownRight size={15} />
          <span>SHARE YOUR BRIEF</span>
        </a>
      </section>
      <section className="contact-content" id="contact-form">
        <ContactForm />
        <aside className="contact-aside">
          <p className="eyebrow">DIRECT CONTACT</p>
          {contact.email && (
            <a href={`mailto:${contact.email}`}>
              <Mail size={16} />
              <span>
                EMAIL<small>{contact.email}</small>
              </span>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>
              <Phone size={16} />
              <span>
                PHONE<small>{contact.phone}</small>
              </span>
            </a>
          )}
          {contact.address && (
            <div className="address-block">
              <span>LOCATION</span>
              <p>{contact.address}</p>
            </div>
          )}
          <div className="response-note">
            <span className="live-dot" />
            PRIVATE PROJECT ENQUIRIES
            <br />
            <small>
              Details shared through this form are stored securely for
              follow-up.
            </small>
          </div>
        </aside>
      </section>
    </main>
  );
}
