import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// List of available games
const games = [
    { id: 'snake', name: 'Snake', description: 'A classic snake game.' },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', description: 'The timeless two-player game.' },
    { id: 'flappy', name: 'Flappy Bird', description: 'Flap your way through the pipes.' },
    { id: 'breakout', name: 'Breakout', description: 'Break all the bricks to win.' },
];

// Dashboard page component
export default function DashboardPage() {
    const { ready, authenticated, user, logout } = usePrivy();
    const router = useRouter();

    // Redirect to home if user is not authenticated
    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
    }, [ready, authenticated, router]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="p-4 flex justify-between items-center border-b">
                <h1 className="text-2xl font-bold text-primary">Web3 Arcade</h1>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground hidden sm:block">{user?.wallet?.address}</p>
                    <Button onClick={logout} variant="destructive">Logout</Button>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Choose a Game</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {games.map((game, index) => (
                        <Link href={`/game/${game.id}`} key={game.id} passHref>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card className="hover:border-primary transition-colors cursor-pointer">
                                    <CardHeader>
                                        <CardTitle>{game.name}</CardTitle>
                                        <CardDescription>{game.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
