"use client"
 
import { useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"

import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { useToast } from "../hooks/use-toast"
import { useRouter } from "next/navigation"


    
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).min(5).max(50),
    password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/, {
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
    }),
})


export function SignInForm() {
    // 1. Define your form.
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    })
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      setLoading(true); // Show loading spinner
      try{
        const response = await fetch('/api/auth/validateLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
        const responseData = await response.json()
        if (responseData.error && response.status === 401) {
          toast({
            variant: "success",
            description: "Email has not been verified",
            duration: 5000,
          })
          router.push('/verify-email')
        } else if (responseData.error) {
          toast({
            variant: "destructive",
            description: "Email or Username are incorrect",
            duration: 5000,
          })
          setLoading(false)
        } else {
          toast({
            variant: "success",
            description: "Login Successful",
            duration: 5000,
          })
          router.push('/otp')
        }
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
        <Form {...form}>
          <h1 className="text-2xl text-center font-semibold pb-3">Sign In</h1>
          <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-3"
          style={{ pointerEvents: loading ? "none" : "auto" }}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                    placeholder="Enter email..." 
                    disabled={loading}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                    type="password" 
                    placeholder="Enter password..." 
                    disabled={loading}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button 
              type="submit" 
              variant="outline" 
              className="text-black w-full mt-2"
              disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
            <div>
              <p className="text-white text-sm">Don&apos;t Have an Account? {" "}<Link href="/sign-up" className="text-blue-500">{" "}Sign Up</Link></p> 
            </div> 
            <div>
              <p className="text-white text-sm">Forgot your Password? {" "}<Link href="/forgot-password" className="text-blue-500">Click Here</Link></p>
            </div>         
          </form>
        </Form>
      </div>
      )
  }