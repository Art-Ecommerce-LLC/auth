'use server';
import { verifyDatabaseSession } from "@/lib/dto";
import {NavbarClient }from "@/components/ui/NavbarClient";

// Notice the `typeof NavbarClient` in the JSX return below
export async function NavbarServer() {
    // Get the current user
    const isAuth = await verifyDatabaseSession();
    if (!isAuth) {
        return <NavbarClient isAuth={isAuth}/>;
    }
    return <NavbarClient isAuth={isAuth}/>;
}