import { SignUpForm } from "@/components/form/SignUpForm"

export default async function SignUpPage() {

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <SignUpForm/>
        </div>        
    </main>
  );
}
