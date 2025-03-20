import { SidebarDemo } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import StudentNav from "@/components/ui/StudentNav";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster />
      <StudentNav/>
      <SidebarDemo>{children}</SidebarDemo>
    </>
  );
}
