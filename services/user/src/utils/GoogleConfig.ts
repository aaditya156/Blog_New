import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export const oauth2Client = new OAuth2Client(
  clientId,
  clientSecret,
  "postmessage"
);

export const verifyGoogleToken = async (idToken: string) => {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("[Google OAuth] Token verification failed:", error);
    return null;
  }
};
