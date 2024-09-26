"use client";

import { useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { OTPForm } from "@/components/form/OTPForm"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/hooks/use-toast"


export default function OTPComponent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  async function resendEmail() {
    setLoading(true);
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
            setLoading(false)
        } else {
            toast({
                variant: "success",
                description: "OTP has been resent",
                duration: 5000,
                })
            }
            setLoading(false)
    } catch {
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
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <OTPForm/>
            <Button 
            onClick={resendEmail} 
            className="w-80 mt-1"
            disabled={loading}>
              {loading ? "Resending..." : "Resend"}
            </Button>
        </div>        
    </main>
    </div>
  );
}
