// page to click sign out buttonimport { SignInForm } from "@/components/form/SignInForm"
"use client";
import { useRouter } from "next/navigation"
import { Button} from "@/components/ui/button";

export default async function SignOutPage() {
    const router = useRouter();
    async function signOut() {
    
    const response = await fetch('/api/auth/signOut', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.status === 200) {
      router.push('/');
    }
  }

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <Button variant="success" onClick={signOut}>Sign Out</Button>
        </div>        
    </main>
  );
}
