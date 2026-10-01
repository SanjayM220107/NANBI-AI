export interface SchemeDocument {
  id: string;
  nameEnglish: string;
  nameTamil: string;
  descriptionEnglish: string;
  descriptionTamil: string;
  whyRequiredEnglish: string;
  whyRequiredTamil: string;
}

export interface SchemeQuestionOption {
  labelEnglish: string;
  labelTamil: string;
  eligible: boolean;
}

export interface SchemeQuestion {
  id: string;
  questionEnglish: string;
  questionTamil: string;
  options: SchemeQuestionOption[];
}

export interface SchemeEligibility {
  summaryEnglish: string;
  summaryTamil: string;
  minAge?: number;
  maxAge?: number;
  targetGroupEnglish: string;
  targetGroupTamil: string;
  incomeLimitEnglish?: string;
  incomeLimitTamil?: string;
  questions: SchemeQuestion[];
}

export interface SchemeBenefits {
  summaryEnglish: string;
  summaryTamil: string;
  detailsEnglish: string[];
  detailsTamil: string[];
  amount?: string;
  frequency?: string;
}

export type SchemeCategory =
  | 'women'
  | 'education'
  | 'finance'
  | 'employment'
  | 'health'
  | 'entrepreneurship';

export interface Scheme {
  id: string;
  nameEnglish: string;
  nameTamil: string;
  scope: 'state' | 'national';
  state: string;
  districts: string[];
  category: SchemeCategory;
  department: {
    english: string;
    tamil: string;
  };
  descriptionEnglish: string;
  descriptionTamil: string;
  eligibility: SchemeEligibility;
  benefits: SchemeBenefits;
  documents: SchemeDocument[];
  applicationMode: 'online' | 'offline_esevei' | 'hybrid';
  applicationPortalName: string;
  applicationStepsEnglish: string[];
  applicationStepsTamil: string[];
  officialSourceUrl: string;
  officialApplyUrl: string | null;
  lastVerified: string;
}

export interface UserProfile {
  name: string;
  ageGroup: '18–25' | '26–40' | '41–60' | '60+' | '';
  state: string;
  district: string;
  language: 'ta' | 'en';
}

export const TAMIL_NADU_DISTRICTS: { english: string; tamil: string }[] = [
  { english: 'Ariyalur', tamil: 'அரியலூர்' },
  { english: 'Chengalpattu', tamil: 'செங்கல்பட்டு' },
  { english: 'Chennai', tamil: 'சென்னை' },
  { english: 'Coimbatore', tamil: 'கோயம்புத்தூர்' },
  { english: 'Cuddalore', tamil: 'கடலூர்' },
  { english: 'Dharmapuri', tamil: 'தருமபுரி' },
  { english: 'Dindigul', tamil: 'திண்டுக்கல்' },
  { english: 'Erode', tamil: 'ஈரோடு' },
  { english: 'Kallakurichi', tamil: 'கள்ளக்குறிச்சி' },
  { english: 'Kanchipuram', tamil: 'காஞ்சிபுரம்' },
  { english: 'Kanyakumari', tamil: 'கன்னியாகுமரி' },
  { english: 'Karur', tamil: 'கரூர்' },
  { english: 'Krishnagiri', tamil: 'கிருஷ்ணகிரி' },
  { english: 'Madurai', tamil: 'மதுரை' },
  { english: 'Mayiladuthurai', tamil: 'மயிலாடுதுறை' },
  { english: 'Nagapattinam', tamil: 'நாகப்பட்டினம்' },
  { english: 'Namakkal', tamil: 'நாமக்கல்' },
  { english: 'Nilgiris', tamil: 'நீலகிரி' },
  { english: 'Perambalur', tamil: 'பெரம்பலூர்' },
  { english: 'Pudukkottai', tamil: 'புதுக்கோட்டை' },
  { english: 'Ramanathapuram', tamil: 'இராமநாதபுரம்' },
  { english: 'Ranipet', tamil: 'ராணிப்பேட்டை' },
  { english: 'Salem', tamil: 'சேலம்' },
  { english: 'Sivaganga', tamil: 'சிவகங்கை' },
  { english: 'Tenkasi', tamil: 'தென்காசி' },
  { english: 'Thanjavur', tamil: 'தஞ்சாவூர்' },
  { english: 'Theni', tamil: 'தேனி' },
  { english: 'Thoothukudi', tamil: 'தூத்துக்குடி' },
  { english: 'Tiruchirappalli', tamil: 'திருச்சிராப்பள்ளி' },
  { english: 'Tirunelveli', tamil: 'திருநெல்வேலி' },
  { english: 'Tirupathur', tamil: 'திருப்பத்தூர்' },
  { english: 'Tiruppur', tamil: 'திருப்பூர்' },
  { english: 'Tiruvallur', tamil: 'திருவள்ளூர்' },
  { english: 'Tiruvannamalai', tamil: 'திருவண்ணாமலை' },
  { english: 'Tiruvarur', tamil: 'திருவாரூர்' },
  { english: 'Vellore', tamil: 'வேலூர்' },
  { english: 'Viluppuram', tamil: 'விழுப்புரம்' },
  { english: 'Virudhunagar', tamil: 'விருதுநகர்' },
];

