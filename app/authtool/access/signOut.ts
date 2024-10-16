"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/hooks/use-toast';

export function useSignOut() {
  const router = useRouter();
  const { toast } = useToast();

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signOut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      if (responseData.error) {
        toast({
          variant: 'destructive',
          description: 'Error signing out',
          duration: 5000,
        });
      } else {
        toast({
          variant: 'success',
          description: 'Signed out successfully',
          duration: 5000,
        });
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error signing out',
        duration: 5000,
      });
    }
  };

  return { signOut };
}
