import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { getPublicRecord, plainText } from "@/lib/public-content";
import { RichBody } from "@/components/rich-body";

export async function LegalDocument({
  slug,
  title,
  index,
}: {
  slug: string;
  title: string;
  index: string;
}) {
  const page = await getPublicRecord("pages", slug);
  return (
    <main id="main" className="public-page legal-page">
      <section className="legal-heading">
        <p className="eyebrow">{index} / LOGICSPHERE INC</p>
        <h1>{page?.title || title}</h1>
        <p>
          {page?.summary ||
            "This document is awaiting publication by LogicSphere Inc."}
        </p>
        {page?.published_at && (
          <span>
            LAST UPDATED /{" "}
            {new Date(page.published_at).toLocaleDateString("en", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
      </section>
      {page && plainText(page.body) ? (
        <article className="legal-body">
          <RichBody value={page.body} />
        </article>
      ) : (
        <section className="legal-placeholder">
          <FileText size={24} />
          <div>
            <p className="eyebrow">DOCUMENT NOT YET PUBLISHED</p>
            <h2>{title} content will appear here.</h2>
            <p>
              LogicSphere Inc has not published this document yet. Check back
              later for the current policy.
            </p>
            <Link href="/contact" className="text-link">
              Contact LogicSphere <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
