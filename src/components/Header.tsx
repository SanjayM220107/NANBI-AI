import React from 'react';
import { UserProfile } from '../data/schemes';
import { Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile;
  language: 'ta' | 'en';
  onLanguageChange: (lang: 'ta' | 'en') => void;
  textSize: 'sm' | 'base' | 'lg';
  onTextSizeChange: (size: 'sm' | 'base' | 'lg') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  voiceAutoplay: boolean;
  onToggleVoiceAutoplay: () => void;
  onEditProfile: () => void;
  onOpenLiveVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  language,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  highContrast,
  onToggleHighContrast,
  voiceAutoplay,
  onToggleVoiceAutoplay,
  onEditProfile,
  onOpenLiveVoice,
}) => {
  const isTamil = language === 'ta';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:px-6">
        {/* Top row: Brand & Language/Accessibility quick controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-xl shadow-xs ring-2 ring-rose-200">
              🌸
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold tracking-tight text-xl text-rose-700">
                  NANBI
                </span>
                <span className="font-semibold text-base text-rose-600">
                  நண்பி
                </span>
              </div>
              <p className="text-xs text-stone-700 font-medium leading-none">
                {isTamil ? 'உங்கள் அரசு தோழி' : 'Your Government Companion'}
              </p>
            </div>
          </div>

          {/* Accessibility & Language actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Text Size Scale */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs">
              <button
                onClick={() => onTextSizeChange('sm')}
                className={`px-1.5 py-1 rounded font-medium transition-all ${
                  textSize === 'sm'
                    ? 'bg-white text-rose-700 shadow-2xs font-bold'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Small text"
                aria-label="Decrease text size"
              >
                A-
              </button>
              <button
                onClick={() => onTextSizeChange('base')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  textSize === 'base'
                    ? 'bg-white text-rose-700 shadow-2xs font-bold'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Default text"
                aria-label="Default text size"
              >
                A
              </button>
              <button
                onClick={() => onTextSizeChange('lg')}
                className={`px-1.5 py-1 rounded font-medium transition-all ${
                  textSize === 'lg'
                    ? 'bg-white text-rose-700 shadow-2xs font-bold'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Large text"
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            {/* High Contrast Mode */}
            <button
              onClick={onToggleHighContrast}
              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                highContrast
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title={isTamil ? 'அதிக மாறுபட்ட திரை' : 'High Contrast'}
              aria-label="Toggle high contrast"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Voice Mode */}
            <button
              onClick={onToggleVoiceAutoplay}
              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                voiceAutoplay
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title={isTamil ? 'குரல் பயன்முறை' : 'Voice Mode'}
              aria-label="Toggle voice mode"
            >
              {voiceAutoplay ? (
                <Volume2 className="w-4 h-4 text-rose-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-700" />
              )}
            </button>

            {/* Live Voice Call Button */}
            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-900 border border-amber-500/30 transition-colors shadow-xs flex items-center gap-1.5"
                title={isTamil ? 'நேரலை குரல் உரையாடல் (Gemini 3.8 Live)' : 'Live Voice Call (Gemini 3.8 Live)'}
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span className="hidden sm:inline">{isTamil ? 'நேரலை குரல்' : 'Live Voice'}</span>
                <span className="sm:hidden">🎙️</span>
              </button>
            )}

            {/* Language Switcher Button */}
            <button
              onClick={() => onLanguageChange(isTamil ? 'en' : 'ta')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-rose-500" />
              {isTamil ? 'English' : 'தமிழ்'}
            </button>
          </div>
        </div>

        {/* User profile banner if user is logged in */}
        {userProfile.name && (
          <div className="mt-2 pt-2 border-t border-rose-50 flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-stone-900">
                {isTamil
                  ? `வணக்கம், ${userProfile.name} 👋`
                  : `Hello, ${userProfile.name} 👋`}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-700 truncate">
                📍 {userProfile.state}
                {userProfile.district ? ` • ${userProfile.district}` : ''}
              </span>
            </div>
            <button
              onClick={onEditProfile}
              className="text-rose-600 hover:text-rose-800 font-semibold underline underline-offset-2 shrink-0 ml-2"
            >
              {isTamil ? 'மாற்ற' : 'Edit'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
