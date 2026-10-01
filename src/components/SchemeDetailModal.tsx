import React, { useState } from 'react';
import { Scheme } from '../data/schemes';
import {
  X,
  Volume2,
  FileCheck2,
  ListOrdered,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Gift,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { voiceService } from '../services/voice';

interface SchemeDetailModalProps {
  scheme: Scheme;
  language: 'ta' | 'en';
  initialTab?: 'details' | 'documents' | 'steps' | 'eligibility';
  onClose: () => void;
  onOpenEligibilityChecker: (scheme: Scheme) => void;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  language,
  initialTab = 'details',
  onClose,
  onOpenEligibilityChecker,
}) => {
  const isTamil = language === 'ta';
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'steps'>(
    initialTab === 'steps'
      ? 'steps'
      : initialTab === 'documents'
      ? 'documents'
      : 'details'
  );
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  const handleListenAll = () => {
    let textToSpeak = '';
    if (activeTab === 'details') {
      textToSpeak = `${isTamil ? scheme.nameTamil : scheme.nameEnglish}. ${
        isTamil ? scheme.descriptionTamil : scheme.descriptionEnglish
      }. ${isTamil ? 'பயன்கள்:' : 'Benefits:'} ${
        isTamil ? scheme.benefits.summaryTamil : scheme.benefits.summaryEnglish
      }. ${isTamil ? 'தகுதி:' : 'Eligibility:'} ${
        isTamil ? scheme.eligibility.summaryTamil : scheme.eligibility.summaryEnglish
      }`;
    } else if (activeTab === 'documents') {
      const docList = scheme.documents
        .map((d) => (isTamil ? `${d.nameTamil} - ${d.whyRequiredTamil}` : `${d.nameEnglish} - ${d.whyRequiredEnglish}`))
        .join('. ');
      textToSpeak = `${isTamil ? 'தேவையான ஆவணங்கள்:' : 'Required documents:'} ${docList}`;
    } else {
      const steps = isTamil
        ? scheme.applicationStepsTamil.join('. ')
        : scheme.applicationStepsEnglish.join('. ');
      textToSpeak = `${isTamil ? 'விண்ணப்பிக்கும் வழிகாட்டல்:' : 'How to apply steps:'} ${steps}`;
    }
    voiceService.speak(textToSpeak, language);
  };

  const handleConfirmApply = () => {
    if (scheme.officialApplyUrl) {
      window.open(scheme.officialApplyUrl, '_blank', 'noopener,noreferrer');
      setShowApplyConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 bg-gradient-to-r from-rose-50/70 to-pink-50/50 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {scheme.scope === 'state'
                  ? isTamil
                    ? '🏛️ தமிழ்நாடு அரசு'
                    : '🏛️ Govt of Tamil Nadu'
                  : isTamil
                    ? '🇮🇳 இந்திய அரசு'
                    : '🇮🇳 Govt of India'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {isTamil ? 'சரிபார்க்கப்பட்டது:' : 'Verified:'} {scheme.lastVerified}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug">
              {isTamil ? scheme.nameTamil : scheme.nameEnglish}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isTamil ? scheme.nameEnglish : scheme.nameTamil}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Listen button */}
            <button
              onClick={handleListenAll}
              className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 shadow-2xs transition-colors flex items-center gap-1"
              title="Listen to this section"
            >
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold hidden sm:inline">
                {isTamil ? 'கேளுங்கள்' : 'Listen'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/90 px-3 sm:px-6 gap-2 text-xs sm:text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-rose-600 text-rose-700 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isTamil ? 'திட்டம் & தகுதி' : 'Overview & Eligibility'}</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-rose-600 text-rose-700 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>
              {isTamil ? 'தேவையான ஆவணங்கள்' : 'Required Documents'} (
              {scheme.documents.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-rose-600 text-rose-700 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>{isTamil ? 'விண்ணப்பிக்கும் முறை' : 'How to Apply'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ================= TAB 1: DETAILS & ELIGIBILITY ================= */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* 1. What is this scheme? */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {isTamil ? '1. இந்த திட்டம் என்றால் என்ன?' : '1. What is this scheme?'}
                </h4>
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  {isTamil ? scheme.descriptionTamil : scheme.descriptionEnglish}
                </p>
                <p className="text-xs text-stone-500 px-1">
                  🏛️ {isTamil ? scheme.department.tamil : scheme.department.english}
                </p>
              </div>

              {/* 2. What benefits are provided? */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-rose-600" />
                  {isTamil ? '2. என்ன பயன்கள் கிடைக்கும்?' : '2. What benefits are provided?'}
                </h4>
                <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-rose-900 text-base">
                      {isTamil ? scheme.benefits.summaryTamil : scheme.benefits.summaryEnglish}
                    </span>
                    {scheme.benefits.amount && (
                      <span className="px-3 py-1 bg-white rounded-xl font-black text-rose-700 shadow-2xs border border-rose-200">
                        {scheme.benefits.amount}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 pt-1 text-xs sm:text-sm text-stone-700">
                    {(isTamil
                      ? scheme.benefits.detailsTamil
                      : scheme.benefits.detailsEnglish
                    ).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. Who can apply & Eligibility */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    {isTamil ? '3. யார் விண்ணப்பிக்கலாம்?' : '3. Who can apply? (Eligibility)'}
                  </h4>
                  <button
                    onClick={() => onOpenEligibilityChecker(scheme)}
                    className="text-xs font-bold text-rose-700 hover:text-rose-800 underline underline-offset-2"
                  >
                    {isTamil ? 'தகுதியை சரிபார்க்க →' : 'Check My Eligibility →'}
                  </button>
                </div>

                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-2.5 text-xs sm:text-sm text-stone-800">
                  <p className="font-semibold text-emerald-950">
                    {isTamil
                      ? scheme.eligibility.summaryTamil
                      : scheme.eligibility.summaryEnglish}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-stone-500 block font-medium">
                        {isTamil ? 'வயது வரம்பு:' : 'Age requirement:'}
                      </span>
                      <span className="font-bold text-stone-900">
                        {scheme.eligibility.minAge ?? 18} -{' '}
                        {scheme.eligibility.maxAge ?? 65} {isTamil ? 'வயது' : 'Years'}
                      </span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-stone-500 block font-medium">
                        {isTamil ? 'வருமான வரம்பு:' : 'Income limit:'}
                      </span>
                      <span className="font-bold text-stone-900">
                        {isTamil
                          ? scheme.eligibility.incomeLimitTamil || 'விதிகளுக்கு உட்பட்டது'
                          : scheme.eligibility.incomeLimitEnglish || 'As per norms'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Where to apply & Official Source */}
              <div className="space-y-2 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <span className="font-bold uppercase tracking-wider text-stone-500 block">
                  {isTamil ? 'விண்ணப்பிக்கும் இடம் / அரசு தளம்:' : 'Where to apply / Official Portal:'}
                </span>
                <p className="font-bold text-stone-900 text-sm">
                  {scheme.applicationPortalName}
                </p>
                <div className="flex items-center gap-1.5 text-emerald-700 pt-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isTamil
                      ? 'அதிகாரப்பூர்வ அரசு இணையதளத்தில் இருந்து சரிபார்க்கப்பட்டது.'
                      : 'Verified directly from official Government portal.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: REQUIRED DOCUMENTS ================= */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                <p className="font-bold">
                  {isTamil
                    ? '💡 விண்ணப்பிக்கத் தொடங்கும் முன் இந்த ஆவணங்களை கையில் எடுத்து வைத்துக்கொள்ளவும்.'
                    : '💡 Keep these original or photocopies ready before starting your application.'}
                </p>
              </div>

              <div className="space-y-3">
                {scheme.documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-4 border-2 border-stone-200 shadow-2xs hover:border-rose-300 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-stone-900 text-base">
                          {isTamil ? doc.nameTamil : doc.nameEnglish}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 shrink-0">
                        {isTamil ? doc.nameEnglish : doc.nameTamil}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600">
                      {isTamil ? doc.descriptionTamil : doc.descriptionEnglish}
                    </p>

                    <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100 text-xs text-rose-900 flex items-start gap-1.5">
                      <span className="font-bold shrink-0">
                        {isTamil ? 'ஏன் தேவை?' : 'Why required?'}
                      </span>
                      <span>
                        {isTamil ? doc.whyRequiredTamil : doc.whyRequiredEnglish}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: APPLICATION STEPS ================= */}
          {activeTab === 'steps' && (
            <div className="space-y-5">
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-rose-950 text-xs sm:text-sm">
                <p className="font-extrabold text-sm mb-1">
                  {isTamil
                    ? 'படிப்படியான விண்ணப்ப வழிகாட்டல்'
                    : 'Step-by-Step Beginner Application Guide'}
                </p>
                <p className="text-rose-800 text-xs leading-relaxed">
                  {isTamil
                    ? 'கணினி அல்லது இணையதள அறிவு இல்லாவிட்டாலும், இந்த எளிய வழிகளைப் பின்பற்றி நீங்கள் எளிதாக விண்ணப்பிக்கலாம்.'
                    : 'Even with zero digital knowledge, follow these verified steps one at a time.'}
                </p>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-rose-100">
                {(isTamil
                  ? scheme.applicationStepsTamil
                  : scheme.applicationStepsEnglish
                ).map((stepText, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-start gap-3 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs ml-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-stone-800 leading-relaxed font-medium">
                      {stepText}
                    </div>
                  </div>
                ))}
              </div>

              {/* Beginner Digital Mode Tips */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
                <span className="font-bold text-stone-900 block">
                  {isTamil ? '📌 எளிய டிஜிட்டல் உதவிக்குறிப்புகள்:' : '📌 Beginner Digital Tips:'}
                </span>
                <p>
                  •{' '}
                  {isTamil
                    ? 'ஆவணங்களை உங்கள் தொலைபேசி கேமராவில் தெளிவாகப் புகைப்படம் எடுத்துக்கொள்ளவும்.'
                    : 'Take clear photos of your documents with your phone camera.'}
                </p>
                <p>
                  •{' '}
                  {isTamil
                    ? 'விண்ணப்ப எண் (Application Reference Number) கிடைத்தவுடன், அதை நோட்டில் குறித்து வைக்கவும் அல்லது ஸ்கிரீன்ஷாட் எடுக்கவும்.'
                    : 'Save or write down the Application Reference Number given at the end.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Safety Dialog Before External Redirect */}
        {showApplyConfirm && (
          <div className="p-4 bg-emerald-50 border-t border-emerald-200 space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {isTamil
                    ? 'அதிகாரப்பூர்வ அரசு இணையதளத்தைத் திறக்க உள்ளீர்கள்'
                    : 'Opening Official Government Portal'}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {isTamil
                    ? 'இந்த பொத்தான் அதிகாரப்பூர்வ அரசு இணையதளத்தை புதிய பக்கத்தில் திறக்கும்.'
                    : 'This button opens the official government application website.'}
                </p>
                <p className="text-[11px] font-mono text-emerald-700 mt-1 break-all">
                  🔗 {scheme.officialApplyUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowApplyConfirm(false)}
                className="py-2 px-3 rounded-xl border border-emerald-300 font-bold text-xs text-emerald-800 bg-white hover:bg-emerald-50"
              >
                {isTamil ? 'ரத்து செய்ய' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmApply}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5"
              >
                <span>{isTamil ? 'இணைப்பைத் திறக்க' : 'Open Website'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Unverified apply URL Notice if null */}
        {!scheme.officialApplyUrl && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isTamil
                ? 'இந்தத் திட்டத்திற்கான அதிகாரப்பூர்வ ஆன்லைன் விண்ணப்ப இணைப்பு தற்போது உறுதிப்படுத்தப்படவில்லை.'
                : 'The official online application link for this scheme has not been verified.'}
            </span>
          </div>
        )}

        {/* Modal Footer with Primary Apply Button */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-white text-xs"
          >
            {isTamil ? 'மூட' : 'Close'}
          </button>

          {scheme.officialApplyUrl ? (
            <button
              onClick={() => setShowApplyConfirm(true)}
              className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>
                {isTamil
                  ? 'அதிகாரப்பூர்வமாக விண்ணப்பிக்க'
                  : 'Apply on Official Website'}
              </span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <span className="text-xs text-stone-500 font-medium">
              {isTamil
                ? 'அருகிலுள்ள இ-சேவை மையம் மூலம் விண்ணப்பிக்கவும்'
                : 'Apply via nearest e-Sevai / Department office'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
