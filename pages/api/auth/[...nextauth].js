import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(
    process.env.PRIVY_APP_ID,
    process.env.PRIVY_APP_SECRET
);

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Privy",
            credentials: {
                token: { label: "Privy Auth Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.token) {
                    return null;
                }
                try {
                    const verifiedClaims = await privy.verifyAuthToken(credentials.token);
                    // The user object you return here will be encoded in the JWT.
                    return {
                        id: verifiedClaims.userId,
                        ...verifiedClaims
                    };
                } catch (error) {
                    console.error("Token verification failed:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Persist the privy user id to the token right after signin
            if (user) {
                token.uid = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token and user id from a provider.
            session.user.id = token.uid;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
