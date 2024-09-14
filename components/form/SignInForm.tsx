"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"

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
import { cookies } from 'next/headers'


    
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).min(5).max(50),
    password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/, {
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
    }),
})


export function SignInForm() {
    // 1. Define your form.
    const { toast } = useToast()
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
      const response = await fetch('/api/auth/validateLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const responseData = await response.json()

      if (responseData.error) {
        form.reset()
        toast({
          variant: "destructive",
          description: "Something Went Wrong,"
        });
      } else if(responseData.tempCUID){
        toast({
          variant: "success",
          description: "User has not verified email yet, please verify email to login",
        });
        form.reset();
        setTimeout(() => {
          window.location.href = `/verify-email?tempCUID=${encodeURIComponent(responseData.tempCUID)}`;
        }, 2000)
      } else  {
        // log the sessionToken from the res.cookies

        toast({
          variant: "success",
          description: "Login Successful",
        });
        form.reset();

        // Validate the sessionToken from an API call
        const sessionResponse = await fetch('/api/auth/validateSession', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const sessionData = await sessionResponse.json()
        if (sessionData.error) {
          toast({
            variant: "destructive",
            description: "Something Went Wrong",
          });
        } else {
          console.log(sessionData.sessionToken)
        }
        
        setTimeout(() => {
          window.location.href = `/`;
        }, 2000)

    }
  }

    return (
        <Form {...form}>
          <h1 className="text-2xl text-center font-semibold pb-3">Sign In</h1>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" variant="outline" className="text-black w-full mt-2">Submit</Button>
            </div>
            <div>
              <p className="text-white text-sm">Don't Have an Account? <Link href="/sign-up" className="text-blue-500">Sign Up</Link></p> 
            </div> 
            <div>
              <p className="text-white text-sm">Forgot your Password? <Link href="/forgot-password" className="text-blue-500">Click Here</Link></p>
            </div>         
          </form>
        </Form>
      )
  }