export const INDIAN_STATES: { english: string; tamil: string }[] = [
  { english: 'Tamil Nadu', tamil: 'தமிழ்நாடு' },
  { english: 'Andhra Pradesh', tamil: 'ஆந்திரப் பிரதேசம்' },
  { english: 'Karnataka', tamil: 'கர்நாடகா' },
  { english: 'Kerala', tamil: 'கேரளா' },
  { english: 'Telangana', tamil: 'தெலங்கானா' },
  { english: 'Maharashtra', tamil: 'மகாராஷ்டிரா' },
  { english: 'Uttar Pradesh', tamil: 'உத்தரப் பிரதேசம்' },
  { english: 'Rajasthan', tamil: 'ராஜஸ்தான்' },
  { english: 'Gujarat', tamil: 'குஜராத்' },
  { english: 'West Bengal', tamil: 'மேற்கு வங்காளம்' },
  { english: 'Madhya Pradesh', tamil: 'மத்தியப் பிரதேசம்' },
  { english: 'Bihar', tamil: 'பீகார்' },
  { english: 'Odisha', tamil: 'ஒடிசா' },
  { english: 'Punjab', tamil: 'பஞ்சாப்' },
  { english: 'Haryana', tamil: 'ஹரியானா' },
  { english: 'Delhi', tamil: 'தில்லி' },
  { english: 'Puducherry', tamil: 'புதுச்சேரி' },
];

export const CATEGORIES_CONFIG: {
  id: SchemeCategory;
  nameEnglish: string;
  nameTamil: string;
  icon: string;
  badgeBg: string;
}[] = [
  {
    id: 'women',
    nameEnglish: 'Women-focused schemes',
    nameTamil: 'பெண்களுக்கான திட்டங்கள்',
    icon: '👩',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'education',
    nameEnglish: 'Education',
    nameTamil: 'கல்வி',
    icon: '🎓',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'finance',
    nameEnglish: 'Financial Assistance',
    nameTamil: 'நிதி உதவி',
    icon: '💰',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'employment',
    nameEnglish: 'Employment',
    nameTamil: 'வேலைவாய்ப்பு',
    icon: '💼',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'health',
    nameEnglish: 'Health',
    nameTamil: 'சுகாதாரம்',
    icon: '🏥',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'entrepreneurship',
    nameEnglish: 'Entrepreneurship',
    nameTamil: 'சுயதொழில்',
    icon: '🚀',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
];

import schemesJson from '../../data/schemes.json' with { type: 'json' };
export const SCHEMES: Scheme[] = schemesJson as Scheme[];
