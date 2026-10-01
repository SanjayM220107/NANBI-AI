import React, { useEffect, useState } from 'react';
import { voiceService } from '../services/voice';
import { Square, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';

interface VoiceFloatingBarProps {
  language: 'ta' | 'en';
}

export const VoiceFloatingBar: React.FC<VoiceFloatingBarProps> = ({ language }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isTamil = language === 'ta';

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) {
        setIsPaused(false);
      }
    });
    return unsubscribe;
  }, []);

  if (!isSpeaking && !isPaused) return null;

  const handlePauseResume = () => {
    if (isPaused) {
      voiceService.resume();
      setIsPaused(false);
    } else {
      voiceService.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    voiceService.stop();
    setIsPaused(false);
  };

  const handleReplay = () => {
    voiceService.replay();
    setIsPaused(false);
  };

  return (
    <aside 
      aria-label={isTamil ? 'குரல் வழிகாட்டுதல்' : 'Voice guidance'}
      className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-stone-700 p-3.5 flex items-center justify-between gap-3 animate-fade-in transition-all"
    >
      <div className="flex items-center gap-3 truncate">
        {/* Animated Soundwave */}
        <div className="flex items-center gap-1 h-6 w-7 justify-center shrink-0">
          <span className="w-1 bg-rose-400 rounded-full animate-bar-1" />
          <span className="w-1 bg-rose-300 rounded-full animate-bar-2" />
          <span className="w-1 bg-rose-400 rounded-full animate-bar-3" />
          <span className="w-1 bg-rose-500 rounded-full animate-bar-4" />
        </div>

        <div className="truncate">
          <p className="text-xs font-bold text-rose-300 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            {isTamil ? 'நண்பி பேசுகிறார்...' : 'NANBI is speaking...'}
          </p>
          <p className="text-xs text-stone-300 truncate">
            {isTamil ? 'கேளுங்கள் அல்லது நிறுத்தவும்' : 'Listen or stop playback'}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handlePauseResume}
          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          title={isPaused ? (isTamil ? 'தொடர்க' : 'Resume') : (isTamil ? 'இடைநிறுத்து' : 'Pause')}
          aria-label={isPaused ? 'Resume speech' : 'Pause speech'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>

        <button
          onClick={handleReplay}
          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          title={isTamil ? 'மீண்டும் கேட்க' : 'Replay'}
          aria-label="Replay speech"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleStop}
          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
          title={isTamil ? 'நிறுத்து' : 'Stop'}
          aria-label="Stop speech"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>
    </aside>
  );
};
