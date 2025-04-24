import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import { 
  GRID_SIZE, 
  Direction, 
  KEY_MAPPINGS, 
  DIRECTION_VECTORS,
  INITIAL_GAME_SPEED,
  MIN_GAME_SPEED,
  SPEED_INCREASE_RATE
} from '../constants';

// Helper function to generate random position on the grid
const getRandomPosition = (): Vector3 => {
  const halfGrid = Math.floor(GRID_SIZE / 2);
  const x = Math.floor(Math.random() * GRID_SIZE) - halfGrid;
  const z = Math.floor(Math.random() * GRID_SIZE) - halfGrid;
  return new Vector3(x, 0, z);
};

// Helper function to check if two positions are the same
const isSamePosition = (pos1: Vector3, pos2: Vector3): boolean => {
  return pos1.x === pos2.x && pos1.z === pos2.z;
};

// Helper function to check if a position is in an array of positions
const isPositionInArray = (position: Vector3, positions: Vector3[]): boolean => {
  return positions.some(pos => isSamePosition(pos, position));
};

// Helper function to generate a food position that's not on the snake
const generateFoodPosition = (snakePositions: Vector3[]): Vector3 => {
  let newPosition: Vector3;
  do {
    newPosition = getRandomPosition();
  } while (isPositionInArray(newPosition, snakePositions));
  return newPosition;
};

export const useGameState = () => {
  // Initial snake position (center of the grid)
  const initialSnakeBody = [new Vector3(0, 0, 0)];
  
  // Game state
  const [snakeBody, setSnakeBody] = useState<Vector3[]>(initialSnakeBody);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(Direction.RIGHT);
  const [foodPosition, setFoodPosition] = useState<Vector3>(generateFoodPosition(initialSnakeBody));
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(INITIAL_GAME_SPEED);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  // Refs for game loop
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDirectionUpdateRef = useRef<Direction>(Direction.RIGHT);

  // Reset game to initial state
  const resetGame = useCallback(() => {
    // Clear any existing timers
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    const initialSnake = [new Vector3(0, 0, 0)];
    setSnakeBody(initialSnake);
    setDirection(Direction.RIGHT);
    setNextDirection(Direction.RIGHT);
    setFoodPosition(generateFoodPosition(initialSnake));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setGameSpeed(INITIAL_GAME_SPEED);
    setIsGameActive(false);
    setCountdown(0);
    lastDirectionUpdateRef.current = Direction.RIGHT;
  }, []);

  // Start game with countdown
  const startGame = useCallback(() => {
    if (isGameActive || gameOver) return;
    
    // Set countdown to 3
    setCountdown(3);
    
    // Start countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, clear timer and start game
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setIsGameActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isGameActive, gameOver]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    if (gameOver || !isGameActive || countdown > 0) return;
    setIsPaused(prev => !prev);
  }, [gameOver, isGameActive, countdown]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const key = event.key;
    
    // Handle pause with spacebar (only if game is active)
    if (key === ' ' && isGameActive && countdown === 0) {
      togglePause();
      return;
    }
    
    // Handle restart with 'r'
    if (key === 'r') {
      resetGame();
      return;
    }
    
    // Only process direction changes if game is active and not paused
    if (!isGameActive || isPaused || countdown > 0) return;
    
    // Handle direction changes
    if (key in KEY_MAPPINGS) {
      const newDirection = KEY_MAPPINGS[key as keyof typeof KEY_MAPPINGS];
      
      // Prevent 180-degree turns
      const currentDir = lastDirectionUpdateRef.current;
      if (
        (currentDir === Direction.UP && newDirection === Direction.DOWN) ||
        (currentDir === Direction.DOWN && newDirection === Direction.UP) ||
        (currentDir === Direction.LEFT && newDirection === Direction.RIGHT) ||
        (currentDir === Direction.RIGHT && newDirection === Direction.LEFT)
      ) {
        return;
      }
      
      setNextDirection(newDirection);
    }
  }, [resetGame, togglePause, isGameActive, isPaused, countdown]);

  // Check if the snake has collided with itself or the wall
  const checkCollision = useCallback((head: Vector3): boolean => {
    const halfGrid = Math.floor(GRID_SIZE / 2);
    
    // Check wall collision
    if (
      head.x < -halfGrid || 
      head.x >= halfGrid || 
      head.z < -halfGrid || 
      head.z >= halfGrid
    ) {
      return true;
    }
    
    // Check self collision (skip the last segment as it will be removed)
    for (let i = 0; i < snakeBody.length - 1; i++) {
      if (isSamePosition(head, snakeBody[i])) {
        return true;
      }
    }
    
    return false;
  }, [snakeBody]);

  // Move the snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !isGameActive || countdown > 0) return;
    
    // Update current direction
    setDirection(nextDirection);
    lastDirectionUpdateRef.current = nextDirection;
    
    // Calculate new head position
    const dirVector = DIRECTION_VECTORS[nextDirection];
    const head = snakeBody[0];
    const newHead = new Vector3(
      head.x + dirVector.x,
      head.y + dirVector.y,
      head.z + dirVector.z
    );
    
    // Check for collision
    if (checkCollision(newHead)) {
      setGameOver(true);
      setIsGameActive(false);
      return;
    }
    
    // Check if food is eaten
    const foodEaten = isSamePosition(newHead, foodPosition);
    
    // Create new snake body
    const newBody = [newHead, ...snakeBody];
    
    // If food not eaten, remove tail
    if (!foodEaten) {
      newBody.pop();
    } else {
      // Food eaten, increase score and generate new food
      setScore(prev => prev + 1);
      setFoodPosition(generateFoodPosition(newBody));
      
      // Increase game speed
      setGameSpeed(prev => Math.max(MIN_GAME_SPEED, prev - SPEED_INCREASE_RATE));
    }
    
    // Update snake body
    setSnakeBody(newBody);
  }, [
    checkCollision, 
    foodPosition, 
    gameOver, 
    isPaused, 
    nextDirection, 
    snakeBody,
    isGameActive,
    countdown
  ]);

  // Game loop
  useEffect(() => {
    // Clear any existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Start new game loop if game is active, not over, and not paused
    if (isGameActive && !gameOver && !isPaused && countdown === 0) {
      gameLoopRef.current = setInterval(moveSnake, gameSpeed);
    }
    
    // Cleanup on unmount
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameOver, isPaused, moveSnake, gameSpeed, isGameActive, countdown]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  return {
    snakeBody,
    foodPosition,
    direction,
    score,
    gameOver,
    isPaused,
    isGameActive,
    countdown,
    handleKeyDown,
    resetGame,
    togglePause,
    startGame
  };
};
