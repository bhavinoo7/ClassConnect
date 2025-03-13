import { Toaster } from "@/components/ui/toaster";

import DivisionHeader from "@/components/DivisionHeader";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster />
      <DivisionHeader>
        {children}
      </DivisionHeader>
    </>
  );
}
