import Navbar from "@/components/Navbar";
import { SidebarDemo, Dashboard } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster />
      <SidebarDemo children={children} />
    </>
  );
}
