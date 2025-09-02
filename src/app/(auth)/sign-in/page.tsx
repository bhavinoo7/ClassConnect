"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { signInSchema } from "@/schemas/signInSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/hooks";

const Page = () => {
  const { toast } = useToast();
  const { userType } = useAppSelector((state) => state.user);
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
      session_id: "",
      qemail: "",
    },
  });
  const onsubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credential", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

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
      // router.replace("/");
      
    }
    if (!result?.error) {
      localStorage?.setItem("status", "login");
      // get user session
      const session = await fetch("/api/auth/session").then((r) => r.json());

      if (session?.user?.usertype === "STUDENT") {
        router.replace("/student-dashboard");
      } else if (session?.user?.usertype === "TEACHER") {
        router.replace("/teacher-dashboard");
      } else if (session?.user?.usertype === "HOD") {
        router.replace("/hod-dash");
      } else {
        router.replace("/");
      }
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

export default Page;
