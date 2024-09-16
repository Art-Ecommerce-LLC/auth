"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useToast } from "../hooks/use-toast"
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

 
const formSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email({ message: "Invalid email address" }).min(5).max(50),
    password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/, {
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
    }),
    confirmPassword: z.string().min(8).max(50),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This will set the error on the confirmPassword field
  });

export function SignUpForm() {
    // 1. Define your form.
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: "",
        password: "",
        username: "",
        confirmPassword: "",
      },
    })
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      const response = await fetch('/api/auth/createUser', {
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
          description: "Something Went Wrong,"
        });
        // wipe the form
        form.reset();
      } else {
        toast({
          variant: "success",
          description: "Account Created Successfully, Redirecting...",
        });
        // Redirect to the verify email page
        // wipe the form
        form.reset();
        setTimeout(() => {
          window.location.href = '/verify-email';
        }, 2000)
    }
  }

    return (
        <Form {...form}>
          <h1 className="text-2xl text-center font-semibold pb-3">Sign Up</h1>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input type="password" placeholder="Enter password.." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm passwored..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" variant="outline" className="text-black w-full font-size-sm mt-2">Submit</Button>
            </div>
            <div>
              <p className="text-white font-size-sm">Already have an account? <Link href="/sign-in" className="text-blue-500">Sign In</Link></p>  
            </div>
            <div>
                <p className="text-white font-size-sm">By signing up, you agree to our <Link href="/terms-of-service" className="text-blue-500">Terms of Service</Link> and <Link href="/privacy-policy" className="text-blue-500">Privacy Policy</Link>
                </p>
            </div>
          </form>
        </Form>
      )
  }