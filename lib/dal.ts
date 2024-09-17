import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './encrypt'
import { cache } from 'react'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const cookie = cookies().get('session')?.value
  if (!cookie) {
    return { isAuth: false}
  }
  const session = await decrypt(cookie!)
 
  if (!session?.sessionId) {
    redirect('/login')
  }

  // Check the sesion hasn't expired
    const currentTime = new Date().getTime()
    if (session.expiresAt < currentTime) {
        redirect('/login')
    }   
 
  return { isAuth: true, cookie }
})

// Get the user's session
export const getServerSession = cache(async () => {
   const auth = await verifySession()
   if (!auth.isAuth) {
     return null
   }
   return auth.cookie
})
