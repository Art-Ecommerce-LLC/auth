"use client"

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "../hooks/use-toast"
import { useRouter } from "next/navigation"

// Define the schema for OTP validation
const formSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
})

export function OTPForm() {
  const { toast } = useToast()
  const router = useRouter()

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
      // Send request to validate OTP

    const response = await fetch('/api/auth/validateOTP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        })
    if (response.status == 404) {
        toast({
            variant: "destructive",
            description: "OTP is invalid, resend OTP and try gain",
        })
    } else if (response.status == 409) {
        toast({
            variant: "destructive",
            description: "Session already verified, redirecting to dashboard",
        })
        router.push("/dashboard")
    } else if (response.status == 200) {
        toast({
            variant: "success",
            description: "OTP verified, redirecting to dashboard",
        })
        router.push("/dashboard")
    }

  }
  return (
    <Form {...form}>
      <h1 className="text-2xl text-left font-semibold pb-3">Enter OTP</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 ">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <InputOTP maxLength={6} {...field}>
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
        <Button type="submit" variant="success" className="w-80 mt-3">
          Verify OTP
        </Button>
      </form>
    </Form>
  )
}
