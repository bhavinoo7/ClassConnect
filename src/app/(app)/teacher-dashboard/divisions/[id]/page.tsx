"use client";
import { useParams } from "next/navigation";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
const page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const userid = event.currentTarget.userid.value;

    const password = event.currentTarget.password.value;

    const response = await axios.post("/api/division-login", {
      identifier: userid,
      password,
      division_id: params.id,
    });

    if (!response.data.success) {
      toast({
        title: "Access Failed",
        description: response.data.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Access Granted",
        description: response.data.message,
        variant: "default",
      });
      router.replace("/division-dashboard");
    }
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your division
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userid">User ID</Label>
              <Input id="userid" placeholder="Enter your user ID" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button variant="link" className="text-sm" type="button">
              Forgot your password?
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default page;
