import { AuthProvider } from "@/components/auth-provider";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
