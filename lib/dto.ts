import { validateSession } from './dal';
import { redirect } from 'next/navigation'


export const verifyEmailSession = async () => {
  const session = await validateSession('verifyEmail');
    if (!session) {
        redirect('/sign-in');
    }

}

export const verifyEmailVerified = async () => {
        const {user , session} = await validateSession('verifyEmail');
        console.log(user);
        console.log(session);
        if (!session || !user) {
            redirect('/sign-in');
        }
        if (!user.emailVerified) {
            redirect('/verify-email');
        }
    }
            