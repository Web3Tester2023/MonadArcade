import '@/styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { PrivyProvider } from '@privy-io/react-auth';
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster"; // Using shadcn/ui toaster for notifications

// Main App component to wrap all pages
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // ThemeProvider for dark/light mode functionality
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {/* PrivyProvider for Web3 authentication */}
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmel8hhbk00ktjj0bp14upfm5"}
        config={{
          loginMethods: ['email', 'wallet', 'google', 'discord'],
          appearance: {
            theme: 'dark',
            accentColor: '#676FFF',
            logo: 'https://your-logo-url/logo.png', // Replace with your actual logo URL
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets'
          }
        }}
      >
        {/* SessionProvider for NextAuth.js session management */}
        <SessionProvider session={session}>
          <Component {...pageProps} />
          <Toaster />
        </SessionProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
}

export default MyApp;
