import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getPublicRecord } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublicRecord("pages", "terms-and-conditions");
  return pageMetadata(
    page?.title ?? "Terms & Conditions",
    page?.summary ?? "LogicSphere Inc terms and conditions.",
    "/terms-and-conditions",
  );
}
export default function TermsPage() {
  return (
    <LegalDocument
      slug="terms-and-conditions"
      title="Terms & Conditions"
      index="10"
    />
  );
}
