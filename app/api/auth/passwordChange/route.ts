import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/encrypt'
import db from '@/app/lib/db'
import bcrypt from 'bcrypt'
import { deleteSession } from '@/app/lib/session'

// Define a schema for input Validation
const userSchema = z.object({
    password: z.string().min(1, 'Password is required').min(8, 'Password must have than 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm Password is required').min(8, 'Password must have than 8 characters'),
})

export async function POST(request: NextRequest) {
    try {
        // get the body of the request
        const body = await request.json()

        // validate the input
        const { password, confirmPassword } = userSchema.parse(body)

        // validate the passwords are the same
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
        }

        // validate the cookie session
        const cookieSession = cookies().get('resetPassword')

        if (!cookieSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Decrypt the session if it is valid
        const session = await decrypt(cookieSession.value)
        console.log('session', session)
        // validate the session exists, first 
        const sessionData = await db.resetPassword.findUnique({
            where: { userId: session.userId }
        })

        // Validate the token
        if (!sessionData) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }
        
        const isValidateToken = await bcrypt.compare(session.token, sessionData.token)

        if (!isValidateToken) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 404 })
        }

        // validate the user exists
        const user = await db.user.findUnique({
            where: { id: sessionData.userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // update the user password
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            }
        })

        // delete the session
        await deleteSession({
            userId: user.id,
            deleteAllSessions: true,
            request: request
        })

        return NextResponse.json({ success: 'Password changed' }, { status: 200 })
    } catch (error) {
        console.log('error', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}