import { SignInForm } from "@/components/form/SignInForm"
import { validateSignInPage } from "@/lib/dto";

export default async function SignInPage() {

  // Check if user is already logged in
  // If user is already logged in, redirect to home page
  await validateSignInPage();

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <SignInForm/>
        </div>        
    </main>
  );
}
