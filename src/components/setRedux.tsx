
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { userActions } from "@/store/slice/user";

const setRedux = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      dispatch(
        userActions.login({
          id: session.user._id,
          name: session.user.userName || "",
        })
      );
    } else {
      dispatch(userActions.logout());
    }
  }, [session, status, dispatch]);

  return null;
};

export default setRedux;
