import { SidebarDemo } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster />
      <SidebarDemo>{children}</SidebarDemo>
    </>
  );
}
