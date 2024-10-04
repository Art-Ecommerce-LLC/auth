import { OAuth2Client } from 'google-auth-library';

// Function to exchange authorization code for access/refresh tokens
async function getTokensFromCode(code : string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  console.log('Access Token:', tokens.access_token);
  console.log('Refresh Token:', tokens.refresh_token); // Store this in your database securely
  oauth2Client.setCredentials(tokens);

  return tokens;
}
