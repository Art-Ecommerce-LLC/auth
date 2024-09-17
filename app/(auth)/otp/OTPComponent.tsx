"use client";

import { OTPForm } from "@/components/form/OTPForm"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/hooks/use-toast"


export default function OTPComponent() {
  const { toast } = useToast();
  async function resendEmail() {
    
    // Send email to user with backend POST request
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
        })
    } else {
        toast({
            variant: "success",
            description: "OTP has been resent",
            })
        }
}

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <OTPForm/>
            <Button onClick={resendEmail} className="w-80 mt-1">Resend OTP</Button>
        </div>        
    </main>
  );
}
