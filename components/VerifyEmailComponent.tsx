"use client";

import { useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import Link from 'next/link';
import { Button } from './ui/button';
import { useToast } from "./hooks/use-toast"
import { buttonVariants } from "./ui/button"

export default function VerifyEmailPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false);
    async function resendEmail() {
        setLoading(true);
        // Send email to user with backend POST request
        try {
            const response = await fetch('/api/auth/resendEmailVerification', {
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
                    description: "Verification email has been sent",
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
            <h1> Verify Email</h1>
            <p> You must verify your email to acess your account</p>
            <Button 
            onClick={resendEmail} 
            type="submit" 
            variant="outline" 
            className="text-black w-full font-size-sm mt-2 mb-3"
            disabled={loading}>
              {loading ? "Resending..." : "Resend"}
            </Button>
            <Link href="/sign-in" className={buttonVariants({ variant: "outline" })}>Sign In</Link>
        </div>        
    </main>
    </div>
    );
}
