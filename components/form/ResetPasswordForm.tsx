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
import { useRouter } from "next/navigation"
import { useToast } from "../hooks/use-toast"
 
const formSchema = z.object({
    password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/, {
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
    }),
    confirmPassword: z.string().min(8).max(50),

}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // This will set the error on the confirmPassword field
});


export function ResetPasswordForm() {
    // 1. Define your form.
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        password: "",
        confirmPassword: "",
      },
    })
   
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // submit the passwordChange request
      const response = await fetch('/api/auth/passwordChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      const responseData = await response.json()

      if (responseData.error) {
        // handle the error
        toast({
          variant: "destructive",
          description: "Something Went Wrong",
        })
      } else {
        // handle the success
        toast({
          variant: "success",
          description: "Your password has been successfully changed",
        })
        router.push('/password-changed')

      }
    }

    return (
        <Form {...form}>
          <h1 className="text-2xl text-center font-semibold pb-3">Reset Password</h1>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm password..." {...field} />
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