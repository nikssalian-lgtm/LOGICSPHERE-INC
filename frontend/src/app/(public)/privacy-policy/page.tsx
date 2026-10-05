import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getPublicRecord } from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublicRecord("pages", "privacy-policy");
  return pageMetadata(
    page?.title ?? "Privacy Policy",
    page?.summary ?? "LogicSphere Inc privacy policy.",
    "/privacy-policy",
  );
}
export default function PrivacyPolicyPage() {
  return (
    <LegalDocument slug="privacy-policy" title="Privacy Policy" index="09" />
  );
}
