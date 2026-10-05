import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { getPublicRecords } from "@/lib/public-content";
import { PublicMotion } from "@/components/public-motion";
import "@/styles/public-width.css";

// Render CMS-backed pages at request time while public API reads stay cached.
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const menu = await getPublicRecords("menus");
  return (
    <div className="public-site">
      <PublicHeader menu={menu} />
      <PublicMotion />
      {children}
      <PublicFooter />
    </div>
  );
}
