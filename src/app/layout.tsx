"use client";
import "./globals.css";
import AuthProvider from "../context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { Provider } from "react-redux";
import SetRedux from "@/components/setRedux";
import { store, persistor } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Head from "next/head";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en">
       <Head>
        <title>Classmate</title>
        <meta name="description" content="Real feedback from real people." />
        
      </Head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AuthProvider>
                <SetRedux />
                {children}
                <Toaster />
           
              </AuthProvider>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
