import { Toaster } from "@/components/ui/toaster";
import HodHeader from "@/components/HodHeader";
import TeacherNav from "@/components/ui/TeacherNav";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster />
      <TeacherNav />
      <HodHeader>
        {children}
      </HodHeader>
    </>
  );
}
