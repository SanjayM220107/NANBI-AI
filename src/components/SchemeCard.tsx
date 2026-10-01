import React from 'react';
import { Scheme, CATEGORIES_CONFIG } from '../data/schemes';
import { Volume2, ExternalLink, CheckCircle2, HelpCircle, ShieldCheck, ChevronRight, FileText } from 'lucide-react';
import { voiceService } from '../services/voice';

interface SchemeCardProps {
  scheme: Scheme;
  language: 'ta' | 'en';
  onCheckEligibility: (scheme: Scheme) => void;
  onLearnMore: (scheme: Scheme) => void;
  onHowToApply: (scheme: Scheme) => void;
  onApplyOfficially: (scheme: Scheme) => void;
  isEligible?: 'likely' | 'unknown' | 'unlikely';
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  language,
  onCheckEligibility,
  onLearnMore,
  onHowToApply,
  onApplyOfficially,
  isEligible = 'unknown',
}) => {
  const isTamil = language === 'ta';
  const categoryConfig = CATEGORIES_CONFIG.find((c) => c.id === scheme.category);

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = isTamil ? scheme.nameTamil : scheme.nameEnglish;
    const desc = isTamil ? scheme.descriptionTamil : scheme.descriptionEnglish;
    const benefits = isTamil ? scheme.benefits.summaryTamil : scheme.benefits.summaryEnglish;
    const speechText = `${title}. ${desc}. பயன்கள்: ${benefits}.`;
    voiceService.speak(speechText, language);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top Banner: Category and Scope badges */}
      <div className="p-5 sm:p-6 pb-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${
                categoryConfig?.badgeBg || 'bg-stone-100 text-stone-800 border-stone-200'
              }`}
            >
              <span>{categoryConfig?.icon}</span>
              <span>{isTamil ? categoryConfig?.nameTamil : categoryConfig?.nameEnglish}</span>
            </span>

            <span className="px-2.5 py-1 rounded-full font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              {scheme.scope === 'state'
                ? isTamil
                  ? '🏛️ தமிழ்நாடு'
                  : '🏛️ Tamil Nadu'
                : isTamil
                  ? '🇮🇳 இந்தியா முழுவதும்'
                  : '🇮🇳 All India'}
            </span>
          </div>

          {/* Potential Eligibility Indicator Badge */}
          {isEligible === 'likely' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isTamil ? 'வாய்ப்பு உள்ளது' : 'Likely Eligible'}
            </span>
          )}
          {isEligible === 'unknown' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <HelpCircle className="w-3 h-3" />
              {isTamil ? 'தகுதி சரிபார்க்கவும்' : 'Check Eligibility'}
            </span>
          )}
        </div>

        {/* Scheme Titles */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
            {isTamil ? scheme.nameTamil : scheme.nameEnglish}
          </h3>
          <p className="text-xs text-stone-700 mt-1 font-medium">
            {isTamil ? scheme.nameEnglish : scheme.nameTamil}
          </p>
        </div>

        {/* Short Description */}
        <p className="text-sm text-stone-700 leading-relaxed">
          {isTamil ? scheme.descriptionTamil : scheme.descriptionEnglish}
        </p>

        {/* Highlight Benefit Pill */}
        <div className="bg-rose-50/80 rounded-2xl p-3 border border-rose-200/70 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-rose-900 block">
              {isTamil ? 'வழங்கப்படும் பயன்:' : 'Benefit:'}
            </span>
            <span className="text-rose-700 font-medium">
              {isTamil ? scheme.benefits.summaryTamil : scheme.benefits.summaryEnglish}
            </span>
          </div>
          {scheme.benefits.amount && (
            <span className="px-2.5 py-1 rounded-xl bg-white font-extrabold text-rose-700 shadow-2xs border border-rose-200 shrink-0 ml-2">
              {scheme.benefits.amount}
            </span>
          )}
        </div>

        {/* Source & Verified metadata */}
        <div className="flex items-center justify-between text-[11px] text-stone-700 pt-1 border-t border-stone-100">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {isTamil ? 'அதிகாரப்பூர்வ அரசு மூலம்' : 'Official Government Source'}
          </span>
          <span>
            {isTamil ? 'சரிபார்க்கப்பட்டது:' : 'Verified:'}{' '}
            <time className="font-semibold text-stone-700">{scheme.lastVerified}</time>
          </span>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="p-4 sm:p-5 pt-2 bg-stone-50/80 border-t border-stone-200 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Check Eligibility Button */}
          <button
            onClick={() => onCheckEligibility(scheme)}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 font-bold text-stone-800 transition-colors shadow-2xs flex items-center justify-center gap-1 text-center"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{isTamil ? 'தகுதியை சரிபார்க்க' : 'Check Eligibility'}</span>
          </button>

          {/* Learn More Button */}
          <button
            onClick={() => onLearnMore(scheme)}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 font-bold text-stone-800 transition-colors shadow-2xs flex items-center justify-center gap-1 text-center"
          >
            <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span>{isTamil ? 'திட்டம் பற்றி' : 'Learn Details'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* How to Apply Button */}
          <button
            onClick={() => onHowToApply(scheme)}
            className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold border border-stone-300 transition-colors flex items-center justify-center gap-1 text-center"
          >
            <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span>{isTamil ? 'எப்படி விண்ணப்பிப்பது' : 'How to Apply'}</span>
          </button>

          {/* Listen Button */}
          <button
            onClick={handleListen}
            className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
            title="Listen to Tamil/English voice explanation"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{isTamil ? '🔊 கேளுங்கள்' : '🔊 Listen'}</span>
          </button>
        </div>

        {/* 🟢 Official Apply Button */}
        <button
          onClick={() => onApplyOfficially(scheme)}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{isTamil ? 'அதிகாரப்பூர்வமாக விண்ணப்பிக்க' : 'Apply Officially'}</span>
          <ExternalLink className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
