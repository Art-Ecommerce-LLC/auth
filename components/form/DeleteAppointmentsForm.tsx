"use client"

import { useState,useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { DateRange } from "react-day-picker"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@nextui-org/react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import GoogleConnectButton from "../ui/GoogleConnectButton"
import { addDays } from "date-fns"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { DatePickerWithRange } from "../DatePickerWithRange"
import { createDateTime } from "@/lib/dates"
import { useToast } from "../hooks/use-toast"
import {Spinner} from "@nextui-org/spinner";
import GenerateKey from "../ui/GenerateKey";

type FormValues = z.infer<typeof formSchema>;


const formSchema = z.object({
  dateRange: z.object({
    from: z.date(), // Make 'from' optional for better validation handling
    to: z.date().optional(),   // Make 'to' optional for better validation handling
  }),
})

export default function DeleteAppointmentsCompomnent() {

  const { toast } = useToast()

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(addDays(new Date(), 1).setHours(0, 0, 0, 0)),
    to:new Date(addDays(new Date(), 2000).setHours(0, 0, 0, 0)),
  })

  const [isLoading, setLoading] = useState(false);

  const [isGoogleConnected, setLoggedIn] = useState(false);

      // Fetch route getGoogleAuth in /api/auth to see if the user is logged in on a useEffect
  useEffect(() => {
        async function checkIfLoggedIn() {
            const response = await fetch('/api/auth/getGoogleAuth');
            const data = await response.json();
            if (!data.error) {
                setLoggedIn(true);
            }
        }
        checkIfLoggedIn();
    }, []);

    console.log(isGoogleConnected);



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateRange: date,
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {

    setLoading(true);

    const payload = {
      startDatetime: values.dateRange.from ,
      endDatetime : values.dateRange.to!,
    }

    try{  
      const response = await fetch('/api/deleteEvents', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json()
      if (responseData.error) {
        throw new Error("Something went wrong")
      } 
      setLoading(false);
      toast({
        variant: "default",
        description: "Appointments scheduled successfully",
      })

    } catch (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        description: "Something went wrong",
      })
    } 
    
  }

  return (
    <>
    {isGoogleConnected ? (
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    date={date}
                    setDate={setDate}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> 
          {isLoading ? (  
            <Button 
            type="submit" 
            isDisabled 
            className="bg-success w-full">
              Submitting
              <Spinner size="sm" />
            </Button>
        ) : (
          <Button 
          type="submit" 
          className="bg-success w-full">
            Submit
          </Button>
        )}

      </form>
    </Form>
    ) : (
      <div className="space-y-2">
        <GoogleConnectButton />
      </div>
    )}
    </>
    
  )
}