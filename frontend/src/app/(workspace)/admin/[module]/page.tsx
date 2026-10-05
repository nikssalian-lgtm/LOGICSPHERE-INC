import { notFound } from "next/navigation";
import { ContentManager } from "../../../../components/content-manager";

const modules = [
  "services",
  "solutions",
  "portfolio",
  "clients",
  "testimonials",
  "team",
  "technologies",
  "industries",
  "blog",
  "pages",
  "menus",
];
export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!modules.includes(module)) notFound();
  return <ContentManager module={module} />;
}
