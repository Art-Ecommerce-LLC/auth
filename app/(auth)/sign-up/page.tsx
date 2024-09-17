import { SignUpForm } from "@/components/form/SignUpForm"
import { getSessionMFA, getUser } from "@/lib/dto"
import { redirect } from "next/navigation"

export default async function SignUpPage() {

  const sessionMFA = await getSessionMFA();
  const user = await getUser(); 

  if (sessionMFA) {
    redirect('/dashboard');
  }

  if (user) {
    redirect("/sign-in")
  }

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <SignUpForm/>
        </div>        
    </main>
  );
}
