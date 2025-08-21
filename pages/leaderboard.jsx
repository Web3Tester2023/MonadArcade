import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Leaderboard page component
export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameId, setGameId] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const url = gameId === 'all' ? '/api/leaderboard' : `/api/leaderboard?gameId=${gameId}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
                setLeaderboard([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, [gameId]);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                 <h1 className="text-3xl md:text-4xl font-bold">Leaderboard</h1>
                 <Link href="/dashboard" passHref>
                    <Button variant="outline">Back to Games</Button>
                 </Link>
            </header>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Top Scores</CardTitle>
                        <Select onValueChange={setGameId} defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a game" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Games</SelectItem>
                                <SelectItem value="snake">Snake</SelectItem>
                                <SelectItem value="tictactoe">Tic-Tac-Toe</SelectItem>
                                <SelectItem value="flappy">Flappy Bird</SelectItem>
                                <SelectItem value="breakout">Breakout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rank</TableHead>
                                <TableHead>Player</TableHead>
                                <TableHead>Game</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                            ) : leaderboard.length > 0 ? (
                                leaderboard.map((entry, index) => (
                                    <motion.tr
                                        key={entry._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium truncate max-w-[150px]">{entry.walletAddress}</TableCell>
                                        <TableCell className="capitalize">{entry.gameId}</TableCell>
                                        <TableCell className="text-right">{entry.score}</TableCell>
                                    </motion.tr>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center">No scores found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
