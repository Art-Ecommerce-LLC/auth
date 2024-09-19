'use server';
 
import { cookies } from 'next/headers';
import db from './db';
import { encrypt } from './encrypt';
import { createId } from '@paralleldrive/cuid2';
import { hash } from 'bcrypt';

// The createSession function to handle session creation
export async function createSession(id: string) : Promise<string> {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // 1. Create a session in the database
    const data = await db.session.create({
      data: {
        userId: id,
        expiresAt,
      },
    });
  
    const sessionId = data.sessionId;
  
    // 2. Encrypt the session ID and expiration
    // Turn date into string
    const expireDate = expiresAt.toISOString();

    const session = await encrypt({ sessionId, expireDate });
    const isProduction = process.env.NODE_ENV === 'production';
    // 3. Store the session in cookies for optimistic auth checks
    cookies().set('session', session, {
      httpOnly: true,
      secure: isProduction,
      expires: expiresAt,
      sameSite: 'strict',
      path: '/',
    });
    return session;
  } catch (error) {
    throw new Error('Session creation failed');
  }
}

export async function deleteSession(sessionId: string) {
    // 1. Remove all sessions associated with the session from the database
    try {
        await db.session.deleteMany({
            where: { sessionId: sessionId },
        });

        // 2. Remove all sessions associated with the session from the cookies

        // Clear any cookie associate with session in the cookies
        cookies().delete('session');
    }
    catch (error) {
        throw new Error("Error deleting session");
    }
}

// Function to generate a unique 6-digit OTP and create a session
export async function createOTPSession(sessionId: string): Promise<string> {
  try {
    let otp: string;
    let otpExists = true;

    // Loop until we find a unique OTP
    do {
      otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
      
      // Hash the OTP before checking for uniqueness
      const hashedOtp = await hash(otp, 10); // Hash the OTP with a salt round of 10

      // Check if the hashed OTP already exists in the database
      const existingOTP = await db.oTP.findUnique({
        where: { otp: hashedOtp }, // Check against the hashed OTP
      });
      otpExists = !!existingOTP; // If the OTP exists (hashed version), repeat the loop
    } while (otpExists);

    // Get the current time
    const dateNow = new Date();

    // Store the hashed OTP in the database, with an expiration time of 5 minutes
    const hashedOtp = await hash(otp, 10); // Hash the OTP again before storing it
    await db.oTP.create({
      data: {
        sessionId,
        otp: hashedOtp, // Store the hashed OTP
        expiresAt: new Date(dateNow.getTime() + 5 * 60 * 1000), // 5 minutes from now
      },
    });

    // Return the unhashed OTP (this is what you'd send to the user)
    return otp;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to create OTP session");
  }
}

export async function deleteOTPSessions(sessionId: string) {
    // 1. Remove all OTPs associated with the session from the database
    try {
        await db.oTP.deleteMany({
            where: { sessionId: sessionId },
        });
    }
    catch (error) {
        throw new Error("Error deleting OTP sessions");
    }
}

export async function createResetPasswordSession(userId: string): Promise<string> {
  try {
    let token: string;
    let hashedToken: string;
    let tokenExists = true;

    // Loop until we generate a unique hashed token
    do {
      // 1. Generate a cryptographically secure token
      token = createId(); // Securely generate a unique token
      
      // 2. Hash the token
      hashedToken = await hash(token, 10); // Hash the token with bcrypt
      
      // 3. Check if a reset password session with the hashed token already exists
      const existingToken = await db.resetPassword.findUnique({
        where: { sessionId: hashedToken }, // Check if the hashed token already exists in the database
      });

      tokenExists = !!existingToken; // If a matching token exists, the loop will continue
    } while (tokenExists); // Repeat the process if the token exists

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

    // 4. Create the reset password session in the database with the unique hashed token
    // Check if the userId already has a reset password session in the cookies
    await db.resetPassword.create({
      data: {
        userId, // Reference to the user
        sessionId: hashedToken, // Store the hashed token
        expiresAt, // Set expiration time
      },
    });

    // 5. Encrypt the token and expiration time
    // Turn date into string
    const expireDate = expiresAt.toISOString();
    const session = await encrypt({ sessionId : hashedToken, expireDate });

    // 6. Store the session in cookies for optimistic auth checks
    const isProduction = process.env.NODE_ENV === 'production';

    cookies().set('session', session, {
      httpOnly: true,
      secure: isProduction,
      expires: expiresAt,
      sameSite: 'strict',
    });

    return session;
  } catch (error) {

    throw new Error('Reset password session creation failed');
  }
}