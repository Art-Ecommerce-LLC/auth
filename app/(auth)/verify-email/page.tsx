
import VerifyEmailComponent from "./VerifyEmailComponent"
import { validateVerifyEmailPage } from "@/lib/dto";

export default async function VerifyEmailPage() {

  await validateVerifyEmailPage();

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
           <VerifyEmailComponent/>
        </div>        
    </main>
  );
}
