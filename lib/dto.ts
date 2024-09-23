import { validateSession } from './dal';
import { redirect } from 'next/navigation'


export const verifyEmailSession = async () => {
  const sessionExist = await validateSession('verifyEmail');
 console.log(sessionExist)
    if (!sessionExist) {
        redirect('/sign-in');
    }

}