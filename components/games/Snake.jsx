import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

// Game constants
const CANVAS_SIZE = [400, 400];
const SNAKE_START = [
  [8, 7],
  [8, 8]
];
const FOOD_START = [8, 3];
const SCALE = 20;
const SPEED = 100;

const Snake = () => {
    const canvasRef = useRef(null);
    const { user } = usePrivy();
    const { toast } = useToast();

    const [snake, setSnake] = useState(SNAKE_START);
    const [food, setFood] = useState(FOOD_START);
    const [dir, setDir] = useState([0, -1]);
    const [speed, setSpeed] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const startGame = () => {
        setSnake(SNAKE_START);
        setFood(FOOD_START);
        setDir([0, -1]);
        setSpeed(SPEED);
        setGameOver(false);
        setScore(0);
    };

    const endGame = () => {
        setSpeed(null);
        setGameOver(true);
    };

    const createFood = () =>
        food.map((_c, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

    const moveSnake = ({ keyCode }) => {
        // Prevent snake from reversing
        if (keyCode >= 37 && keyCode <= 40) {
            switch (keyCode) {
                case 38: // up
                    if (dir[1] !== 1) setDir([0, -1]);
                    break;
                case 40: // down
                    if (dir[1] !== -1) setDir([0, 1]);
                    break;
                case 37: // left
                    if (dir[0] !== 1) setDir([-1, 0]);
                    break;
                case 39: // right
                    if (dir[0] !== -1) setDir([1, 0]);
                    break;
                default:
                    break;
            }
        }
    };

    const checkCollision = (piece, snk = snake) => {
        // Wall collision
        if (
            piece[0] * SCALE >= CANVAS_SIZE[0] ||
            piece[0] < 0 ||
            piece[1] * SCALE >= CANVAS_SIZE[1] ||
            piece[1] < 0
        )
            return true;

        // Snake body collision
        for (const segment of snk) {
            if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
        }
        return false;
    };

    const checkFoodCollision = newSnake => {
        if (newSnake[0][0] === food[0] && newSnake[0][1] === food[1]) {
            let newFood = createFood();
            while (checkCollision(newFood, newSnake)) {
                newFood = createFood();
            }
            setFood(newFood);
            setScore(prev => prev + 10);
            return true;
        }
        return false;
    };

    const gameLoop = () => {
        const snakeCopy = JSON.parse(JSON.stringify(snake));
        const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
        snakeCopy.unshift(newSnakeHead);
        if (checkCollision(newSnakeHead)) {
            endGame();
            return;
        }
        if (!checkFoodCollision(snakeCopy)) {
            snakeCopy.pop();
        }
        setSnake(snakeCopy);
    };

    const submitScore = useCallback(async () => {
        if (!user || score === 0) return;
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    gameId: 'snake',
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
        const context = canvasRef.current.getContext("2d");
        context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.fillStyle = "green";
        snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
        context.fillStyle = "red";
        context.fillRect(food[0], food[1], 1, 1);
    }, [snake, food, gameOver]);

    useEffect(() => {
        window.addEventListener("keydown", moveSnake);
        return () => window.removeEventListener("keydown", moveSnake);
    }, [dir]);

    useEffect(() => {
        if (speed !== null) {
            const interval = setInterval(gameLoop, speed);
            return () => clearInterval(interval);
        }
    }, [snake, speed]);

    useEffect(() => {
        if (gameOver) {
            submitScore();
        }
    }, [gameOver, submitScore]);


    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">Snake</h2>
            <p className="text-xl mb-4">Score: {score}</p>
            <canvas
                ref={canvasRef}
                width={`${CANVAS_SIZE[0]}px`}
                height={`${CANVAS_SIZE[1]}px`}
                className="bg-background border-2 border-primary rounded-md"
            />
            <div className="mt-4">
                {gameOver && <p className="text-2xl text-destructive font-bold mb-4">GAME OVER!</p>}
                <Button onClick={startGame}>
                    {gameOver ? 'Play Again' : 'Start Game'}
                </Button>
            </div>
        </div>
    );
};

export default Snake;
