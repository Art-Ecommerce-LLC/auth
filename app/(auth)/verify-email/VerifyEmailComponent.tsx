"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/hooks/use-toast"
import { buttonVariants } from "@/components/ui/button"

export default function VerifyEmailPage() {
    const { toast } = useToast()

    async function resendEmail() {
        // Send email to user with backend POST request
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
            })
        } else {
            toast({
                variant: "success",
                description: "Verification email has been sent",
                })
            }
    }

    return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <h1> Verify Email</h1>
            <p> You must verify your email to acess your account</p>
            <Button onClick={resendEmail} type="submit" variant="outline" className="text-black w-full font-size-sm mt-2 mb-3">Resend Email</Button>
            <Link href="/sign-in" className={buttonVariants({ variant: "success" })}>Sign In</Link>
        </div>        
    </main>
    );
}
