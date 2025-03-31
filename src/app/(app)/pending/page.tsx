"use client";

import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Your request is pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p>
              We're currently processing your request. This may take a few
              moments.
            </p>
            <p className="mt-2 font-bold">Please Wait For Request Accept</p>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <h4 className="font-medium mb-2">What's happening?</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Verifying your information</li>
              <li>Processing your submission</li>
              <li>Preparing your confirmation</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              router.replace("/sign-in");
            }}
          >
            Back
          </Button>
          <Button variant="outline" className="w-full" disabled>
            Please wait...
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
