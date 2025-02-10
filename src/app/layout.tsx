"use client"
import './globals.css';
import AuthProvider from '../context/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

import {  Provider  } from 'react-redux';
import SetRedux from '@/components/setRedux';
import {store,persistor } from '../store/store';
import { PersistGate } from "redux-persist/integration/react";


interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >
      
      
        <body>
        {/* <Provider store={store}> */}
        <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
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
