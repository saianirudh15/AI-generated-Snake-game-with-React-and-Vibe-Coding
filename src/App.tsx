/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Terminal } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-fuchsia-500/50 overflow-hidden relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff10_1px,transparent_1px),linear-gradient(to_bottom,#00ffff10_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 scanlines pointer-events-none z-0" />
      <div className="absolute inset-0 static-noise pointer-events-none z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b-4 border-fuchsia-500 pb-4">
          <div className="flex items-center gap-4">
            <Terminal className="text-cyan-400 animate-pulse" size={40} />
            <h1 className="text-3xl md:text-5xl font-mono tracking-tighter uppercase text-white glitch-text" data-text="NEON_SNAKE">
              NEON_SNAKE
            </h1>
          </div>
          
          <div className="flex flex-col items-end border-r-4 border-cyan-400 pr-4">
            <span className="text-fuchsia-500 font-sans text-xs uppercase tracking-widest">SCORE_REGISTER</span>
            <span className="text-3xl font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Game Area */}
          <div className="flex-1 w-full flex justify-center items-center relative">
            <div className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-full animate-pulse" />
            <SnakeGame 
              onScoreChange={setScore} 
              isGameOver={isGameOver} 
              onGameOver={() => setIsGameOver(true)}
              onGameStart={() => setIsGameOver(false)}
            />
          </div>

          {/* Player Area */}
          <div className="w-full lg:w-auto flex justify-center items-center">
            <MusicPlayer autoPlay={false} />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-cyan-500/30 text-center">
          <p className="font-mono text-xs text-cyan-400/50 uppercase tracking-widest">
            SYS.VERSION 1.0.4 // UNAUTHORIZED ACCESS DETECTED
          </p>
        </footer>
      </div>
    </div>
  );
}
