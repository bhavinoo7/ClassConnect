"use client"
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../context/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

import { Provider, Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "../store/store";
import SetRedux from '@/components/setRedux';
import {store} from '../store/store';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >
      
      
        <body className={inter.className}>
        {/* <Provider store={store}> */}
        <Provider store={store}>
        <PersistGate persistor={persistor}>
        <AuthProvider>
        <SetRedux/>
          {children}
          <Toaster />
          {/* </Provider> */}
          </AuthProvider>
          </PersistGate>
          </Provider>
        </body>
    </html>
  );
}
