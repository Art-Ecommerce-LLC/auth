import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code'); // Get the authorization code from the query parameters

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // Must match your callback URI in Google Cloud Console
  );

  try {
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set the credentials (tokens) to the OAuth2 client
    oauth2Client.setCredentials(tokens);

    // Optionally save the tokens (e.g., in a database or session)
    if (tokens.refresh_token) {
      console.log('Refresh Token:', tokens.refresh_token); // Save it securely
    }

    console.log('Access Token:', tokens.access_token); // Save it securely
    
    // Redirect to a success page or send the tokens back as a response
    return NextResponse.json({ message: 'OAuth2 flow completed successfully', tokens });
  } catch (error) {
    console.error('Error in OAuth2 callback:', error);
    return NextResponse.json({ error: 'Error exchanging code for tokens' }, { status: 500 });
  }
}
