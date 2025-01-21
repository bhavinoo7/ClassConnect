"use client";

import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
const queryParameters = new URLSearchParams(window.location.search);
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/schemas/signInSchema";
import { signUpSchema } from "@/schemas/SignUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { userActions } from "@/store/slice/user";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const page = () => {
  const [id, setid] = useState("");
  const [name, setname] = useState("");
  const [session_id1, setsession_id] = useState("");
  const [email, setemail] = useState(""); 
  const [s,sets]=useState("");
  const [e,sete]=useState("");
  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      if (session) {
        setid(session.user._id as string);
        setname(session.user.name as string);
        sets(session.user.session_id as string);
        sete(session.user.qemail as string);
        console.log(session);
        console.log(session.user.session_id,"session_id");
      }
    }
    console.log(queryParameters.get("session_id"));
    if (queryParameters.get("session_id")!==null && queryParameters.get("email")!==null){ 
      console.log("inside");
      setsession_id(queryParameters.get("session_id") as string);
      setemail(queryParameters.get("email") as string);
    }
    fetchData();
  }, []);
  console.log(session_id1); 
  console.log(email);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
      session_id:"",
      qemail:"",
    },
  });
  const onsubmit = async (data: z.infer<typeof signInSchema>) => {
    console.log(data);
    console.log(session_id1);
    const result = await signIn("credential", {
      identifier: data.identifier,
      password: data.password,
      session_id:session_id1,
      qemail:email,
      redirect: false,
    });
    console.log(result);
    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast({
          title: "Login Failed",
          description: "Incorrect username or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    }
    if (result?.url) {
      localStorage?.setItem("status", "login");
      console.log(s);
      dispatch(
        userActions.login({ id: id, name: name, session_id: s,email:e })
      );
      router.replace("/");
    }
  };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="px-5 py-5 rounded-md shadow bg-white max-w-md w-full space-y-3">
        <div>
          <p className="text-xl font-bold text-center">Sign In</p>
        </div>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onsubmit)}>
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              submit
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            For New User?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up{" "}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
