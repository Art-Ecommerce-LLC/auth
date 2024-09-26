'server only';

import { validateSession } from './dal';
import { redirect } from 'next/navigation'


export async function validateSignInPage() {
    const {user:_, session}= await validateSession('session');
    if (session) {
        redirect('/dashboard');
    }
}

export async function validateVerifyEmailPage() {
    const {user:_, session}= await validateSession('verifyEmail');
    if (!session) {
        redirect('/sign-in');
    }
}

export async function validateOtpPage() {
    const {user:_, session}= await validateSession('otp');
    if (!session) {
        redirect('/sign-in');
    }
}

export async function validateResetPasswordPage() {
    const {user:_, session}= await validateSession('resetPassword');
    console.log(session);
    if (!session) {
        redirect('/sign-in');
    }
}

export async function validateMFA() {
  const { user, session } = await validateSession('session');
  console.log(user, session);
  if (!user || !session) {
    redirect('/sign-in');
  }

  // check mfa verified on the session as a field and the value is true
  console.log('session', session);
  if (!('mfaVerified' in session)) {
    console.log('MFA not verified');
    redirect('/sign-in');
  }
  return { user, session };
}

export async function getUsername() {
  const { user } = await validateMFA();
  return user.username;
}