"use client";

import { User } from "@/models/models";

export default function UserDashboard({user} : {user : User}) {
    return (
        <div>
        <h1>User Dashboard</h1>
        <p>Welcome, {JSON.stringify(user)}</p>
        </div>
    );
}