import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface HelpFloatingButtonProps {
  language: Language;
  onClick: () => void;
}

export const HelpFloatingButton: React.FC<HelpFloatingButtonProps> = ({
  language,
  onClick
}) => {
  const label = language === 'ta' ? 'உதவி' : language === 'si' ? 'උපකාර' : 'Help';

  return (
    <button
      id="global-help-floating-btn"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2.5 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center space-x-2 border-2 border-white/20 group cursor-pointer"
      title="Open Help Center"
    >
      <HelpCircle className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-bold tracking-wide">{label}</span>
    </button>
  );
};
