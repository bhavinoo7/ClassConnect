"use client";
import React, { useEffect, useState } from "react";

import { LabelInputContainer } from "../Student_details_form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { getSession } from "next-auth/react";
import axios from "axios";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { Bell, HopIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/hooks";
import { useAppSelector } from "@/hooks/hooks";
import { NotificationActions } from "@/store/slice/notification";
const TeacherNav = () => {
  const { hodid } = useAppSelector((state) => state.user);
  console.log(hodid);
  const dispatch = useAppDispatch();
  const unreadCount=0;

  // useEffect(() => {
  //   if (studentid) {
  //     async function fetchnotification() {
  //       const res = await axios.get(`/api/noti-fetch?student_id=${studentid}`);
  //       console.log(res.data.data.notification);
  //       if (res.data.success) {
  //         dispatch(
  //           NotificationActions.setNotification(res.data.data.notification)
  //         );
  //         dispatch(NotificationActions.setUnread(res.data.data.unread));
  //       }
  //     }
  //     fetchnotification();
  //   }
  // }, [studentid]);
  const router = useRouter();

  return (
    <div className="flex flex-row-reverse items-center space-y-2 md:space-y-0 md:space-x-2 m-2 gap-3">
    
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.replace("/hod-dash/notification")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
        
      </div>
   
  );
};

export default TeacherNav;
