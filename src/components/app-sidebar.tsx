"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { getSession } from "next-auth/react";
import { useDispatch } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { userActions } from "@/store/slice/user";

export function SidebarDemo({ children }: any) {
  const [currentUrl, setCurrentUrl] = useState("");
  const dispatch=useDispatch();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href); // Get the current URL safely
    }
  }, []);
  const links = [
    {
      label: "Dashboard",
      href: `/${currentUrl.split("/")[3]}`,
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: `/${currentUrl.split("/")[3]}/profile`,
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: `logout`,
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-200 dark:bg-neutral-800 w-full flex-1  border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-[100vh] w-[100vw]" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-5 flex flex-col gap-2">
              {links.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (link.label === "Logout") {
                      localStorage.removeItem("status");
                      dispatch(userActions.logout());
                      signOut();
                    } else {
                      if (link.href) {
                        window.location.href = link.href;
                      }
                    }
                  }}
                  className="flex items-center space-x-3 p-2 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-700 active:bg-blue-300 hover:text-black"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div></div>
        </SidebarBody>
      </Sidebar>
      <Dashboard children={children} />
    </div>
  );
}

// Dummy dashboard component with content
export const Dashboard = ({ children }: any) => {
  return <main className="w-full h-full overflow-y-auto">{children}</main>;
};
