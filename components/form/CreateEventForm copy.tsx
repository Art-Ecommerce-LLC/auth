"use client"
 
import { useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, set } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "../hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimePicker12Demo } from "@/components/ui/time-picker-12hour-demo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
    
const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    dateTime: z.date(),
    timezone: z.string().min(1, 'Timezone is required'),
})


export default function CreateEventForm() {
    // 1. Define your form.
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "",
        description: "",
        dateTime: new Date(new Date().setHours(0, 0, 0, 0)),
        timezone: "",
      },
    })

    async function GoogleSignIn() {
      // Redirect to your backend API route that initiates the Google OAuth flow
      window.location.href = '/api/auth/google';
    }
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      setLoading(true); // Show loading spinner
      try{
        console.log(values)
        // Send POST request to API
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })
        if (!response.ok) {
          throw new Error("Something went wrong")
        } 
        
        toast({
          variant: "success",
          description: "Event created successfully",
          duration: 5000,
        })
        setLoading(false)
        form.reset()
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Something Went Wrong",
          duration: 5000,
        })
        setLoading(false)
      } 
      
    }

    return (
      <div className="relative">
      {/* Dimming Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
          <Spinner size="lg" color="success"/>
        </div>
      )}
      <h1 className="text-2xl font-bold">Create Event</h1>
        {/* Connect google */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-black" onClick={GoogleSignIn}>
            Connect Google Calendar
          </Button>
        </div>
        <Form {...form}>
          <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-3"
          style={{ pointerEvents: loading ? "none" : "auto" }}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                    placeholder="Enter title..." 
                    disabled={loading}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                    placeholder="Enter description..." 
                    disabled={loading}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Form Field for event date */}
            <FormField
          control={form.control}
          name="dateTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">DateTime</FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP HH:mm:ss")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <TimePicker12Demo
                      setDate={field.onChange}
                      date={field.value}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>North America</SelectLabel>
                  <SelectItem value="et">Eastern Time (ET)</SelectItem>
                  <SelectItem value="ct">Central Time (CT)</SelectItem>
                  <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                  <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                  <SelectItem value="akt">Alaska Time (AKT)</SelectItem>
                  <SelectItem value="ht">Hawaii Time (HT)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            </FormItem>
          )}
        />

            
            <Button 
              type="submit" 
              variant="outline" 
              className="text-black w-full mt-2"
              disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
              
          </form>
        </Form>
      </div>
      )
  }