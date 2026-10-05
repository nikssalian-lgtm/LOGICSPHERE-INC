import type { Metadata } from "next";
import localFont from "next/font/local";
import { getPublicSettings } from "@/lib/public-content";
import { StructuredData } from "@/components/structured-data";
import { canonicalBase, isPublicIndexingEnabled } from "@/lib/seo";
import "./globals.css";
import "../styles/experience.css";

const geist = localFont({
  src: "./fonts/geist.woff2",
  variable: "--font-geist",
  display: "swap",
  weight: "100 900",
});
const mono = localFont({
  src: "./fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([
    getPublicSettings("seo"),
    getPublicSettings("site"),
  ]);
  const title =
    seo.default_title ||
    "LogicSphere Inc — Digital systems that move business forward";
  const description =
    seo.default_description ||
    "LogicSphere Inc designs and develops custom software, business platforms, websites, e-commerce experiences and mobile applications.";
  const canonical = canonicalBase(seo);
  const allowIndexing = isPublicIndexingEnabled(seo);
  return {
    title: { default: title, template: "%s | LogicSphere Inc" },
    description,
    icons: { icon: "/brand/logicsphere-original.svg" },
    ...(canonical ? { metadataBase: new URL(canonical) } : {}),
    robots: { index: allowIndexing, follow: allowIndexing },
    openGraph: {
      type: "website",
      siteName: site.site_name || "LogicSphere Inc",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [site, contact, social, seo] = await Promise.all([
    getPublicSettings("site"),
    getPublicSettings("contact"),
    getPublicSettings("social"),
    getPublicSettings("seo"),
  ]);
  const base = canonicalBase(seo);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.site_name || "LogicSphere Inc",
    ...(base ? { url: base } : {}),
    ...(contact.email || contact.phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            ...(contact.email ? { email: contact.email } : {}),
            ...(contact.phone ? { telephone: contact.phone } : {}),
            contactType: "business inquiries",
          },
        }
      : {}),
    sameAs: Object.values(social).filter(
      (value): value is string =>
        typeof value === "string" && value.startsWith("https://"),
    ),
  };
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geist.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ls-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light';document.documentElement.dataset.motion=localStorage.getItem('ls-motion')==='paused'?'paused':'running'}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <StructuredData data={organization} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
