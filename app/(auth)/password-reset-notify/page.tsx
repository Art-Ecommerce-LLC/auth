"use client";

import {Button} from '@/components/ui/button';
import { useToast } from '@/components/hooks/use-toast';

export default function PasswordResetNotifyPage() {
  const { toast } = useToast();
  async function resendPasswordLink() {
    // Logic to resend the password reset link
    // A get request to the server to resend the link

    const response = await fetch('/api/auth/resendPasswordReset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await response.json();

    if (!responseData.success) {
      console.log(responseData.error);
        toast({
        title: 'Error',
        description: 'Failed to resend password reset link.',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Password reset link resent successfully.',
        variant: 'success',
      });
    } 
  }

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
        <div >
            <p>A link to reset your password has been sent if you have an account.</p>
            <Button className="w-full text-black" variant={'outline'} onClick={() => {resendPasswordLink()}}>Resend Password Link</Button>
        </div>
        </div>        
    </main>
  );
}
