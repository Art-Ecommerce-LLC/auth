// components/SignInButton.tsx
import React from 'react';
import { User } from '@/app/models/models';

interface SignInButtonProps {
    user: User;
}

export default function GoogleSignInButton({ user }: SignInButtonProps) {



  const handleSignIn = () => {
    // Redirect to your backend API route that initiates the Google OAuth flow
    window.location.href = '/api/auth/google';
  };

  return (
    <button onClick={handleSignIn}>
      Sign in with Google to access your Calendar
      {JSON.stringify(user)}
    </button>
  );
};
