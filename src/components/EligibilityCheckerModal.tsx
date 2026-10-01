import React, { useState } from 'react';
import { Scheme, UserProfile } from '../data/schemes';
import { X, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react';
import { voiceService } from '../services/voice';

interface EligibilityCheckerModalProps {
  scheme: Scheme;
  userProfile: UserProfile;
  language: 'ta' | 'en';
  onClose: () => void;
  onProceedToApply: (scheme: Scheme) => void;
}

export const EligibilityCheckerModal: React.FC<EligibilityCheckerModalProps> = ({
  scheme,
  userProfile,
  language,
  onClose,
  onProceedToApply,
}) => {
  const isTamil = language === 'ta';
  // State for user answers: questionId -> boolean (eligible option picked)
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const questions = scheme.eligibility.questions || [];

  const handleSelectOption = (questionId: string, isEligible: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: isEligible,
    }));
  };

  // Determine overall status
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  let resultStatus: 'likely' | 'more_info' | 'not_eligible' = 'more_info';
  if (!allAnswered) {
    resultStatus = 'more_info';
  } else {
    const hasIneligible = Object.values(answers).some((val) => val === false);
    resultStatus = hasIneligible ? 'not_eligible' : 'likely';
  }

  const handleSpeakResult = () => {
    let msg = '';
    if (resultStatus === 'likely') {
      msg = isTamil
        ? 'நீங்கள் வழங்கிய தகவல்களின் அடிப்படையில், இந்தத் திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு உள்ளது. இறுதி தகுதியை அதிகாரப்பூர்வ அரசு தளம் உறுதிப்படுத்தும்.'
        : 'Based on the information you provided, you may be eligible for this scheme. Final eligibility is determined by the official government authority.';
    } else if (resultStatus === 'not_eligible') {
      msg = isTamil
        ? 'வழங்கப்பட்ட தகவலின்படி, இந்த திட்டத்திற்கான சில நிபந்தனைகள் பொருந்தவில்லை. மற்ற திட்டங்களைப் பார்க்கலாம்.'
        : 'Based on the information provided, you may not meet all conditions for this scheme. You can explore other schemes.';
    } else {
      msg = isTamil
        ? 'மேலும் விவரங்கள் தேவைப்படுகின்றன. கேள்விகளுக்கு பதிலளிக்கவும்.'
        : 'More information is needed. Please answer the questions.';
    }
    voiceService.speak(msg, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-rose-50/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              {isTamil ? 'எளிய தகுதி சரிபார்ப்பு' : 'Quick Eligibility Check'}
            </span>
            <h3 className="text-lg font-bold text-stone-900 leading-snug">
              {isTamil ? scheme.nameTamil : scheme.nameEnglish}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Automatic Profile Match Notice */}
          <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">
                {isTamil
                  ? 'உங்கள் வயது மற்றும் இருப்பிடம் சரிபார்க்கப்பட்டுள்ளது'
                  : 'Your age and location are pre-checked'}
              </p>
              <p className="text-emerald-700 mt-0.5 font-medium">
                {userProfile.name} • {userProfile.ageGroup} • {userProfile.state}
                {userProfile.district ? ` • ${userProfile.district}` : ''}
              </p>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {isTamil
                ? 'இந்த திட்டத்திற்கு தேவையான கூடுதல் விவரங்கள்:'
                : 'Scheme Specific Questions:'}
            </p>

            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3"
              >
                <p className="text-sm font-bold text-stone-900 leading-relaxed">
                  {idx + 1}. {isTamil ? q.questionTamil : q.questionEnglish}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === opt.eligible;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.eligible)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-200'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-rose-300 hover:bg-rose-50/50'
                        }`}
                      >
                        {isTamil ? opt.labelTamil : opt.labelEnglish}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Result Banner */}
          <div className="pt-2">
            {resultStatus === 'likely' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>
                    {isTamil
                      ? '🟢 இந்தத் திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு உள்ளது'
                      : '🟢 Likely eligible based on provided information'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  {isTamil
                    ? 'நீங்கள் வழங்கிய தகவல்களின் அடிப்படையில், இந்தத் திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு உள்ளது. இறுதி தகுதியை அதிகாரப்பூர்வ அரசு தளம் உறுதிப்படுத்தும்.'
                    : 'Based on the information you provided, you may be eligible for this scheme. Final eligibility is determined by the official government authority.'}
                </p>
              </div>
            )}

            {resultStatus === 'not_eligible' && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-sm text-rose-800">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>
                    {isTamil
                      ? '🔴 தகுதி பெற வாய்ப்பு குறைவு'
                      : '🔴 Appears not eligible based on provided information'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-rose-800">
                  {isTamil
                    ? 'வழங்கப்பட்ட தகவல்களின் அடிப்படையில் இந்த திட்டத்திற்கான நிபந்தனைகள் பொருந்தாமல் இருக்கலாம். ஆயினும் அதிகாரப்பூர்வ தளத்தை சரிபார்க்கலாம் அல்லது பிற திட்டங்களை பார்க்கலாம்.'
                    : 'Based on the information provided, you may not meet all conditions for this scheme. You can verify on the official website or explore other schemes.'}
                </p>
              </div>
            )}

            {resultStatus === 'more_info' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isTamil
                    ? '🟡 மேலும் தகவல் தேவை. மேலே உள்ள கேள்விகளுக்கு பதிலளிக்கவும்.'
                    : '🟡 More information needed. Please answer the questions above.'}
                </span>
              </div>
            )}
          </div>

          {/* Voice listen button for accessibility */}
          <button
            onClick={handleSpeakResult}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-rose-600" />
            <span>
              {isTamil ? '🔊 தகுதி முடிவைக் கேளுங்கள்' : '🔊 Listen to Eligibility Result'}
            </span>
          </button>

          {/* Disclaimer */}
          <div className="text-[11px] text-stone-500 flex items-start gap-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <p>
              {isTamil
                ? 'நண்பி தகுதியை ஆரம்ப வழிகாட்டுதலாக மட்டுமே வழங்குகிறது. அதிகாரப்பூர்வ அரசு ஒப்புதலே இறுதியானது.'
                : 'NANBI provides an initial guidance only. Final eligibility is confirmed solely by the government authority.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-white text-xs"
          >
            {isTamil ? 'மூட' : 'Close'}
          </button>

          <button
            onClick={() => {
              onClose();
              onProceedToApply(scheme);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{isTamil ? 'விண்ணப்பிக்கும் வழிகாட்டல்' : 'View Application Guide'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
