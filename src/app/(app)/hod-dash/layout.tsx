import Navbar from "@/components/Navbar";
import { SidebarDemo, Dashboard } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import HodHeader from "@/components/HodHeader";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster />
      <HodHeader children={children} />
    </>
  );
}
