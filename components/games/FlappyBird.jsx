import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

// Game constants
const CANVAS_WIDTH = 288;
const CANVAS_HEIGHT = 512;
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const PIPE_WIDTH = 52;
const GAP = 100; // Gap between pipes
const GRAVITY = 0.3;
const LIFT = -6;

const FlappyBird = () => {
    const canvasRef = useRef(null);
    const { user } = usePrivy();
    const { toast } = useToast();
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);

    // Game state refs
    const birdY = useRef(CANVAS_HEIGHT / 2);
    const birdVelocity = useRef(0);
    const pipes = useRef([]);
    const frameCount = useRef(0);

    const startGame = () => {
        birdY.current = CANVAS_HEIGHT / 2;
        birdVelocity.current = 0;
        pipes.current = [];
        frameCount.current = 0;
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
    };

    const flap = () => {
        if (!gameOver) {
            birdVelocity.current = LIFT;
        }
    };

    const submitScore = useCallback(async () => {
        if (!user || score === 0) return;
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    gameId: 'flappy',
                    score,
                }),
            });
            if (response.ok) {
                toast({ title: "Score Submitted!", description: `Your score of ${score} was saved.` });
            } else {
                throw new Error('Failed to submit score');
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not submit score.", variant: "destructive" });
        }
    }, [score, user, toast]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const draw = () => {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw bird
            ctx.fillStyle = 'yellow';
            ctx.fillRect(50, birdY.current, BIRD_WIDTH, BIRD_HEIGHT);

            // Bird physics
            if (gameStarted && !gameOver) {
                birdVelocity.current += GRAVITY;
                birdY.current += birdVelocity.current;

                // Ground and ceiling collision
                if (birdY.current + BIRD_HEIGHT > CANVAS_HEIGHT || birdY.current < 0) {
                    setGameOver(true);
                }
            }

            // Pipe logic
            if (gameStarted && !gameOver) {
                if (frameCount.current % 90 === 0) {
                    const pipeY = Math.floor(Math.random() * (CANVAS_HEIGHT - GAP - 150)) + 75;
                    pipes.current.push({ x: CANVAS_WIDTH, y: pipeY, passed: false });
                }

                for (let i = pipes.current.length - 1; i >= 0; i--) {
                    const p = pipes.current[i];
                    p.x -= 2;

                    // Draw pipes
                    ctx.fillStyle = 'green';
                    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.y);
                    ctx.fillRect(p.x, p.y + GAP, PIPE_WIDTH, CANVAS_HEIGHT - p.y - GAP);

                    // Pipe collision
                    if (
                        50 + BIRD_WIDTH > p.x && 50 < p.x + PIPE_WIDTH &&
                        (birdY.current < p.y || birdY.current + BIRD_HEIGHT > p.y + GAP)
                    ) {
                        setGameOver(true);
                    }
                    
                    // Score
                    if (p.x + PIPE_WIDTH < 50 && !p.passed) {
                        setScore(prev => prev + 1);
                        p.passed = true;
                    }

                    // Remove off-screen pipes
                    if (p.x + PIPE_WIDTH < 0) {
                        pipes.current.splice(i, 1);
                    }
                }
                frameCount.current++;
            }
            
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleKeyPress = (e) => {
            if (e.code === 'Space' || e.type === 'mousedown') {
                 e.preventDefault();
                if (gameOver) {
                    // This allows starting and restarting the game
                } else {
                    flap();
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        canvas.addEventListener('mousedown', handleKeyPress);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyPress);
            canvas.removeEventListener('mousedown', handleKeyPress);
        };
    }, [gameStarted, gameOver]);

    useEffect(() => {
        if (gameOver && gameStarted) {
            submitScore();
        }
    }, [gameOver, gameStarted, submitScore]);


    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">Flappy Bird</h2>
            <p className="text-xl mb-4">Score: {score}</p>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVEY_HEIGHT}
                className="bg-sky-300 border-2 border-primary rounded-md cursor-pointer"
            />
            <div className="mt-4">
                {gameOver && (
                     <Button onClick={startGame}>
                        {gameStarted ? 'Play Again' : 'Start Game'}
                    </Button>
                )}
                 {!gameStarted && <p className="text-muted-foreground mt-2">Press Space or Click to Start</p>}
                 {gameStarted && !gameOver && <p className="text-muted-foreground mt-2">Press Space or Click to Flap</p>}
            </div>
        </div>
    );
};

export default FlappyBird;
