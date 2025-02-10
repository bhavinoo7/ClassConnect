import { SidebarDemo } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/ui/Nav";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div className="hidden md:block">
        <Nav />
      </div>
      <Toaster />
      <SidebarDemo>{children}</SidebarDemo>
    </>
  );
}
