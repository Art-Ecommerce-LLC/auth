import 'server-only'
import db from './db'
import { getServerSession } from './dal'
import { decrypt } from './encrypt'

export async function verifyDatabaseSession(session: string) {
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
