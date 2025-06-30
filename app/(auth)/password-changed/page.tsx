"use client";

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default function PasswordChangedPage() {

    function signInRedirect() {
        // Redirect to the sign-in page
        redirect('/sign-in');
    }
    return (
      <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
          <div className="w-full max-w-96 min-w-80 p-4">
              <p className='text-center pb-3'>Your Password has been changed</p>
              {/* Make sign in button width of div */}
              <Button className="w-full text-black" variant={'outline'} onClick={() => signInRedirect()}>Sign In</Button>
          </div>        
      </main>
    );
}