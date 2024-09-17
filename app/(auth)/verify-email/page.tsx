
import { getUser } from "@/lib/dto"
import { redirect } from "next/navigation";
import VerifyEmailComponent from "./VerifyEmailComponent"


export default async function VerifyEmailPage() {

  const user = await getUser();
  if (!user) {
    redirect("/sign-in")
  }

  if (user.emailVerified) {
    redirect('/otp');
  }

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
           <VerifyEmailComponent/>
        </div>        
    </main>
  );
}
