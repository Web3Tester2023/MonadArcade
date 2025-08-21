import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

// Dynamically import game components to avoid bundling all games on one page
const Snake = dynamic(() => import('@/components/games/Snake'), { ssr: false });
const TicTacToe = dynamic(() => import('@/components/games/TicTacToe'), { ssr: false });
const FlappyBird = dynamic(() => import('@/components/games/FlappyBird'), { ssr: false });
const Breakout = dynamic(() => import('@/components/games/Breakout'), { ssr: false });

const gameComponents = {
  snake: Snake,
  tictactoe: TicTacToe,
  flappy: FlappyBird,
  breakout: Breakout,
};

// Game page component
export default function GamePage() {
  const router = useRouter();
  const { gameId } = router.query;
  const { ready, authenticated } = usePrivy();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const GameComponent = gameComponents[gameId];

  if (!GameComponent) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p>Game not found!</p>
            <Link href="/dashboard" passHref><Button className="mt-4">Back to Games</Button></Link>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="absolute top-4 left-4">
            <Link href="/dashboard" passHref>
                <Button variant="outline">Back to Games</Button>
            </Link>
        </div>
      <GameComponent />
    </div>
  );
}
