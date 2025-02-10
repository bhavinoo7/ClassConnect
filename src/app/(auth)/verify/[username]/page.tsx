"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { verifySchema } from "@/schemas/verifySchema";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ApiResponse } from "@/types/ApiResponse";

export default function Page() {
  const { toast } = useToast();
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: z.infer<typeof verifySchema>) {
    try {
      if (!params) {
        toast({
          title: "Error",
          description: "Invalid parameters.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });
      console.log(response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        router.replace("/sign-in");
      } else {
        toast({
          title: "Failed",
          description: response.data.message,
          variant: "destructive",
        });
        if (response.data.message === "Code is expire please sign-up again") {
          router.replace("/sign-up");
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-slate-300">
      <div className="w-full max-w-md rounded-sm shadow px-5 py-5 items-center bg-white">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    Please enter the Verification code sent to your email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
