import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';

const TicTacToe = () => {
    const { user } = usePrivy();
    const { toast } = useToast();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i) => {
        if (winner || board[i]) return;
        const newBoard = board.slice();
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setIsDraw(false);
    };

    const submitScore = useCallback(async () => {
        if (!user || winner !== 'X') return; // Only player X (the user) can submit a score
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    gameId: 'tictactoe',
                    score: 1, // Simple score for a win
                }),
            });
            if (response.ok) {
                toast({ title: "Score Submitted!", description: "Your win has been recorded." });
            } else {
                throw new Error('Failed to submit score');
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not submit score.", variant: "destructive" });
        }
    }, [user, winner, toast]);


    useEffect(() => {
        const aWinner = calculateWinner(board);
        if (aWinner) {
            setWinner(aWinner);
        } else if (!board.includes(null)) {
            setIsDraw(true);
        }
    }, [board]);

    useEffect(() => {
        if (winner) {
            submitScore();
        }
    }, [winner, submitScore]);


    const renderSquare = (i) => (
        <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-secondary text-4xl font-bold flex items-center justify-center rounded-md"
            onClick={() => handleClick(i)}
        >
            {board[i]}
        </motion.button>
    );

    let status;
    if (winner) {
        status = `Winner: ${winner}`;
    } else if (isDraw) {
        status = "It's a Draw!";
    } else {
        status = `Next player: ${isXNext ? 'X' : 'O'}`;
    }

    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">Tic-Tac-Toe</h2>
            <div className="text-xl mb-4">{status}</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {Array(9).fill(null).map((_, i) => renderSquare(i))}
            </div>
            {(winner || isDraw) && (
                <Button onClick={resetGame}>Play Again</Button>
            )}
        </div>
    );
};

export default TicTacToe;
