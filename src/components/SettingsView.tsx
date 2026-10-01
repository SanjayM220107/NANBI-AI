import React from 'react';
import { UserProfile } from '../data/schemes';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  ShieldCheck,
  User,
  Heart,
  Globe,
  HelpCircle,
} from 'lucide-react';

interface SettingsViewProps {
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
  onResetProfile: () => void;
  onLoadDemoUser: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
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
  onResetProfile,
  onLoadDemoUser,
}) => {
  const isTamil = language === 'ta';

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-6">
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
          ⚙️
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            {isTamil ? 'அமைப்புகள் & சுயவிவரம்' : 'Settings & Profile'}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {isTamil
              ? 'மொழி, அணுகல் வசதிகள் மற்றும் உங்கள் விவரங்களை நிர்வகிக்கலாம்'
              : 'Manage language, accessibility, and profile preferences'}
          </p>
        </div>
      </div>

      {/* Demo Mode Action Box */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-5 border-2 border-rose-200 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-600" />
          <h3 className="font-extrabold text-stone-900 text-base">
            {isTamil ? 'ஹேக்கத்தான் மாதிரி பயனர் (Demo Mode)' : 'Hackathon Demo Mode'}
          </h3>
        </div>
        <p className="text-xs text-stone-700 leading-relaxed">
          {isTamil
            ? 'சோதனைக்காக முன்மாதிரி சுயவிவரத்தை உடனடியாக ஏற்றலாம் (காவ்யா, 26–40 வயது, செங்கல்பட்டு, தமிழ்நாடு).'
            : 'Instantly load the predefined demonstration persona (Kavya, 26–40 years, Chengalpattu, Tamil Nadu).'}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={onLoadDemoUser}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isTamil ? 'டெமோ பயனர் ஏற்று (Load Demo)' : 'Load Demo User'}</span>
          </button>
          <button
            onClick={onResetProfile}
            className="py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isTamil ? 'சுயவிவரத்தை மீட்டமை' : 'Reset Profile'}</span>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-base">
              {isTamil ? 'உங்கள் சுயவிவரம்' : 'Your Profile'}
            </h3>
          </div>
          <button
            onClick={onEditProfile}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 underline underline-offset-2"
          >
            {isTamil ? 'திருத்த (Edit)' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <div>
            <span className="text-stone-500 block font-medium">
              {isTamil ? 'பெயர்' : 'Name'}
            </span>
            <span className="font-bold text-stone-900 text-sm">
              {userProfile.name || 'Friend'}
            </span>
          </div>

          <div>
            <span className="text-stone-500 block font-medium">
              {isTamil ? 'வயது பிரிவு' : 'Age Group'}
            </span>
            <span className="font-bold text-stone-900 text-sm">
              {userProfile.ageGroup} {isTamil ? 'வயது' : 'Years'}
            </span>
          </div>

          <div>
            <span className="text-stone-500 block font-medium">
              {isTamil ? 'மாநிலம்' : 'State'}
            </span>
            <span className="font-bold text-stone-900 text-sm">
              {userProfile.state}
            </span>
          </div>

          <div>
            <span className="text-stone-500 block font-medium">
              {isTamil ? 'மாவட்டம்' : 'District'}
            </span>
            <span className="font-bold text-stone-900 text-sm">
              {userProfile.district}
            </span>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-stone-900 text-base">
            {isTamil ? 'மொழி தேர்வு' : 'Language'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onLanguageChange('ta')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              language === 'ta'
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-2 ring-rose-200'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>தமிழ் (Tamil)</span>
          </button>

          <button
            onClick={() => onLanguageChange('en')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              language === 'en'
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-2 ring-rose-200'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Accessibility Preferences */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-base">
          {isTamil ? 'அணுகல் வசதிகள் (Accessibility)' : 'Accessibility Settings'}
        </h3>

        {/* Text Size Scale */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
          <div>
            <span className="font-bold text-stone-800 block">
              {isTamil ? 'எழுத்து அளவு' : 'Text Size'}
            </span>
            <span className="text-stone-500">
              {isTamil ? 'வாசிப்பை எளிதாக்க அளவை மாற்றவும்' : 'Adjust font scale for easy reading'}
            </span>
          </div>

          <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200 font-bold">
            <button
              onClick={() => onTextSizeChange('sm')}
              className={`px-3 py-1.5 rounded-lg ${
                textSize === 'sm' ? 'bg-white text-rose-700 shadow-2xs' : 'text-stone-600'
              }`}
            >
              A-
            </button>
            <button
              onClick={() => onTextSizeChange('base')}
              className={`px-3 py-1.5 rounded-lg ${
                textSize === 'base' ? 'bg-white text-rose-700 shadow-2xs' : 'text-stone-600'
              }`}
            >
              A
            </button>
            <button
              onClick={() => onTextSizeChange('lg')}
              className={`px-3 py-1.5 rounded-lg ${
                textSize === 'lg' ? 'bg-white text-rose-700 shadow-2xs' : 'text-stone-600'
              }`}
            >
              A+
            </button>
          </div>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
          <div>
            <span className="font-bold text-stone-800 block">
              {isTamil ? 'அதிக மாறுபட்ட திரை (High Contrast)' : 'High Contrast Mode'}
            </span>
            <span className="text-stone-500">
              {isTamil ? 'தெளிவான எழுத்து மாறுபாடு' : 'Sharpen contrasts for better visibility'}
            </span>
          </div>

          <button
            onClick={onToggleHighContrast}
            className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
              highContrast
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-100 text-stone-700 border-stone-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{highContrast ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Voice Mode */}
        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <span className="font-bold text-stone-800 block">
              {isTamil ? 'குரல் பயன்முறை (Voice Mode)' : 'Voice Mode'}
            </span>
            <span className="text-stone-500">
              {isTamil ? 'தானியங்கி குரல் வாசிப்பு' : 'Speech synthesis and audio assistance'}
            </span>
          </div>

          <button
            onClick={onToggleVoiceAutoplay}
            className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
              voiceAutoplay
                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400'
                : 'bg-stone-100 text-stone-700 border-stone-300'
            }`}
          >
            {voiceAutoplay ? (
              <Volume2 className="w-4 h-4 text-rose-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
            <span>{voiceAutoplay ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Safety & Privacy Notice */}
      <div className="bg-rose-50 rounded-3xl p-5 border border-rose-200 text-xs text-rose-950 space-y-2">
        <div className="flex items-center gap-2 font-extrabold text-rose-900">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>{isTamil ? 'பாதுகாப்பு & தனிஉரிமை' : 'Safety & Privacy Guarantee'}</span>
        </div>
        <p className="leading-relaxed">
          {isTamil
            ? 'நண்பி உங்கள் OTP, கடவுச்சொல் (password), ATM PIN, அல்லது வங்கி ரகசிய எண்களை ஒருபோதும் கேட்காது. எந்தவொரு இணையதளத்திலும் பணப் பரிவர்த்தனை ரகசியங்களை பகிர வேண்டாம்.'
            : 'NANBI never requests your OTP, passwords, bank PIN, or private credentials. Never share banking secrets on any portal.'}
        </p>
      </div>

      {/* Official Disclaimer */}
      <div className="bg-stone-100 rounded-3xl p-5 border border-stone-200 text-[11px] text-stone-600 space-y-2">
        <span className="font-bold text-stone-800 block uppercase tracking-wider">
          {isTamil ? 'அதிகாரப்பூர்வ மறுப்புரை (Disclaimer):' : 'Official Disclaimer:'}
        </span>
        <p className="leading-relaxed">
          {isTamil
            ? 'நண்பி அரசு திட்டங்களைப் புரிந்துகொள்ளவும் விண்ணப்ப செயல்முறையை வழிகாட்டவும் உதவுகிறது. இறுதி தகுதி மற்றும் திட்ட விவரங்களுக்கு அதிகாரப்பூர்வ அரசு இணையதளத்தை சரிபார்க்கவும்.'
            : 'NANBI helps users understand government schemes and application procedures. Final eligibility and scheme details should be verified on the official government website.'}
        </p>
      </div>
    </div>
  );
};
