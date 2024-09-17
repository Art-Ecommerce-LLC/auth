import { getUser ,getSessionMFA, getUserSession} from '@/lib/dto';
import * as React from 'react';
import { redirect } from 'next/navigation';  // Server-side redirect

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getUser();
    const sessionMFA = await getSessionMFA();
    const session = await getUserSession();

    // If there is no user, redirect to the login page
    if (!session) {
        redirect('/login');  // This handles the server-side redirection
    }
    // check if session has expired
    const currentTime = new Date().getTime();
    if (session.expiresAt < currentTime) {
        redirect('/login');
    }

    if (!user) {
        redirect('/login');  // This handles the server-side redirection
    }
    if (!user.emailVerified) {
        redirect('/verify-email');
    }
    if (!sessionMFA) {
        redirect('/otp');
    }
    console.log('sessionMFA', sessionMFA);
    // If the user is authenticated, render the children
    return (
    <div>
         {React.cloneElement(children as React.ReactElement, { user, session, sessionMFA })}
    </div>
    );
}
