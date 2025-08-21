import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Using shadcn/ui button

// Landing page component
export default function HomePage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  // Disable login button until Privy is ready
  const isLoginDisabled = !ready;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <main className="flex flex-col items-center justify-center w-full flex-1 text-center">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
        >
          Welcome to the <span className="text-primary">Web3 Arcade</span>
        </motion.h1>

        <motion.p 
          className="mt-4 text-lg md:text-2xl text-muted-foreground max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 100 }}
        >
          Play classic arcade games, save your high scores on-chain, and compete on the global leaderboard.
        </motion.p>

        <motion.div 
          className="mt-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            onClick={login}
            disabled={isLoginDisabled}
            size="lg"
            className="text-lg font-semibold px-8 py-6"
          >
            {isLoginDisabled ? 'Loading...' : 'Login with MonadID'}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
