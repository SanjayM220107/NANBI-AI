import React from 'react';
import { Home, Layers, MessageSquareQuote, FileText, Settings } from 'lucide-react';

export type NavTab = 'home' | 'schemes' | 'ask' | 'documents' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: 'ta' | 'en';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const isTamil = language === 'ta';

  const navItems: { id: NavTab; labelTa: string; labelEn: string; icon: any; isCenter?: boolean }[] = [
    { id: 'home', labelTa: 'முகப்பு', labelEn: 'Home', icon: Home },
    { id: 'schemes', labelTa: 'திட்டங்கள்', labelEn: 'Schemes', icon: Layers },
    {
      id: 'ask',
      labelTa: 'கேளுங்கள்',
      labelEn: 'Ask NANBI',
      icon: MessageSquareQuote,
      isCenter: true,
    },
    { id: 'documents', labelTa: 'ஆவணங்கள்', labelEn: 'Documents', icon: FileText },
    { id: 'settings', labelTa: 'அமைப்புகள்', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label={isTamil ? 'முதன்மை வழிசெலுத்தல்' : 'Main navigation'}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg"
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-all active:scale-95 ${
                    isActive
                      ? 'bg-rose-700 ring-4 ring-rose-200 scale-105'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                    isActive ? 'text-rose-700 font-black' : 'text-stone-700'
                  }`}
                >
                  {isTamil ? item.labelTa : item.labelEn}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
                isActive
                  ? 'text-rose-700 font-extrabold'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-rose-50 text-rose-700 scale-105' : ''
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] leading-none font-semibold truncate max-w-[64px]">
                {isTamil ? item.labelTa : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
