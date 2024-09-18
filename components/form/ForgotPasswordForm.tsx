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
import { Input } from "@/components/ui/input"
import { useToast } from "../hooks/use-toast"
import { useRouter } from "next/navigation"
 
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).min(5).max(50),
})


export function ForgotPasswordForm() {
    // 1. Define your form.
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: "",
      },
    })
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      const response = await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
        })
      const responseData = await response.json()
      if (responseData.error) {
          toast({
              variant: "destructive",
              description: "Something Went Wrong",
          })
      } else {
          toast({
              variant: "success",
              description: "Password reset link has been sent to your email",
              })
          }
        router.push('/reset-password')
    }

    return (
        <Form {...form}>
          <h1 className="text-2xl text-center font-semibold pb-3">Reset Password</h1>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />       
             <Button type="submit" variant="outline" className="text-black w-full">Submit</Button>
          </form>
        </Form>
      )
  }