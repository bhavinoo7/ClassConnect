import { AuthOptions, NextAuthOptions } from "next-auth";
import dbConnection from "@/lib/dbConnection";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { session } from "@/model/Teacher";



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credential",
      name: "Credential",
      credentials: {
        identifier: { label: "Email or password", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {

        await dbConnection();
        try {
          const user = await UserModel.findOne({
            $or: [
              {
                email: credentials.identifier,
              },
              {
                userName: credentials.identifier,
              },
            ],
          });
          if (!user) {
            throw new Error("User not Found");
          }
          if (!user.isverfied) {
            throw new Error("Please verify first before login");
          }
          const checkPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (checkPassword) {
            return user;
          } else {
            throw new Error("Incorrect password please enter correct password");
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isverfied = user.isverfied;
        token.userName = user.userName;
        token.usertype = user.usertype;
        token.image = user.image;
        token.formfilled = user.formfilled;
        token.email = user.email;
        token.studentid = user.studentid;
        token.teacherid=user.teacherid;
        token.hodid = user.hodid;
      }
   return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user._id = token._id),
          (session.user.isverfied = token.isverfied),
          (session.user.email = token.email),
          (session.user.formfilled = token.formfilled),
          (session.user.image = token.image),
          (session.user.userName = token.userName),
          (session.user.usertype = token.usertype);
          (session.user.studentid = token.studentid);
          (session.user.teacherid = token.teacherid);
          (session.user.hodid = token.hodid); 
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
