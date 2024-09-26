import {getUsername} from '@/lib/dto';

export default async function Dashboard() {

    // Make sure user is mfaVerified and logged in
    const username = await getUsername();

    return (
        <div>
          <h1>Welcome back {username}</h1>
        </div>
    )
}