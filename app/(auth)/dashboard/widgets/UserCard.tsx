import { User } from "models/models";

export function UserCard({ user }: { user: User }) {
    return (
        <div className="border-1 flex flex-col shadow-slate-700 h-[20rem] w-[20rem] m-5">
            <p>{user.username}</p>
            <p>{JSON.stringify(user)}</p>
        </div>
    );
    }
