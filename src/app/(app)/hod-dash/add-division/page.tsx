"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ApiResponse } from "@/types/ApiResponse";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/hooks/hooks";

// ✅ Define Zod schema for validation
const FormSchema = z.object({
  divisionName: z.string().min(2, { message: "Division name must be at least 2 characters." }),
  divisionCode: z.string().min(2, { message: "Division code must be at least 2 characters." }),
  mentors: z.array(z.string()).min(1).max(3),
});

// ✅ Define TypeScript types
interface Mentor {
  label: string;
  value: string;
}

interface SessionUser {
  hodid: string;
}

export default function Page() { // 🔹 Renamed from "page" to "Page"
  const { toast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [session, setSession] = useState<SessionUser | null>(null);
  const {hodid}=useAppSelector(state=>state.user);
  

  // ✅ Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSession();
        if (sessionData?.user) {
          setSession(sessionData.user as SessionUser);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchSession();
  }, []);

  // ✅ Fetch mentors list
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("/api/fetch-teacher?hodid="+hodid);
        const data = response.data.data.map((teacher: { name: string; _id: string }) => ({
          label: teacher.name,
          value: teacher._id,
        }));
        setMentors(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Form handling with React Hook Form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      divisionName: "",
      divisionCode: "",
      mentors: [],
    },
  });

  // ✅ Handle form submission
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setSubmitting(true);
    const dataWithHodid = { ...data, hodid: session?.hodid };

    try {
      const response = await axios.post<ApiResponse>("/api/add-division", dataWithHodid);
      if (response.data.success) {
        toast({ title: "Success", description: response.data.message });
        router.replace("/hod-dash");
      } else {
        toast({ title: "Add Division Failed", description: response.data.message, variant: "destructive" });
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message || "There was a problem with your request.";
      toast({ title: "Add Division Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Division Name */}
        <FormField
          control={form.control}
          name="divisionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter division name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Division Code */}
        <FormField
          control={form.control}
          name="divisionCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter division code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mentor Selection */}
        <FormField
          control={form.control}
          name="mentors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentors</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                      {field.value?.length > 0 ? `Selected ${field.value.length} mentor(s)` : "Select mentors"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search mentors..." />
                      <CommandList>
                        <CommandEmpty>No mentor found.</CommandEmpty>
                        <CommandGroup>
                          {mentors.map((mentor: Mentor) => (
                            <CommandItem
                              key={mentor.value}
                              value={mentor.label}
                              onSelect={() => {
                                const currentValue = new Set(field.value);
                                if (mentor.value && currentValue.has(mentor.value.toString())) {
                                  currentValue.delete(mentor.value.toString());
                                } else {
                                  if (mentor.value) {
                                    currentValue.add(mentor.value.toString());
                                  }
                                }
                                field.onChange(Array.from(currentValue));
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", mentor.value && field.value?.includes(mentor.value.toString()) ? "opacity-100" : "opacity-0")} />
                              {mentor.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}
