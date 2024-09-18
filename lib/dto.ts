import 'server-only'
import db from './db'
import { getServerSession } from './dal'
import { decrypt } from './encrypt'
import { redirect } from 'next/navigation'

export async function verifyDatabaseSession() {

    const session = await getServerSession()
    if (!session) {
        return false
    }
    const decryptedSession = await decrypt(session)
    const sessionData = await db.session.findUnique({
        where: { sessionId: decryptedSession.sessionId }
    })

    if (!sessionData) {
        return false
    }
    return true
}

export async function getUserSession() {
    const cookie = await getServerSession()
    if (!cookie) {
        return null
    }
    const session = await decrypt(cookie)
    return session
}

export async function getSessionMFA() {
    const session = await getUserSession()
    if (!session) {
        return null
    }
    const sessionData = await db.session.findUnique({
        where: { sessionId: session.sessionId }
    })
    return sessionData?.mfaVerified
}

export async function getUser() {
  const cookie = await getServerSession()

  if (!cookie) {
    return null
  }
 const session = await decrypt(cookie)

  // Parse the session to
  // Check the session isn't expired
    const currentTime = new Date().getTime()
if (session.expiresAt < currentTime) {
    return null
}

  const sessionData = await db.session.findUnique({
    where: { sessionId: session.sessionId }
  })

    if (!sessionData) {
        return null
    } 
    const user = await db.user.findUnique({
        where: { id: sessionData.userId }
    })

    if (!user) {
        return null
    }
    
    // take the password off the user object
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
}

export async function getUserName() {
  const user = await getUser()
  if (!user) {
    return null
  }
  return user.username
}


export async function getUserEmail() {
  const user = await getUser()
  if (!user) {
    return null
  }
  return user.email
}


export async function verifyResetPasswordSession() {
    const cookie = await getServerSession()
    if (!cookie) {
        return null
    }
    const session = await decrypt(cookie)
    const sessionData = await db.resetPassword.findUnique({
        where: { sessionId: session.sessionId }
    })
    if (!sessionData) {
        redirect('/forgot-password')
    }
    return true
}

export async function verifyOTPSession() {
    const cookie = await getServerSession()
    if (!cookie) {
        return null
    }
    const session = await decrypt(cookie)
    const sessionData = await db.oTP.findUnique({
        where: { 
          sessionId: session.sessionId
         }
    })
    if (!sessionData) {
        return null
    }
    return true
}

export async function getEmailVerifiedStatus() {
    const user = await getUser()
    if (!user?.emailVerified) {
        return redirect('/sign-in')
    }
    return user.emailVerified
}

export async function getEmailNotYetVerified() {
    const user = await getUser()
    if (user?.emailVerified)
        return redirect('/sign-in')
    return user?.emailVerified
}