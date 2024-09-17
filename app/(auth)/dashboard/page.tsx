import { getUserName } from '@/lib/dto'
 
export default function Dashboard() {
  const username = getUserName()
    return (
        <div>
        <h1>Welcome back, {username}</h1>
        </div>
    )
}