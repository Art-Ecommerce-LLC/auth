"use client"
 
import { useState, useEffect } from "react";
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
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "../hooks/use-toast"
import { useSearchParams } from "next/navigation";
 
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
    const [loading, setLoading] = useState(false);
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
      setLoading(true); // Show loading spinner
      // Add the userId to the values
 
      try{
        const response = await fetch(`/api/auth/passwordChange`, {
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
            description: "Something Went Wrong",
            duration: 5000,
          })
          setLoading(false)
        } else {
          toast({
            variant: "success",
            description: "Your password has been successfully changed",
            duration: 5000,
          })
          router.push('/password-changed')
        }
      } catch {
        // handle the error
        toast({
          variant: "destructive",
          description: "Something Went Wrong",
          duration: 5000,
        })
        setLoading(false)
      }
    }
    useEffect(() => {
      const handleSessionDeletion = async () => {
        await fetch("/api/auth/remove-reset-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      };
  
      // Handle page unload (closing the page or navigating away)
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        handleSessionDeletion();
        event.preventDefault();
        event.returnValue = ""; // This triggers the browser's prompt for unsaved changes
      };
  
      // Handle popstate event (browser back/forward navigation)
      const handlePopState = () => {
        handleSessionDeletion();
      };
  
      // Add event listeners
      window.addEventListener("beforeunload", handleBeforeUnload); // Tab close or refresh
      window.addEventListener("popstate", handlePopState); // Back or forward navigation
  
      // Cleanup event listeners on component unmount
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }, []);
    return (
      <div className="relative">
      {/* Dimming Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
          <Spinner size="lg" color="success"/>
        </div>
      )}
        <Form {...form}>
          <h1 className="text-2xl text-center font-semibold pb-3">Reset Password</h1>
          <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-3"
          style={{ pointerEvents: loading ? "none" : "auto" }}>
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                    type="password" 
                    placeholder="Confirm password..." 
                    disabled={loading}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />      
             <Button 
             type="submit" 
             variant="outline" 
             className="text-black w-full"
             disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
             </Button>
          </form>
        </Form>
      </div>
      )
  }