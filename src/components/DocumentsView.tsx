import React, { useState } from 'react';
import { Volume2, FileText, CheckCircle2, ShieldAlert, Sparkles, Search } from 'lucide-react';
import { voiceService } from '../services/voice';

interface DocumentsViewProps {
  language: 'ta' | 'en';
}

interface DocGuideItem {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  category: string;
  whyNeededTamil: string;
  whyNeededEnglish: string;
  howToGetTamil: string;
  howToGetEnglish: string;
  tipsTamil: string;
  tipsEnglish: string;
}

const COMMON_DOCS: DocGuideItem[] = [
  {
    id: 'aadhaar',
    nameTamil: 'ஆதார் அட்டை (Aadhaar Card)',
    nameEnglish: 'Aadhaar Card',
    category: 'அடையாளச் சான்று / Identity',
    whyNeededTamil: 'அனைத்து அரசுத் திட்டங்களின் நேரடி வங்கிப் பணப் பரிமாற்றத்திற்கும் (DBT) பயோமெட்ரிக் அடையாளத்திற்கும் முதன்மை ஆவணம்.',
    whyNeededEnglish: 'Primary identity document mandatory for Direct Benefit Transfer (DBT) and biometric authentication.',
    howToGetTamil: 'அருகிலுள்ள ஆதார் சேவை மையம் அல்லது தபால் நிலையங்களில் புதிய ஆதார் அல்லது விவரங்கள் திருத்தம் செய்யலாம்.',
    howToGetEnglish: 'Visit your nearest Aadhaar Seva Kendra or Post Office for new enrollment or address/biometric updates.',
    tipsTamil: 'முக்கிய குறிப்பு: உங்கள் ஆதார் அட்டையுடன் வங்கி சேமிப்புக் கணக்கு (NPCI Seeding) இணைக்கப்பட்டிருக்க வேண்டும்.',
    tipsEnglish: 'Crucial: Ensure your Aadhaar is linked with your active single-holder savings bank account (NPCI Seeding).',
  },
  {
    id: 'ration_card',
    nameTamil: 'ஸ்மார்ட் குடும்ப அட்டை (Smart Ration Card)',
    nameEnglish: 'Smart Family Ration Card',
    category: 'முகவரி & குடும்ப சான்று / Family Proof',
    whyNeededTamil: 'குடும்பத் தலைவி யார், குடும்ப உறுப்பினர்கள் மற்றும் தமிழ்நாடு குடியிருப்பை உறுதி செய்ய தேவைப்படுகிறது.',
    whyNeededEnglish: 'Proves the woman head of household, family members, and official residence in Tamil Nadu.',
    howToGetTamil: 'tnpds.gov.in இணையதளம் அல்லது இ-சேவை மையம் மூலம் புதிய குடும்ப அட்டை பெறலாம்.',
    howToGetEnglish: 'Apply online via tnpds.gov.in or through your nearest e-Sevai center.',
    tipsTamil: 'குடும்பத் தலைவியாக பெண்ணின் பெயர் மற்றும் புகைப்படம் சரியாக உள்ளதா என சரிபார்க்கவும்.',
    tipsEnglish: 'Ensure the woman is named as family head with correct photograph on the smart card.',
  },
  {
    id: 'bank_passbook',
    nameTamil: 'வங்கி கணக்கு புத்தகம் (Bank Passbook)',
    nameEnglish: 'Savings Bank Passbook',
    category: 'நிதி வரவு / Financial DBT',
    whyNeededTamil: 'மாதாந்திர உதவித்தொகை மற்றும் மானியங்கள் நேரடியாக வரவு வைக்கப்பட வேண்டும்.',
    whyNeededEnglish: 'Required to receive monthly pensions, grants, and subsidies directly via electronic transfer.',
    howToGetTamil: 'அருகிலுள்ள அரசுடைமை வங்கி (SBI, Indian Bank போன்றவை) அல்லது அஞ்சலகத்தில் (Post Office) கணக்கு தொடங்கவும்.',
    howToGetEnglish: 'Open a basic savings account at any public sector bank or India Post Payments Bank.',
    tipsTamil: 'கணக்கு பெண்ணின் சொந்த பெயரில் தனிநபர் கணக்காக (Single Account) இருக்க வேண்டும். கூட்டு கணக்கு தவிர்க்கவும்.',
    tipsEnglish: 'The account should strictly be in the woman’s own name (Single account), not a joint account.',
  },
  {
    id: 'income_cert',
    nameTamil: 'வருமானச் சான்றிதழ் (Income Certificate)',
    nameEnglish: 'Income Certificate',
    category: 'வருவாய் துறை / Revenue Proof',
    whyNeededTamil: 'குடும்ப ஆண்டு வருமானம் குறிப்பிட்ட வரம்பிற்குள் உள்ளதை நிரூபிக்க வட்டாட்சியரால் வழங்கப்படுகிறது.',
    whyNeededEnglish: 'Issued by Tahsildar to verify that the family annual income falls within the eligible poverty criteria.',
    howToGetTamil: 'அருகிலுள்ள தமிழ்நாடு அரசு இ-சேவை மையம் (tnesevai.tn.gov.in) மூலம் விண்ணப்பித்து பெறலாம்.',
    howToGetEnglish: 'Apply through your nearest Tamil Nadu Government e-Sevai center.',
    tipsTamil: 'இச்சான்றிதழ் பெற்ற தேதியிலிருந்து 1 வருடம் மட்டுமே செல்லுபடியாகும்.',
    tipsEnglish: 'The certificate is generally valid for 1 year from the date of issue.',
  },
  {
    id: 'widow_cert',
    nameTamil: 'ஆதரவற்ற விதவை / கைவிடப்பட்ட சான்று',
    nameEnglish: 'Destitute Widow / Deserted Certificate',
    category: 'சமூக பாதுகாப்பு / Social Security',
    whyNeededTamil: 'விதவை அல்லது கணவனால் கைவிடப்பட்ட பெண்களுக்கான மாதாந்திர ஓய்வூதியம் பெற கட்டாயம்.',
    whyNeededEnglish: 'Essential for monthly social security pensions under Tamil Nadu Social Welfare schemes.',
    howToGetTamil: 'கணவரின் இறப்பு சான்றிதழுடன் இ-சேவை மையம் மூலம் வட்டாட்சியரிடம் விண்ணப்பிக்கவும்.',
    howToGetEnglish: 'Apply through e-Sevai with husband’s death certificate or court desertion/divorce order.',
    tipsTamil: 'VAO மற்றும் வருவாய் ஆய்வாளர் கள விசாரணைக்கு வரும்போது சரியான ஆவணங்களை நேரில் காட்டவும்.',
    tipsEnglish: 'Keep documents ready for the field enquiry by the Village Administrative Officer (VAO).',
  },
  {
    id: 'mcp_card',
    nameTamil: 'தாய் சேய் நல அட்டை (MCP Card / RCH ID)',
    nameEnglish: 'Mother and Child Protection (MCP) Card',
    category: 'சுகாதாரம் / Health',
    whyNeededTamil: 'PMMVY போன்ற கர்ப்பிணி மற்றும் பாலூட்டும் தாய்மார்களுக்கான ₹5,000 உதவித்தொகை பெற வேண்டும்.',
    whyNeededEnglish: 'Mandatory for maternity cash incentives under PMMVY and state health schemes.',
    howToGetTamil: 'கர்ப்பம் தரித்தவுடன் அருகிலுள்ள அரசு ஆரம்ப சுகாதார நிலையம் (PHC) அல்லது அங்கன்வாடியில் பதிவு செய்து பெறலாம்.',
    howToGetEnglish: 'Register pregnancy early at the nearest Primary Health Centre (PHC) or Anganwadi Center.',
    tipsTamil: 'ஒவ்வொரு மருத்துவ பரிசோதனை மற்றும் தடுப்பூசி விவரங்களையும் அட்டையில் முறையாகப் பதிவு செய்ய வேண்டும்.',
    tipsEnglish: 'Ensure every antenatal check-up and child vaccination date is stamped in the card.',
  },
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({ language }) => {
  const isTamil = language === 'ta';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = COMMON_DOCS.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.nameTamil.toLowerCase().includes(q) ||
      doc.nameEnglish.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q)
    );
  });

  const handleListenDoc = (doc: DocGuideItem) => {
    const text = isTamil
      ? `${doc.nameTamil}. ஏன் தேவை: ${doc.whyNeededTamil}. எப்படி பெறுவது: ${doc.howToGetTamil}. குறிப்பு: ${doc.tipsTamil}`
      : `${doc.nameEnglish}. Why needed: ${doc.whyNeededEnglish}. How to get: ${doc.howToGetEnglish}. Tip: ${doc.tipsEnglish}`;
    voiceService.speak(text, language);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 space-y-6">
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
            📄
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {isTamil ? 'அரசு ஆவணங்கள் வழிகாட்டி' : 'Government Documents Guide'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              {isTamil
                ? 'திட்டங்களுக்கு விண்ணப்பிக்கத் தேவையான முக்கிய ஆவணங்கள் மற்றும் அவற்றை பெறும் எளிய வழிகள்'
                : 'Essential documents for women schemes and simple instructions on how to get them'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isTamil
                ? 'ஆவணத்தின் பெயரைத் தேடவும் (எ.கா: ஆதார், ரேஷன், வருமானம்)...'
                : 'Search document name (e.g. Aadhaar, Ration, Income)...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* Beginner Notice */}
      <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-xs sm:text-sm text-rose-950 flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isTamil
            ? 'அரசு திட்டங்களுக்கு விண்ணப்பிக்க இடைத்தரகர்களுக்கு (brokers) பணம் கொடுக்க வேண்டாம். உங்கள் ஊரில் உள்ள அரசு இ-சேவை மையம் (TN e-Sevai) மூலமாக மட்டுமே விண்ணப்பிக்கவும்.'
            : 'Do not pay middlemen or brokers for government schemes. Apply safely only through authorized Tamil Nadu e-Sevai centers or official portals.'}
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    {doc.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-900 mt-1">
                    {isTamil ? doc.nameTamil : doc.nameEnglish}
                  </h3>
                </div>
                <button
                  onClick={() => handleListenDoc(doc)}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors shadow-2xs"
                  title="Listen explanation"
                >
                  <Volume2 className="w-4 h-4 text-amber-700" />
                </button>
              </div>

              {/* Why needed */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-stone-700 block">
                  {isTamil ? '📌 எதற்காக தேவைப்படுகிறது?' : '📌 Why is this needed?'}
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {isTamil ? doc.whyNeededTamil : doc.whyNeededEnglish}
                </p>
              </div>

              {/* How to get */}
              <div className="text-xs space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <span className="font-bold text-stone-900 block">
                  {isTamil ? '🏢 எங்கு பெறுவது?' : '🏢 Where / How to get?'}
                </span>
                <p className="text-stone-700 leading-relaxed font-medium">
                  {isTamil ? doc.howToGetTamil : doc.howToGetEnglish}
                </p>
              </div>

              {/* Important Tip */}
              <div className="text-xs space-y-1 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/70 text-emerald-950">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isTamil ? 'முக்கிய உதவிக்குறிப்பு:' : 'Important Tip:'}
                </span>
                <p className="leading-relaxed">
                  {isTamil ? doc.tipsTamil : doc.tipsEnglish}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
