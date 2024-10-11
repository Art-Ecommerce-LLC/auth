"use client"
 
import { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/spinner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// zod validation for daterange


const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    startDayHours: z.string().min(1, 'Start Day Hours is required'),
    startDayMinutes: z.string().min(1, 'Start Day Minutes is required'),
    startDayAbbreviation: z.string().min(1, 'Start Day Abbreviation is required'),
    endDayHours: z.string().min(1, 'End Day Hours is required'),
    endDayMinutes: z.string().min(1, 'End Day Minutes is required'),
    endDayAbbreviation: z.string().min(1, 'End Day Abbreviation is required'),
    appointmentLength: z.string().min(1, 'Appointment Length is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    dateRange: z.object({
      from: z.date(),
      to: z.date(),
    })
})

export const hydrate = false


export default function CreateAppointmentSchedule() {
    // 1. Define your form.
    const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 30),
    })
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const [appointmentLength, setAppointmentLength] = useState("30")
    const [defaultSelect, setDefaultSelect] = useState("00");

    function handleAppointmentLength(value: string) {
      setAppointmentLength(value)
      console.log(value)
    } 

    const [trackTimeStart, setTrackTimeStart] = useState("00")
    const [trackTimeEnd, setTrackTimeEnd] = useState("00")

    function handleTimeStart(value: string) {
      setTrackTimeStart(value)
      console.log(value)
    }


    function handleTimeEnd(value: string) {
      setTrackTimeEnd(value)
      console.log(value)
    }

    // Dynamically update defaultSelect value based on conditions
    useEffect(() => {
      if (appointmentLength === "60" && trackTimeStart === "30") {
        setDefaultSelect("30"); // Set default to "30"
      } else {
        setDefaultSelect("00"); // Set default to "00"
      }
    }, [appointmentLength, trackTimeStart]);


    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "",
        description: "",
        startDayHours: "9",
        startDayMinutes: "00",
        startDayAbbreviation: "AM",
        endDayHours: "5",
        endDayMinutes: "00",
        endDayAbbreviation: "PM",
        dateRange: date,
        timezone: "America/Los_Angeles",
        appointmentLength: "30",
      },
    })

    async function GoogleSignIn() {
      // Redirect to your backend API route that initiates the Google OAuth flow
      router.push('/api/auth/google');
    }
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      console.log(values)
      try{  
        setLoading(true)
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
      <h1 className="text-2xl font-bold">Create Appointment Schedule</h1>
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
            <FormField
              control={form.control}
              name="appointmentLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Length</FormLabel>
                  <FormControl>
                  <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleAppointmentLength(value)
                  }} 
                  defaultValue={field.value}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="30 Minutes" defaultValue={"30"}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Appointment Duration</SelectLabel>
                        <SelectItem 
                        value={"30"}
                        defaultChecked>
                          30 Minutes
                        </SelectItem>
                        <SelectItem 
                        value={"60"}
                        onClick={() => setAppointmentLength("60")}>
                          1 Hour
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Daily Time Start</FormLabel>
            </div>
          <div className="flex space-x-2 flex-row !mt-0">
            <FormField
              control={form.control}
              name="startDayHours"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                  <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                    <SelectTrigger className="w-[4rem]">
                      <SelectValue placeholder="9" defaultValue={"9"}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Hour</SelectLabel>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
                <span className="flex items-center">:</span>
                <FormField
                  control={form.control}
                  name="startDayMinutes"
                  render={({ field }) => (
                    <FormItem>
                  <FormControl>
                  <Select 
                  onValueChange={(value) => {
                      field.onChange(value);
                      handleTimeStart(value)
                    }} 
                  defaultValue={field.value}>
                    <SelectTrigger className="w-[4rem]">
                      <SelectValue placeholder={"00"} defaultValue={"00"}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Minutes</SelectLabel>
                          <SelectItem value="00">00</SelectItem>
                          <SelectItem value="30" onChange={() => setTrackTimeStart("30")}>30</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
                <FormField
                  control={form.control}
                  name="startDayAbbreviation"
                  render={({ field }) => (
                    <FormItem>
                  <FormControl>
                  <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value} >
                  <SelectTrigger className="w-[4rem]">
                    <SelectValue defaultValue={"AM"} placeholder={"AM"}/>
                  </SelectTrigger>
                  <SelectContent >
                    <SelectGroup>
                      <SelectLabel>Hours</SelectLabel>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <div>
              <FormLabel>Daily Time End</FormLabel>
            </div>
            <div className="flex space-x-2 flex-row !mt-0">
            <FormField
              control={form.control}
              name="endDayHours"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                  <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                    <SelectTrigger className="w-[4rem]">
                      <SelectValue placeholder="12" defaultValue={"12"}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Hour</SelectLabel>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>         
                  <span className="flex items-center">:</span>
                  <FormField
                    control={form.control}
                    name="endDayMinutes"
                    render={({ field }) => (
                      <FormItem>
                  <FormControl>
                    <Select onValueChange={(value) => {field.onChange(value);handleTimeEnd(value)}} value={appointmentLength === "60" ? trackTimeStart : trackTimeEnd}>
                  <SelectTrigger className="w-[4rem]">
                    <SelectValue placeholder={"00"} defaultValue={"00"}/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Minutes</SelectLabel>
                      {appointmentLength === "60" ? (
                          trackTimeStart === "30" ? (
                            <>
                              <SelectItem value="00" disabled>00</SelectItem>
                              <SelectItem value="30" onChange={() => setTrackTimeEnd("30")}>30</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="00">00</SelectItem>
                              <SelectItem value="30" onChange={() => setTrackTimeEnd("30")} disabled>30</SelectItem>
                            </>
                          )
                        ) : (
                          <>
                            <SelectItem value="00">00</SelectItem>
                            <SelectItem value="30" onChange={() => setTrackTimeEnd("30")}>30</SelectItem>
                          </>
                        )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField

                control={form.control}
                name="endDayAbbreviation"
                render={({ field }) => (
                  <FormItem>
                  <FormControl>
                  <Select 
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                   >
                    <SelectTrigger className="w-[4rem]">
                      <SelectValue defaultValue={"PM"} placeholder={"PM"}/>
                    </SelectTrigger>
                    <SelectContent >
                      <SelectGroup>
                        <SelectLabel>Hours</SelectLabel>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                  <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger className="w-[14rem]">
                    <SelectValue placeholder="PT - America/Los Angeles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Timezones</SelectLabel>
                      <SelectItem value="America/New_York">ET - America/New York</SelectItem>
                      <SelectItem value="America/Chicago">CT - America/Chicago</SelectItem>
                      <SelectItem value="America/Denver">MT - America/Denver</SelectItem>
                      <SelectItem value="America/Los_Angeles">PT - America/Los Angeles</SelectItem>
                      <SelectItem value="America/Anchorage">AKT - America/Anchorage</SelectItem>
                      <SelectItem value="Pacific/Honolulu">HAT - Pacific/Honolulu</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Range</FormLabel>
                  <FormControl>
                  <DatePickerWithRange
                    selectedDateRange={field.value}
                    onDateChange={field.onChange} // Sync form state with date picker
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />            
           
          {/* // Add a time Range field*/}

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