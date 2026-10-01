import React, { useState } from 'react';
import {
  UserProfile,
  INDIAN_STATES,
  TAMIL_NADU_DISTRICTS,
} from '../data/schemes';
import { Sparkles, ArrowRight, ArrowLeft, Check, User, MapPin, Calendar, Heart } from 'lucide-react';
import { voiceService } from '../services/voice';

interface OnboardingProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onLoadDemoUser: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  initialProfile,
  onComplete,
  onLoadDemoUser,
}) => {
  const [step, setStep] = useState<number>(1);
  const [language, setLanguage] = useState<'ta' | 'en'>(initialProfile.language || 'ta');
  const [name, setName] = useState<string>(initialProfile.name || '');
  const [ageGroup, setAgeGroup] = useState<UserProfile['ageGroup']>(
    initialProfile.ageGroup || '26–40'
  );
  const [state, setState] = useState<string>(initialProfile.state || 'Tamil Nadu');
  const [district, setDistrict] = useState<string>(
    initialProfile.district || 'Chengalpattu'
  );

  const isTamil = language === 'ta';

  // Speak helper for voice assistance
  const speakText = (text: string) => {
    voiceService.speak(text, language);
  };

  const handleLanguageSelect = (lang: 'ta' | 'en') => {
    setLanguage(lang);
    setStep(2);
    if (lang === 'ta') {
      speakText('வணக்கம்! நான் நண்பி. உங்களுக்கான அரசு திட்டங்களை எளிமையாக கண்டுபிடித்து தருகிறேன்.');
    } else {
      speakText('Hello! I am NANBI, your government companion. I will help you discover schemes step by step.');
    }
  };

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      name: name.trim() || (isTamil ? 'அன்பு தோழி' : 'Friend'),
      ageGroup,
      state,
      district,
      language,
    };
    onComplete(finalProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF9F5] via-[#FFF5F7] to-[#FAF5F0] flex flex-col items-center justify-center p-4 sm:p-6 text-stone-900">
      {/* Hackathon quick demo banner */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs text-stone-700 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-rose-100 shadow-2xs">
        <span className="font-medium flex items-center gap-1.5 text-rose-800">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          {isTamil ? 'டெமோ பயனர் தேவைப்படுகிறதா?' : 'Need demo test data?'}
        </span>
        <button
          onClick={onLoadDemoUser}
          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
        >
          {isTamil ? 'காவ்யா சுயவிவரம் ஏற்று' : 'Load Demo (Kavya)'}
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100/80 shadow-xl overflow-hidden transition-all duration-300">
        {/* Progress Bar */}
        <div className="h-1.5 bg-rose-50 w-full">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* ================= SCREEN 1: LANGUAGE SELECTION ================= */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="inline-flex w-16 h-16 rounded-3xl bg-rose-50 border-2 border-rose-100 items-center justify-center text-3xl shadow-xs">
                🌸
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-rose-800">
                  NANBI
                </h1>
                <h2 className="text-2xl font-bold text-rose-600 mt-0.5">
                  நண்பி
                </h2>
                <p className="text-sm font-semibold text-stone-700 mt-2">
                  "உங்கள் அரசு தோழி"
                </p>
                <p className="text-xs text-stone-700">
                  "Your Government Companion"
                </p>
              </div>

              <div className="pt-2">
                <p className="text-base font-medium text-stone-800 mb-4">
                  மொழியைத் தேர்வு செய்யவும் / Choose your language
                </p>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => handleLanguageSelect('ta')}
                    className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/60 hover:bg-rose-100 hover:border-rose-400 text-rose-900 font-extrabold text-xl transition-all shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95"
                  >
                    <span>தமிழ்</span>
                    <span className="text-xs font-normal text-rose-700">
                      Tamil
                    </span>
                  </button>

                  <button
                    onClick={() => handleLanguageSelect('en')}
                    className="p-5 rounded-2xl border-2 border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300 text-stone-900 font-extrabold text-xl transition-all shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95"
                  >
                    <span>English</span>
                    <span className="text-xs font-normal text-stone-700">
                      ஆங்கிலம்
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= SCREEN 2: WELCOME ================= */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 items-center justify-center text-3xl">
                👋
              </div>

              {isTamil ? (
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold text-stone-900">
                    வணக்கம்! 👋
                  </h2>
                  <p className="text-xl font-bold text-rose-600">
                    நான் நண்பி.
                  </p>
                  <p className="text-base text-stone-700 leading-relaxed font-normal pt-1">
                    உங்களுக்கான அரசு திட்டங்களை எளிமையாக கண்டுபிடித்து, எப்படி விண்ணப்பிப்பது என்பதையும் படிப்படியாக சொல்லித் தருகிறேன்.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold text-stone-900">
                    Hello! 👋
                  </h2>
                  <p className="text-xl font-bold text-rose-600">
                    I am NANBI.
                  </p>
                  <p className="text-base text-stone-700 leading-relaxed font-normal pt-1">
                    I help you discover government schemes that may be relevant to you and explain how to apply step by step.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{isTamil ? 'தொடங்கலாம்' : 'Get Started'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SCREEN 3: USER NAME ================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isTamil ? 'உங்கள் பெயர் என்ன?' : 'What is your name?'}
                  </h2>
                  <p className="text-xs text-stone-700">
                    {isTamil
                      ? 'கடவுச்சொல் (password) தேவையில்லை.'
                      : 'No password or registration required.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  {isTamil ? 'பெயர்' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'உங்கள் பெயரை உள்ளிடுங்கள் (எ.கா: காவ்யா)'
                      : 'Enter your name (e.g. Kavya)'
                  }
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-stone-200 focus:border-rose-500 focus:outline-hidden text-base bg-stone-50/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setStep(4);
                  }}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="py-3.5 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>{isTamil ? 'அடுத்து' : 'Continue'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SCREEN 4: AGE GROUP ================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isTamil ? 'உங்கள் வயது பிரிவு?' : 'What is your age group?'}
                  </h2>
                  <p className="text-xs text-stone-700">
                    {isTamil
                      ? 'பொருத்தமான திட்டங்களை வடிகட்ட உதவும்'
                      : 'Helps match schemes for your stage'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['18–25', '26–40', '41–60', '60+'] as const).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setAgeGroup(group)}
                    className={`p-4 rounded-2xl border-2 font-bold text-lg text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      ageGroup === group
                        ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs ring-2 ring-rose-200'
                        : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{group}</span>
                    <span className="text-xs font-medium text-stone-700">
                      {isTamil ? 'வயது' : 'Years'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="py-3.5 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>{isTamil ? 'அடுத்து' : 'Continue'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SCREEN 5: LOCATION ================= */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {isTamil ? 'உங்கள் இருப்பிடம்?' : 'Where do you live?'}
                  </h2>
                  <p className="text-xs text-stone-700">
                    {isTamil
                      ? 'மாநிலம் மற்றும் மாவட்டம் தேர்வு செய்க'
                      : 'Choose your state & district'}
                  </p>
                </div>
              </div>

              {/* State Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {isTamil ? 'மாநிலம் (State)' : 'State'}
                </label>
                <select
                  value={state}
                  onChange={(e) => {
                    const nextState = e.target.value;
                    setState(nextState);
                    if (nextState === 'Tamil Nadu') {
                      setDistrict('Chengalpattu');
                    } else {
                      setDistrict('General');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 bg-stone-50/50 focus:border-rose-500 focus:outline-hidden text-base font-medium"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.english} value={s.english}>
                      {isTamil ? s.tamil : s.english}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown (Dynamic based on state) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {isTamil ? 'மாவட்டம் (District)' : 'District'}
                </label>
                {state === 'Tamil Nadu' ? (
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 bg-stone-50/50 focus:border-rose-500 focus:outline-hidden text-base font-medium"
                  >
                    {TAMIL_NADU_DISTRICTS.map((d) => (
                      <option key={d.english} value={d.english}>
                        {isTamil ? d.tamil : d.english}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={isTamil ? 'மாவட்டத்தின் பெயர்' : 'District name'}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 bg-stone-50/50 focus:border-rose-500 focus:outline-hidden text-base"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => setStep(4)}
                  className="py-3.5 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>{isTamil ? 'அடுத்து' : 'Continue'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SCREEN 6: PROFILE SUMMARY ================= */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 items-center justify-center text-xl mb-1">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-2xl font-extrabold text-stone-900">
                  {isTamil ? 'சுயவிவர சுருக்கம்' : 'Profile Summary'}
                </h2>
                <p className="text-xs text-stone-700">
                  {isTamil
                    ? 'விவரங்களை சரிபார்த்து உறுதி செய்யவும்'
                    : 'Please review your details before proceeding'}
                </p>
              </div>

              <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-200/70 space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-stone-700 font-medium">
                    {isTamil ? 'பெயர்' : 'Name'}
                  </span>
                  <span className="font-bold text-stone-900">
                    {name.trim() || (isTamil ? 'அன்பு தோழி' : 'Friend')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-stone-700 font-medium">
                    {isTamil ? 'வயது பிரிவு' : 'Age Group'}
                  </span>
                  <span className="font-bold text-stone-900">
                    {ageGroup} {isTamil ? 'வயது' : 'Years'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-stone-700 font-medium">
                    {isTamil ? 'மாநிலம்' : 'State'}
                  </span>
                  <span className="font-bold text-stone-900">{state}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-stone-700 font-medium">
                    {isTamil ? 'மாவட்டம்' : 'District'}
                  </span>
                  <span className="font-bold text-stone-900">{district}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-700 font-medium">
                    {isTamil ? 'மொழி' : 'Language'}
                  </span>
                  <span className="font-bold text-rose-700">
                    {language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="py-3.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition-colors"
                >
                  {isTamil ? 'திருத்த' : 'Edit'}
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{isTamil ? 'தொடரவும் →' : 'Continue →'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helpful accessibility tagline at the bottom */}
      <p className="mt-4 text-xs text-stone-700 text-center flex items-center justify-center gap-1 font-medium">
        <Heart className="w-3.5 h-3.5 text-rose-600 fill-current" />
        {isTamil
          ? 'எளிய மொழியில் பெண்களுக்கான அரசு வழிகாட்டி'
          : 'Simple government companion for women'}
      </p>
    </div>
  );
};
