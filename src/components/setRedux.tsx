import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { userActions } from "@/store/slice/user";
import { useAppDispatch } from "@/hooks/hooks";
import Student from "@/model/Student";

const setRedux = () => {
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
      }
      if (session.user.usertype === "STUDENT") {
        dispatch(
          userActions.login({
            id: session.user._id,
            name: session.user.userName,
            email: session.user.email,
            userType: session.user.usertype,
            Studentid: session.user.studentid,
          })
        );
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
      }
    } else {
      dispatch(userActions.logout());
    }
  }, [session, status, dispatch]);

  return null;
};

export default setRedux;
