import React from "react";
import { getSession } from "next-auth/react";
const fetchsession = async () => {
  const session = await getSession();
  if (session) {
    return session.user;
  }
};

export default fetchsession;
