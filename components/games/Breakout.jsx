import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Breakout = () => {
    const { user } = usePrivy();
    // Game logic for Breakout would go here
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const submitScore = useCallback(async () => {
        if (!user) return;
        await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                gameId: 'breakout',
                score,
            }),
        });
    }, [score, user]);

    useEffect(() => {
        if (gameOver) {
            submitScore();
        }
    }, [gameOver, submitScore]);

    return (
        <div>
            <h2 className="text-2xl font-bold">Breakout</h2>
            <p>Score: {score}</p>
            {/* Game canvas and logic */}
            {gameOver && <p>Game Over!</p>}
        </div>
    );
};

export default Breakout;
