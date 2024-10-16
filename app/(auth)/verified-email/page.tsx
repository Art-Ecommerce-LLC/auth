


import { buttonVariants } from "@/app/components/ui/button"
import Link from 'next/link'

export default async function VerifiedEmailPage() {


    return (
        <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
            <div className="w-full max-w-96 min-w-80 p-2">
                <h1 className="text-2xl font-bold">Verified Email</h1>
                <p className="mt-2">Your email has been verified.</p>
                <Link className={buttonVariants({ variant: "outline" })} href="/sign-in">Sign In</Link>
            </div>        
        </main>
    );
}