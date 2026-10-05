import { notFound } from "next/navigation";
import { SettingsManager } from "../../../../../components/admin-managers";
export default async function Page({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  if (!["site", "seo", "contact", "social"].includes(group)) notFound();
  return <SettingsManager group={group} />;
}
