import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("OAuth Sign-in attempt:", { email: user.email, provider: account?.provider });
        
        // Send user data to backend for registration/login
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${backendUrl}/api/users/oauth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            provider: account?.provider,
            providerId: account?.providerAccountId,
          }),
        });

        if (!response.ok) {
          console.error("Backend OAuth response error:", response.status, await response.text());
          return false;
        }

        const data = await response.json();
        console.log("Backend OAuth response:", data);
        
        if (data.token) {
          // Store token in user object to access in jwt callback
          user.backendToken = data.token;
          return true;
        }
        
        console.error("No token received from backend");
        return false;
      } catch (error) {
        console.error("OAuth sign-in error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Add backend token to JWT
      if (user?.backendToken) {
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Add backend token to session
      if (token.backendToken) {
        session.backendToken = token.backendToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
