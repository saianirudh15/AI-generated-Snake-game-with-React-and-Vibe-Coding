import React, { useEffect, useRef, useState } from 'react';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isGameOver: boolean;
  onGameOver: () => void;
  onGameStart: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

type Point = { x: number; y: number };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function SnakeGame({ onScoreChange, isGameOver, onGameOver, onGameStart }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Game state refs to avoid dependency issues in requestAnimationFrame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirectionRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 15, y: 5 });
  const lastMoveTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef<number>(0);
  const isGameOverRef = useRef(isGameOver);
  const hasStartedRef = useRef(hasStarted);

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  const generateFood = (currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: Math.random() * 20 + 10,
        color
      });
    }
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: -1 };
    nextDirectionRef.current = { x: 0, y: -1 };
    foodRef.current = generateFood(snakeRef.current);
    particlesRef.current = [];
    shakeRef.current = 0;
    setScore(0);
    onScoreChange(0);
    setHasStarted(true);
    onGameStart();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (isGameOverRef.current) return;
      
      if (!hasStartedRef.current && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setHasStarted(true);
        onGameStart();
      }

      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (dir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (dir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (dir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (dir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGameStart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastMoveTimeRef.current) lastMoveTimeRef.current = timestamp;

      // Update game logic
      if (hasStartedRef.current && !isGameOverRef.current) {
        const speed = Math.max(50, 150 - score * 2);
        if (timestamp - lastMoveTimeRef.current > speed) {
          directionRef.current = nextDirectionRef.current;
          const head = snakeRef.current[0];
          const newHead = {
            x: head.x + directionRef.current.x,
            y: head.y + directionRef.current.y,
          };

          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            shakeRef.current = 20;
            createParticles(head.x, head.y, '#0ff', 30);
            onGameOver();
          } 
          // Self collision
          else if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            shakeRef.current = 20;
            createParticles(head.x, head.y, '#0ff', 30);
            onGameOver();
          } else {
            const newSnake = [newHead, ...snakeRef.current];
            
            // Food collision
            if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
              const newScore = score + 10;
              setScore(newScore);
              onScoreChange(newScore);
              foodRef.current = generateFood(newSnake);
              createParticles(newHead.x, newHead.y, '#f0f', 15);
              shakeRef.current = 5;
            } else {
              newSnake.pop();
            }
            snakeRef.current = newSnake;
          }
          lastMoveTimeRef.current = timestamp;
        }
      }

      // Draw
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Apply shake
      ctx.save();
      if (shakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * shakeRef.current;
        const dy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(dx, dy);
        shakeRef.current *= 0.9;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      // Draw grid lines (glitchy)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw food
      ctx.fillStyle = '#f0f';
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 15;
      const pulse = Math.sin(timestamp / 150) * 2;
      ctx.fillRect(
        foodRef.current.x * CELL_SIZE + 2 - pulse/2, 
        foodRef.current.y * CELL_SIZE + 2 - pulse/2, 
        CELL_SIZE - 4 + pulse, 
        CELL_SIZE - 4 + pulse
      );

      // Draw snake
      snakeRef.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#fff' : '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = index === 0 ? 20 : 10;
        
        // Glitch effect on snake body
        const glitchOffset = (Math.random() > 0.95 && !isGameOverRef.current) ? (Math.random() - 0.5) * 4 : 0;
        
        ctx.fillRect(
          segment.x * CELL_SIZE + 1 + glitchOffset, 
          segment.y * CELL_SIZE + 1, 
          CELL_SIZE - 2, 
          CELL_SIZE - 2
        );
      });

      // Draw particles
      ctx.shadowBlur = 0;
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - (p.life / p.maxLife);
        ctx.fillRect(p.x, p.y, 3, 3);
        
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score, onScoreChange, onGameOver]);

  return (
    <div className="relative w-full max-w-[400px] aspect-square bg-[#050505] border-2 border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.3),inset_0_0_20px_rgba(255,0,255,0.2)] overflow-hidden animate-screen-tear">
      <div className="absolute inset-0 scanlines z-10 pointer-events-none" />
      <div className="absolute inset-0 static-noise z-10" />
      
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full h-full block"
      />

      {!hasStarted && !isGameOver && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
          <h2 className="text-4xl font-mono text-cyan-400 mb-4 glitch-text" data-text="SNAKE.EXE">SNAKE.EXE</h2>
          <p className="text-fuchsia-500 font-sans text-xl animate-pulse">AWAITING INPUT...</p>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20">
          <h2 className="text-5xl font-mono text-red-500 mb-2 glitch-text" data-text="FATAL ERROR">FATAL ERROR</h2>
          <p className="text-2xl mb-8 text-cyan-300 font-sans">SCORE: {score}</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-transparent border-2 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black transition-all font-mono text-sm uppercase tracking-widest shadow-[0_0_10px_rgba(255,0,255,0.5)]"
          >
            REBOOT
          </button>
        </div>
      )}
    </div>
  );
}
