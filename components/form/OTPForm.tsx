"use client"

import { useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "../ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp"
import { useToast } from "../hooks/use-toast"
import { useRouter } from "next/navigation"

// Define the schema for OTP validation
const formSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
})

export function OTPForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function resendEmail() {
    setResendLoading(true);
    try {
        const response = await fetch('/api/auth/resendOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            })
        const responseData = await response.json()
        if (responseData.error) {
            toast({
                variant: "destructive",
                description: "Something Went Wrong",
                duration: 5000,
            })
            setResendLoading(false)
        } else {
            toast({
                variant: "success",
                description: "OTP has been resent",
                duration: 5000,
                })
            }
            setResendLoading(false)
    } catch {
        toast({
            variant: "destructive",
            description: "Something Went Wrong",
            duration: 5000,
        })
        setResendLoading(false)
    }
}

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
      // Send request to validate OTP
      
    setSubmitLoading(true); // Show loading spinner
    try {
      const response = await fetch('/api/auth/validateOTP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        })
      const responseData = await response.json()
      if (responseData.error) {
          toast({
              variant: "destructive",
              description: "Invalid OTP",
          })
          setSubmitLoading(false)
      } else {
          toast({
              variant: "success",
              description: "OTP verified",
          })
          router.push('/dashboard');
      }
    } catch (error) {
      toast({
          variant: "destructive",
          description: "Something Went Wrong",
          duration: 5000,
      })
      setSubmitLoading(false)
    }
  }
  return (
    <div className="relative">
      {/* Dimming Overlay */}
      {(submitLoading || resendLoading) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
          <Spinner size="lg" color="success"/>
        </div>
      )}
    <div className="flex items-center justify-center min-h-screen"> 
      <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-md">
      <Form {...form}>
      <h1 className="text-2xl text-left font-semibold pb-3">Enter OTP</h1>
      <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="space-y-3 "
      style={{ pointerEvents: (submitLoading || resendLoading) ? "none" : "auto" }}>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <InputOTP 
                        maxLength={6} 
                        disabled={(submitLoading || resendLoading)}
                        {...field}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                        </InputOTP>
                    </FormControl>
                </FormItem>
            )}
            />
        <Button 
        type="submit" 
        variant={"outline"}
        className="w-80 mt-3 text-black"  
        disabled={submitLoading}>
        {submitLoading ? "Submitting..." : "Submit"}
        </Button>
        <Button 
          type="button"
          variant="outline"
            onClick={resendEmail} 
            className="w-80 mt-1 text-black"
            disabled={resendLoading}>
              {resendLoading ? "Resending..." : "Resend"}
          </Button>
      </form>
    </Form>
      </div>
    </div>
    </div>
  )
}
