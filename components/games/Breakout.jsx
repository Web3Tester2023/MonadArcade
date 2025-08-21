import { useRef, useEffect, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

// Game Constants
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 10;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 7;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

const Breakout = () => {
    const canvasRef = useRef(null);
    const { user } = usePrivy();
    const { toast } = useToast();
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(true);
    const [gameWon, setGameWon] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game state refs
    const ball = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 3, dy: -3 });
    const paddleX = useRef((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
    const bricks = useRef([]);
    const rightPressed = useRef(false);
    const leftPressed = useRef(false);

    const resetBallAndPaddle = () => {
        ball.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 3, dy: -3 };
        paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    };

    const setupBricks = () => {
        const newBricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            newBricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                newBricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        bricks.current = newBricks;
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setGameOver(false);
        setGameWon(false);
        setGameStarted(true);
        setupBricks();
        resetBallAndPaddle();
    };

    const submitScore = useCallback(async () => {
        if (!user || score === 0) return;
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    gameId: 'breakout',
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

        const keyDownHandler = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed.current = true;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed.current = true;
        };

        const keyUpHandler = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed.current = false;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed.current = false;
        };
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        const collisionDetection = () => {
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                    const b = bricks.current[c][r];
                    if (b.status === 1) {
                        if (
                            ball.current.x > b.x && ball.current.x < b.x + BRICK_WIDTH &&
                            ball.current.y > b.y && ball.current.y < b.y + BRICK_HEIGHT
                        ) {
                            ball.current.dy = -ball.current.dy;
                            b.status = 0;
                            setScore(prev => prev + 10);
                            
                            if (score + 10 === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                                setGameWon(true);
                                setGameOver(true);
                            }
                        }
                    }
                }
            }
        };

        const drawBall = () => {
            ctx.beginPath();
            ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.closePath();
        };

        const drawPaddle = () => {
            ctx.beginPath();
            ctx.rect(paddleX.current, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        };

        const drawBricks = () => {
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                    if (bricks.current[c][r].status === 1) {
                        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                        bricks.current[c][r].x = brickX;
                        bricks.current[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                        ctx.fillStyle = '#0095DD';
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

            if (ball.current.x + ball.current.dx > CANVAS_WIDTH - BALL_RADIUS || ball.current.x + ball.current.dx < BALL_RADIUS) {
                ball.current.dx = -ball.current.dx;
            }
            if (ball.current.y + ball.current.dy < BALL_RADIUS) {
                ball.current.dy = -ball.current.dy;
            } else if (ball.current.y + ball.current.dy > CANVAS_HEIGHT - BALL_RADIUS) {
                if (ball.current.x > paddleX.current && ball.current.x < paddleX.current + PADDLE_WIDTH) {
                    ball.current.dy = -ball.current.dy;
                } else {
                    setLives(prev => prev - 1);
                    if (lives - 1 <= 0) {
                        setGameOver(true);
                    } else {
                        resetBallAndPaddle();
                    }
                }
            }

            if (rightPressed.current && paddleX.current < CANVAS_WIDTH - PADDLE_WIDTH) {
                paddleX.current += 7;
            } else if (leftPressed.current && paddleX.current > 0) {
                paddleX.current -= 7;
            }

            ball.current.x += ball.current.dx;
            ball.current.y += ball.current.dy;

            if (!gameOver) {
                animationFrameId = requestAnimationFrame(draw);
            }
        };

        if (gameStarted) {
            draw();
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        };
    }, [gameStarted, gameOver, lives]);

    useEffect(() => {
        if (gameOver && gameStarted) {
            submitScore();
        }
    }, [gameOver, gameStarted, submitScore]);

    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-2">Breakout</h2>
            <div className="flex gap-8 text-xl mb-4">
                <p>Score: {score}</p>
                <p>Lives: {lives}</p>
            </div>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="bg-background border-2 border-primary rounded-md"
            />
            <div className="mt-4">
                {gameOver && (
                    <div className="flex flex-col items-center">
                        {gameWon && <p className="text-2xl text-green-500 font-bold mb-4">YOU WIN!</p>}
                        {!gameWon && gameStarted && <p className="text-2xl text-destructive font-bold mb-4">GAME OVER!</p>}
                        <Button onClick={startGame}>
                            {gameStarted ? 'Play Again' : 'Start Game'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Breakout;
