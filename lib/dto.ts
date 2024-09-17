import 'server-only'
import db from './db'
import { getServerSession } from './dal'
import { decrypt } from './encrypt'

export async function getUserUser() {
  const cookie = await getServerSession()

  if (!cookie) {
    return null
  }

 const session = await decrypt(cookie)

  // Parse the session to 
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
  const user = await getUserUser()
  if (!user) {
    return null
  }
  return user.username
}


export async function getUserEmail() {
  const user = await getUserUser()
  if (!user) {
    return null
  }
  return user.email
}
