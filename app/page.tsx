
import Link from 'next/link';
export default function Home() {
  return (

    <main className="flex min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full flex flex-col max-w-96 min-w-80 p-2 text-center">
            <h1> Welcome to the Homepage</h1>
            <Link href="/sign-in"> Sign In</Link>
            <Link href="/sign-up"> Sign Up</Link>
            <Link href="terms-of-service"> Terms of Service</Link>
            <Link href="privacy-policy"> Privacy Policy</Link>
            <Link href="forgot-password"> Forgot Password</Link>
            <Link href="reset-password"> Reset Password</Link>
            <Link href="verify-email"> Verify Email</Link>
            <Link href="verified-email"> Verified Email</Link>
            <Link href="dashboard"> Dashboard</Link>  
            <Link href="otp"> OTP</Link>
            <Link href="sign-out">Sign Out</Link>
          
        </div>        
    </main>
  );
}
