import { SignInForm } from "@/components/form/SignInForm"
import { getSessionData } from "@/lib/dal"
import { redirect } from "next/navigation"


export default async function SignInPage() {
    const session = await getSessionData('session')
    if (session.mfaVerified) {
        redirect('/dashboard')
    }
    return <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
              <div className="w-full max-w-96 min-w-80 p-2">
                  <SignInForm/>
              </div>        
      </main>
  }

