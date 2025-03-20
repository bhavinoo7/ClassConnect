"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { userActions } from "@/store/slice/user";
import { useAppDispatch } from "@/hooks/hooks";

import { useRouter } from "next/navigation";
const SetRedux = () => {
  const router=useRouter();
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    
    if (status === "authenticated" && session?.user) {
     
      if (session.user.usertype === "TEACHER") {
        dispatch(
          userActions.login({
            id: session.user._id,
            name: session.user.userName,
            email: session.user.email,
            userType: session.user.usertype,
            teacherid: session.user.teacherid,
          })
        );
        router.replace("/teacher-dashboard");
      }
      if (session.user.usertype === "STUDENT") {
        dispatch(
          userActions.login({
            id: session.user._id,
            name: session.user.userName,
            email: session.user.email,
            userType: session.user.usertype,
            studentid: session.user.studentid,
          })
        );
        router.replace("/student-dashboard");
      }
      if (session.user.usertype === "HOD") {
        dispatch(
          userActions.login({
            id: session.user._id,
            name: session.user.userName,
            email: session.user.email,
            userType: session.user.usertype,
            hodid: session.user.hodid,
          })
        );
        router.replace("/hod-dash");
      }
    } else {
      dispatch(userActions.logout());
    }
  }, [session, status, dispatch]);

  return null;
};

export default SetRedux;
