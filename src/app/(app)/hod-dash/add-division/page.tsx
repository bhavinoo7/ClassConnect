"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import fetchsession from "@/helpers/fetchsession"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ApiResponse, division } from "@/types/ApiResponse"
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, useEffect, useState } from "react"
import axios, { AxiosError } from "axios"
import { getSession } from "next-auth/react"
import { session } from "@/model/Teacher"
import { set } from "mongoose"
import { useToast } from "@/hooks/use-toast"
const FormSchema = z.object({
  divisionName: z.string().min(1, {
    message: "Division name must be at least 2 characters.",
  }),
  divisionCode: z.string().min(2, {
    message: "Division code must be at least 2 characters.",
  }),
  mentors: z.array(z.string()).min(1, {
    message: "Please select at least one mentor.",
  }).max(3, {
    message: "You can select up to 3 mentors.",
  }),
})

export default function page() {
  const {toast}=useToast();
  const router=useRouter();
  const [submitting,setSubmitting]=useState(false);
  const [mentors,setMentors]=useState<any>([]); 
  const [session,setSession]=useState<any>([]);
  useEffect(() => {
        async function fetchData() {
          const session = await getSession();
          if (session) {
            console.log(session.user);
            console.log(session.user.hodid);
            setSession(session.user);
          }
        }
        fetchData();
      }, []);
  useEffect(()=>{
    const fetchteacher=async()=>{

   const response=await axios.get("/api/fetch-teacher");
   console.log(response.data.data); 
   const res=response.data.data;
   const data=res.map((teacher:any)=>{
    return {label:teacher.name,value:teacher._id}
   })
    console.log(data);
    setMentors(data);
    }
    fetchteacher();
  },[]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      divisionName: "",
      divisionCode: "",
      mentors: [],
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setSubmitting(true);
   const dataWithHodid = {
     ...data,
     hodid: session.hodid,
   };
   console.log(dataWithHodid);
   try{
    const response=await axios.post<ApiResponse>("/api/add-division",dataWithHodid);
    console.log(response.data.message);
    if(response.data.success)
    {
      toast({
        title: 'Success',
        description: response.data.message,
      });
     
      router.replace("/hod-dash");
    }else
    {
      toast({
        title: 'add division Failed',
        description: response.data.message,
        variant: 'destructive',
      });
      
    }

   }catch(err){
    const axiosError = err as AxiosError<ApiResponse>;
    
          // Default error message
          let errorMessage = axiosError.response?.data.message;
          ('There was a problem with your sign-up. Please try again.');
    
          toast({
            title: 'add division Failed',
            description: errorMessage,
            variant: 'destructive',
          });
          
   }finally{
    setSubmitting(false);
   }  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <FormField
          control={form.control}
          name="divisionCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter division Code" {...field} />
              </FormControl>
              <FormDescription>This is the name of your division code.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mentors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentors</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
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
                          {mentors.map((mentor: { label: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> | null | undefined; value: Key | null | undefined }) => (
                            <CommandItem
                              value={String(mentor.label)}
                              key={mentor.value}
                              onSelect={() => {
                                const currentValue = new Set(field.value)
                                if (mentor.value && currentValue.has(mentor.value.toString())) {
                                  currentValue.delete(mentor.value.toString())
                                } else {
                                  if (mentor.value) {
                                    currentValue.add(mentor.value.toString())
                                  }
                                }
                                field.onChange(Array.from(currentValue))
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  mentor.value && field.value?.includes(mentor.value.toString()) ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {mentor.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>Select one or more mentors for this division.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>{submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Submit'
              )}</Button>
      </form>
    </Form>
  )
}

