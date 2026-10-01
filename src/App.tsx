/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  SCHEMES,
  Scheme,
  SchemeCategory,
  CATEGORIES_CONFIG,
} from './data/schemes';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { Onboarding } from './components/Onboarding';
import { SchemeCard } from './components/SchemeCard';
import { SchemeDetailModal } from './components/SchemeDetailModal';
import { EligibilityCheckerModal } from './components/EligibilityCheckerModal';
import { AskNanbiView } from './components/AskNanbiView';
import { DocumentsView } from './components/DocumentsView';
import { SettingsView } from './components/SettingsView';
import { VoiceFloatingBar } from './components/VoiceFloatingBar';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import {
  voiceService,
  createSpeechRecognizer,
  requestMicrophonePermission,
  getMicrophonePermissionState,
} from './services/voice';
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Volume2,
} from 'lucide-react';

const STORAGE_KEY_PROFILE = 'nanbi_user_profile_v1';
const STORAGE_KEY_SETTINGS = 'nanbi_settings_v1';

export default function App() {
  // Persistent Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved profile:', e);
    }
    return {
      name: '',
      ageGroup: '26–40',
      state: 'Tamil Nadu',
      district: 'Chengalpattu',
      language: 'ta',
    };
  });

  const [isOnboarding, setIsOnboarding] = useState<boolean>(() => {
    // If name is set, skip onboarding by default
    return !userProfile.name;
  });

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<Scheme | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'details' | 'documents' | 'steps'>('details');
  const [eligibilityScheme, setEligibilityScheme] = useState<Scheme | null>(null);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);

  // Accessibility State
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceAutoplay, setVoiceAutoplay] = useState<boolean>(false);

  // Voice hero state on Home
  const [isHomeMicActive, setIsHomeMicActive] = useState<boolean>(false);
  const [homeRecognizedText, setHomeRecognizedText] = useState<string>('');
  const homeRecognizerRef = React.useRef<any>(null);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }, [userProfile]);

  // Sync accessibility classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg');
    root.classList.add(`text-size-${textSize}`);

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [textSize, highContrast]);

  const isTamil = userProfile.language === 'ta';

  // Demo user loader
  const loadDemoUser = () => {
    const demoProfile: UserProfile = {
      name: 'Kavya',
      ageGroup: '26–40',
      state: 'Tamil Nadu',
      district: 'Chengalpattu',
      language: 'ta',
    };
    setUserProfile(demoProfile);
    setIsOnboarding(false);
    setActiveTab('home');
    voiceService.speak(
      'காவ்யா அவர்களின் சுயவிவரம் ஏற்றப்பட்டது. உங்களுக்கான திட்டங்களை முகப்பில் பார்க்கலாம்.',
      'ta'
    );
  };

  const resetProfile = () => {
    const fresh: UserProfile = {
      name: '',
      ageGroup: '26–40',
      state: 'Tamil Nadu',
      district: 'Chengalpattu',
      language: 'ta',
    };
    setUserProfile(fresh);
    setIsOnboarding(true);
    try {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
    } catch (e) {}
  };

  // Deterministic Scheme Filtering Engine
  const { tnSchemes, nationalSchemes, allFiltered } = useMemo(() => {
    let list = SCHEMES;

    // Filter by category if chosen
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory);
    }

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.nameEnglish.toLowerCase().includes(q) ||
          s.nameTamil.toLowerCase().includes(q) ||
          s.descriptionEnglish.toLowerCase().includes(q) ||
          s.descriptionTamil.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    const tn = list.filter((s) => s.scope === 'state');
    const national = list.filter((s) => s.scope === 'national');

    return {
      tnSchemes: tn,
      nationalSchemes: national,
      allFiltered: list,
    };
  }, [selectedCategory, searchQuery]);

  // Potential age eligibility checker based on userProfile
  const getEligibilityIndicator = (scheme: Scheme): 'likely' | 'unknown' => {
    const age = userProfile.ageGroup;
    const min = scheme.eligibility.minAge ?? 0;
    const max = scheme.eligibility.maxAge ?? 100;

    if (age === '18–25' && min <= 22 && max >= 18) return 'likely';
    if (age === '26–40' && min <= 35 && max >= 26) return 'likely';
    if (age === '41–60' && min <= 55 && max >= 41) return 'likely';
    if (age === '60+' && min <= 60) return 'likely';

    return 'unknown';
  };

  // Handlers for scheme actions
  const handleCheckEligibility = (scheme: Scheme) => {
    setEligibilityScheme(scheme);
  };

  const handleLearnMore = (scheme: Scheme) => {
    setSelectedSchemeForModal(scheme);
    setModalInitialTab('details');
  };

  const handleHowToApply = (scheme: Scheme) => {
    setSelectedSchemeForModal(scheme);
    setModalInitialTab('steps');
  };

  const handleApplyOfficially = (scheme: Scheme) => {
    setSelectedSchemeForModal(scheme);
    setModalInitialTab('steps');
  };

  // Home Voice hero toggle
  const toggleHomeVoice = async () => {
    if (isHomeMicActive) {
      if (homeRecognizerRef.current) {
        try {
          homeRecognizerRef.current.stop();
        } catch (e) {}
      }
      setIsHomeMicActive(false);
      return;
    }

    setHomeRecognizedText('');

    // Pre-check permission before attempting recognition
    const permState = await getMicrophonePermissionState();
    if (permState !== 'granted') {
      const result = await requestMicrophonePermission();
      if (!result.granted) {
        // If denied, cleanly navigate to Ask NANBI tab with text input fallback
        setActiveTab('ask');
        return;
      }
    }

    const recognizer = createSpeechRecognizer(
      userProfile.language,
      (text, isFinal) => {
        setHomeRecognizedText(text);
        if (isFinal && text.trim()) {
          setIsHomeMicActive(false);
          // Navigate to Ask NANBI tab with this text
          setActiveTab('ask');
        }
      },
      (err) => {
        console.warn('Home voice error:', err);
        setIsHomeMicActive(false);
        setActiveTab('ask');
      },
      () => {
        setIsHomeMicActive(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        homeRecognizerRef.current = recognizer;
        setIsHomeMicActive(true);
      } catch (e) {
        setIsHomeMicActive(false);
        setActiveTab('ask');
      }
    } else {
      setActiveTab('ask');
    }
  };

  // Render Onboarding if needed
  if (isOnboarding) {
    return (
      <Onboarding
        initialProfile={userProfile}
        onComplete={(newProfile) => {
          setUserProfile(newProfile);
          setIsOnboarding(false);
          setActiveTab('home');
        }}
        onLoadDemoUser={loadDemoUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        userProfile={userProfile}
        language={userProfile.language}
        onLanguageChange={(lang) =>
          setUserProfile((prev) => ({ ...prev, language: lang }))
        }
        textSize={textSize}
        onTextSizeChange={setTextSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        voiceAutoplay={voiceAutoplay}
        onToggleVoiceAutoplay={() => setVoiceAutoplay((prev) => !prev)}
        onEditProfile={() => setIsOnboarding(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ================= VIEW 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28 space-y-6">
            {/* Hero Voice Prompt Card */}
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-5 relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-rose-50 border border-white/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isTamil ? 'குரல்-முதல் வழிகாட்டி' : 'Voice-First Companion'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {isTamil ? 'உங்களுக்கான அரசு திட்டங்கள்' : 'Government schemes for you'}
                </h1>

                <p className="text-sm text-rose-100 font-medium max-w-xl leading-relaxed">
                  {isTamil
                    ? 'கணினி அல்லது இணையதள அறிவு தேவையில்லை. பேசுங்கள் அல்லது தொட்டுப் பாருங்கள் — படிப்படியாக சொல்லித் தருகிறேன்.'
                    : 'No prior digital knowledge needed. Just tap and speak — I will guide you step by step.'}
                </p>
              </div>

              {/* Large Prominent Microphone Action Box */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/25 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={toggleHomeVoice}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-bold text-rose-600 transition-all shadow-md active:scale-95 shrink-0 ${
                    isHomeMicActive
                      ? 'bg-white ring-4 ring-white/60 animate-voice-ripple'
                      : 'bg-white hover:bg-rose-50'
                  }`}
                  title={isTamil ? 'பேச அழுத்தவும்' : 'Tap to speak'}
                  aria-label="Activate voice search"
                >
                  {isHomeMicActive ? (
                    <MicOff className="w-8 h-8 text-rose-700" />
                  ) : (
                    <Mic className="w-8 h-8 text-rose-600" />
                  )}
                </button>

                <div className="text-center sm:text-left flex-1 space-y-1">
                  <span className="text-lg font-bold block text-white">
                    {isHomeMicActive
                      ? isTamil
                        ? 'கேட்கிறேன்... பேசுங்கள்...'
                        : 'Listening... speak now...'
                      : isTamil
                        ? '🎤 "என்ன உதவி வேண்டும்?"'
                        : '🎤 "How can I help you?"'}
                  </span>
                  <p className="text-xs text-rose-100">
                    {homeRecognizedText ? (
                      <span className="font-bold underline text-white">
                        "{homeRecognizedText}"
                      </span>
                    ) : isTamil ? (
                      'எ.கா: "எனக்கு என்ன திட்டம் கிடைக்கும்?", "எப்படி apply செய்வது?"'
                    ) : (
                      'e.g. "What schemes are for me?", "How do I apply?"'
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsLiveVoiceOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                    </span>
                    <span>
                      {isTamil ? '🌸 நேரலை குரல் அழைப்பு (Gemini Live)' : '🌸 Live Voice Call (Gemini Live)'}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ask')}
                    className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 transition-colors whitespace-nowrap"
                  >
                    {isTamil ? 'உரையாடலைத் திறக்க →' : 'Open Chat →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Search & Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'திட்டத்தின் பெயர் அல்லது விவரிக்கப்பட்ட பலன்களைத் தேடவும்...'
                      : 'Search scheme name, category, or benefits...'
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 shadow-2xs"
                />
              </div>

              {/* Category Pills Bar */}
              <div className="overflow-x-auto flex gap-2 pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {isTamil ? 'அனைத்து திட்டங்கள்' : 'All Schemes'}
                </button>

                {CATEGORIES_CONFIG.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{isTamil ? cat.nameTamil : cat.nameEnglish}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Title Count */}
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
              <span>
                {isTamil
                  ? `உங்களுக்காக கண்டுபிடிக்கப்பட்ட திட்டங்கள் (${allFiltered.length})`
                  : `Schemes found for you (${allFiltered.length})`}
              </span>
              <span>
                📍 {userProfile.state} • {userProfile.district}
              </span>
            </div>

            {/* ================= SECTION 1: TAMIL NADU SCHEMES ================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-rose-100 pb-2">
                <span className="text-xl">🏛️</span>
                <h2 className="text-lg font-extrabold text-stone-900">
                  {isTamil ? 'தமிழ்நாடு திட்டங்கள்' : 'Tamil Nadu Schemes'}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 ml-auto">
                  {tnSchemes.length}
                </span>
              </div>

              {tnSchemes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
                  {isTamil
                    ? 'இந்த பிரிவில் திட்டங்கள் எதுவும் கிடைக்கவில்லை.'
                    : 'No Tamil Nadu schemes match your current filter.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tnSchemes.map((scheme) => (
                    <SchemeCard
                      key={scheme.id}
                      scheme={scheme}
                      language={userProfile.language}
                      isEligible={getEligibilityIndicator(scheme)}
                      onCheckEligibility={handleCheckEligibility}
                      onLearnMore={handleLearnMore}
                      onHowToApply={handleHowToApply}
                      onApplyOfficially={handleApplyOfficially}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ================= SECTION 2: ALL-INDIA SCHEMES ================= */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 border-b-2 border-stone-200 pb-2">
                <span className="text-xl">🇮🇳</span>
                <h2 className="text-lg font-extrabold text-stone-900">
                  {isTamil
                    ? 'இந்தியா முழுவதும் கிடைக்கும் திட்டங்கள்'
                    : 'India-Wide Central Schemes'}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 ml-auto">
                  {nationalSchemes.length}
                </span>
              </div>

              {nationalSchemes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
                  {isTamil
                    ? 'இந்த பிரிவில் மத்திய அரசு திட்டங்கள் எதுவும் கிடைக்கவில்லை.'
                    : 'No India-wide schemes match your current filter.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nationalSchemes.map((scheme) => (
                    <SchemeCard
                      key={scheme.id}
                      scheme={scheme}
                      language={userProfile.language}
                      isEligible={getEligibilityIndicator(scheme)}
                      onCheckEligibility={handleCheckEligibility}
                      onLearnMore={handleLearnMore}
                      onHowToApply={handleHowToApply}
                      onApplyOfficially={handleApplyOfficially}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: SCHEMES (BROWSE & SEARCH) ================= */}
        {activeTab === 'schemes' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    {isTamil ? 'அனைத்து திட்டங்கள் பட்டியல்' : 'Government Schemes Directory'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    {isTamil
                      ? 'அங்கீகரிக்கப்பட்ட பெண்களுக்கான தமிழ்நாடு மற்றும் மத்திய அரசு திட்டங்கள்'
                      : 'Verified women-focused state and central schemes'}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'திட்டத்தின் பெயரைத் தேடவும்...'
                      : 'Search scheme by keyword...'
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 shadow-2xs"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="overflow-x-auto flex gap-2 pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {isTamil ? 'அனைத்தும்' : 'All'}
                </button>

                {CATEGORIES_CONFIG.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{isTamil ? cat.nameTamil : cat.nameEnglish}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allFiltered.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  language={userProfile.language}
                  isEligible={getEligibilityIndicator(scheme)}
                  onCheckEligibility={handleCheckEligibility}
                  onLearnMore={handleLearnMore}
                  onHowToApply={handleHowToApply}
                  onApplyOfficially={handleApplyOfficially}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: ASK NANBI (VOICE / CHAT) ================= */}
        {activeTab === 'ask' && (
          <AskNanbiView
            userProfile={userProfile}
            language={userProfile.language}
            schemes={SCHEMES}
            initialQuery={homeRecognizedText}
            onSelectScheme={(scheme) => {
              setSelectedSchemeForModal(scheme);
              setModalInitialTab('details');
            }}
          />
        )}

        {/* ================= VIEW 4: DOCUMENTS HUB ================= */}
        {activeTab === 'documents' && (
          <DocumentsView language={userProfile.language} />
        )}

        {/* ================= VIEW 5: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <SettingsView
            userProfile={userProfile}
            language={userProfile.language}
            onLanguageChange={(lang) =>
              setUserProfile((prev) => ({ ...prev, language: lang }))
            }
            textSize={textSize}
            onTextSizeChange={setTextSize}
            highContrast={highContrast}
            onToggleHighContrast={() => setHighContrast((prev) => !prev)}
            voiceAutoplay={voiceAutoplay}
            onToggleVoiceAutoplay={() => setVoiceAutoplay((prev) => !prev)}
            onEditProfile={() => setIsOnboarding(true)}
            onResetProfile={resetProfile}
            onLoadDemoUser={loadDemoUser}
          />
        )}
      </main>

      {/* Floating Audio Status Bar when NANBI is speaking */}
      <VoiceFloatingBar language={userProfile.language} />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={userProfile.language}
      />

      {/* Interactive Scheme Detail Modal */}
      {selectedSchemeForModal && (
        <SchemeDetailModal
          scheme={selectedSchemeForModal}
          language={userProfile.language}
          initialTab={modalInitialTab}
          onClose={() => setSelectedSchemeForModal(null)}
          onOpenEligibilityChecker={(scheme) => {
            setSelectedSchemeForModal(null);
            setEligibilityScheme(scheme);
          }}
        />
      )}

      {/* Interactive Eligibility Checker Modal */}
      {eligibilityScheme && (
        <EligibilityCheckerModal
          scheme={eligibilityScheme}
          userProfile={userProfile}
          language={userProfile.language}
          onClose={() => setEligibilityScheme(null)}
          onProceedToApply={(scheme) => {
            setEligibilityScheme(null);
            setSelectedSchemeForModal(scheme);
            setModalInitialTab('steps');
          }}
        />
      )}

      {/* Real-Time Live Voice Conversation (Gemini 3.8 Live) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        language={userProfile.language}
        userProfile={userProfile}
        onClose={() => setIsLiveVoiceOpen(false)}
        onLanguageChange={(lang) =>
          setUserProfile((prev) => ({ ...prev, language: lang }))
        }
      />
    </div>
  );
}
