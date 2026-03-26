import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'SYS_OVERRIDE',
    artist: 'AI_GEN_ALPHA',
    url: 'https://actions.google.com/sounds/v1/science_fiction/cybernetic_rhythm.ogg',
    cover: 'https://picsum.photos/seed/cyber/400/400?blur=2'
  },
  {
    id: '2',
    title: 'VOID_AMBIENCE',
    artist: 'NEURAL_NET_BETA',
    url: 'https://actions.google.com/sounds/v1/science_fiction/space_ambience.ogg',
    cover: 'https://picsum.photos/seed/space/400/400?blur=2'
  },
  {
    id: '3',
    title: 'DRONE_PROTOCOL',
    artist: 'DEEPMIND_GAMMA',
    url: 'https://actions.google.com/sounds/v1/science_fiction/sci_fi_drone.ogg',
    cover: 'https://picsum.photos/seed/drone/400/400?blur=2'
  }
];

interface MusicPlayerProps {
  autoPlay?: boolean;
}

export default function MusicPlayer({ autoPlay = false }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  return (
    <div className="w-full max-w-sm bg-black border-2 border-fuchsia-500 p-6 shadow-[8px_8px_0px_rgba(255,0,255,0.5)] relative overflow-hidden">
      <div className="absolute inset-0 scanlines pointer-events-none z-10" />
      <div className="absolute inset-0 static-noise z-10" />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        loop={false}
      />
      
      <div className="flex flex-col items-center relative z-20">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 border-b-2 border-cyan-500 pb-2">
          <span className="text-cyan-400 font-mono text-xs uppercase animate-pulse">AUDIO_SUBSYSTEM</span>
          <span className="text-fuchsia-500 font-mono text-xs">STATUS: {isPlaying ? 'ACTIVE' : 'IDLE'}</span>
        </div>

        {/* Cover Art */}
        <div className="relative w-48 h-48 mb-6 border-4 border-cyan-500 overflow-hidden group">
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            className={`w-full h-full object-cover filter contrast-150 saturate-200 hue-rotate-90 ${isPlaying ? 'animate-screen-tear' : 'grayscale'}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-fuchsia-500/20 mix-blend-overlay" />
          
          {/* Glitch overlay on hover */}
          <div className="absolute inset-0 bg-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-color-burn" />
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 w-full">
          <h3 className="text-xl font-mono text-white tracking-widest uppercase truncate glitch-text" data-text={currentTrack.title}>
            {currentTrack.title}
          </h3>
          <p className="text-sm text-cyan-400 font-sans mt-2 uppercase tracking-widest">
            &gt; {currentTrack.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-neutral-900 border border-fuchsia-500 mb-6 relative">
          <div 
            className="h-full bg-cyan-400 transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:4px_100%]" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full px-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-fuchsia-500 hover:text-cyan-400 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrev}
              className="text-cyan-400 hover:text-fuchsia-500 transition-colors"
            >
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[4px_4px_0px_rgba(0,255,255,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
            </button>
            
            <button 
              onClick={handleNext}
              className="text-cyan-400 hover:text-fuchsia-500 transition-colors"
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
