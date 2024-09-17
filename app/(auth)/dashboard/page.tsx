import { getUserName } from '@/lib/dto'
import { redirect } from 'next/navigation'

export default function Dashboard() {
  const username = getUserName()
  if (!username) {
    redirect('/sign-in')
  }
    return (
        <div>
          <h1>Welcome back, {username}</h1>
        </div>
    )
}