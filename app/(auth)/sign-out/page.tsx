"use client";

import { Button} from "@/components/ui/button";
import { useSignOut } from "@/app/authtool/access/signOut";

export default async function SignOutPage() {
  const { signOut } = useSignOut();
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <Button variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>        
    </main>
  );
}

