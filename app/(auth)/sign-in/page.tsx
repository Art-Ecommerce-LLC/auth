import { SignInForm } from "@/components/form/SignInForm"

export default async function SignInPage() {

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <SignInForm/>
        </div>        
    </main>
  );
}
