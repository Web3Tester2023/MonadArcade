import { useRef, useEffect, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Breakout = () => {
    const canvasRef = useRef(null);
    const { user } = usePrivy();
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

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let rightPressed = false;
        let leftPressed = false;

        const ball = {
            x: canvas.width / 2,
            y: canvas.height - 30,
            dx: 2,
            dy: -2,
            radius: 10,
        };

        const paddle = {
            height: 10,
            width: 75,
            x: (canvas.width - 75) / 2,
        };

        const bricks = [];
        const brickRowCount = 3;
        const brickColumnCount = 5;
        const brickWidth = 75;
        const brickHeight = 20;
        const brickPadding = 10;
        const brickOffsetTop = 30;
        const brickOffsetLeft = 30;

        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        const keyDownHandler = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = true;
            }
        };

        const keyUpHandler = (e) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                rightPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                leftPressed = false;
            }
        };

        document.addEventListener('keydown', keyDownHandler, false);
        document.addEventListener('keyup', keyUpHandler, false);

        const collisionDetection = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const b = bricks[c][r];
                    if (b.status === 1) {
                        if (
                            ball.x > b.x &&
                            ball.x < b.x + brickWidth &&
                            ball.y > b.y &&
                            ball.y < b.y + brickHeight
                        ) {
                            ball.dy = -ball.dy;
                            b.status = 0;
                            setScore((prevScore) => prevScore + 1);
                        }
                    }
                }
            }
        };

        const drawBall = () => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        };

        const drawPaddle = () => {
            ctx.beginPath();
            ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        };

        const drawBricks = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        ctx.fillStyle = '#0095DD';
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

            if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
                ball.dx = -ball.dx;
            }

            if (ball.y + ball.dy < ball.radius) {
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > canvas.height - ball.radius) {
                if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                    ball.dy = -ball.dy;
                } else {
                    setGameOver(true);
                    return;
                }
            }

            if (rightPressed && paddle.x < canvas.width - paddle.width) {
                paddle.x += 7;
            } else if (leftPressed && paddle.x > 0) {
                paddle.x -= 7;
            }

            ball.x += ball.dx;
            ball.y += ball.dy;

            if (!gameOver) {
                requestAnimationFrame(draw);
            }
        };

        draw();

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        };
    }, [gameOver, submitScore]);

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold">Breakout</h2>
            <p>Score: {score}</p>
            <canvas ref={canvasRef} width="480" height="320" className="bg-gray-700 rounded-lg" />
            {gameOver && <p className="text-2xl mt-4">Game Over!</p>}
        </div>
    );
};

export default Breakout;
