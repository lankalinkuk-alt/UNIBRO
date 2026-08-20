import React, { useState } from 'react';
import { Language } from '../types';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  LayoutDashboard, 
  UserPlus, 
  Clock, 
  Calculator, 
  Printer, 
  Database,
  ArrowRight
} from 'lucide-react';

interface OnboardingTourProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (view: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config') => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  language,
  isOpen,
  onClose,
  onNavigateToModule
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: {
        en: '1. Executive Real-Time Dashboard',
        ta: '1. நிகழ்நேர கட்டுப்பாட்டு பலகை',
        si: '1. ප්‍රධාන පාලක පුවරුව'
      },
      subtitle: {
        en: 'Factory Live Workforce Attendance Monitor',
        ta: 'தொழிற்சாலை நேரடி வருகை கண்காணிப்பு',
        si: 'කර්මාන්තශාලා සජීවී පැමිණීම් අධීක්ෂණය'
      },
      description: {
        en: 'Your operational cockpit: View active workers currently on the factory floor, leaves, late arrivals, and live biometric terminal status for Hikvision DS-K1A8503MF.',
        ta: 'தொழிற்சாலையில் தற்போது பணிபுரியும் ஊழியர்கள், விடுப்புகள், தாமத வருகைகள் மற்றும் ஹிக்விஷன் கைரேகை இயந்திரத்தின் ஆன்லைன் நிலையை உடனடியாக அறிந்துகொள்ளலாம்.',
        si: 'සේවයට වාර්තා කළ සේවකයින්, නිවාඩු, ප්‍රමාද වීම් සහ Hikvision ඇඟිලි සලකුණු යන්ත්‍රයේ සජීවී තත්ත්වය මෙහිදී බලාගත හැක.'
      },
      icon: LayoutDashboard,
      color: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-100 text-emerald-800',
      actionView: 'dashboard' as const,
      actionText: {
        en: 'Explore Dashboard',
        ta: 'Dashboard பார்க்கவும்',
        si: 'Dashboard බලන්න'
      }
    },
    {
      title: {
        en: '2. Register Employees & NIC',
        ta: '2. ஊழியர் பதிவு மற்றும் விபரம்',
        si: '2. සේවකයින් ලියාපදිංචි කිරීම'
      },
      subtitle: {
        en: 'Trilingual Names & Statutory Schemes',
        ta: 'மும்மொழி பெயர்கள் & சம்பள திட்டங்கள்',
        si: 'භාෂා ත්‍රිත්ව නම් සහ වැටුප් ක්‍රම'
      },
      description: {
        en: 'Add factory workers with English, Tamil, and Sinhala names, NIC, designated department, EPF/ETF statutory eligibility flags, and bank disbursement accounts.',
        ta: 'ஆங்கிலம், தமிழ், சிங்களப் பெயர்கள், அடையாள அட்டை, பிரிவு, EPF/ETF தெரிவுகள் மற்றும் வங்கி விபரங்களுடன் புதிய ஊழியர்களை எளிதாக பதிவு செய்யுங்கள்.',
        si: 'ඉංග්‍රීසි, දෙමළ සහ සිංහල නම්, ජාතික හැඳුනුම්පත් අංකය, EPF/ETF තේරීම් සහ බැංකු ගිණුම් විස්තර සමඟ සේවකයින් ලියාපදිංචි කරන්න.'
      },
      icon: UserPlus,
      color: 'from-violet-500 to-purple-600',
      badge: 'bg-violet-100 text-violet-800',
      actionView: 'employees' as const,
      actionText: {
        en: 'Manage Employees',
        ta: 'ஊழியர் பகுதிக்கு செல்ல',
        si: 'සේවක ලේඛනයට යන්න'
      }
    },
    {
      title: {
        en: '3. Biometric & Manual Attendance',
        ta: '3. வருகை பதிவு & கைரேகை இயந்திரம்',
        si: '3. පැමිණීම සහ ඇඟිලි සලකුණු'
      },
      subtitle: {
        en: 'Automatic Work Hours & Break Deductions',
        ta: 'தானியங்கி வேலை நேரம் & இடைவேளை கழிவு',
        si: 'ස්වයංක්‍රීය වැඩ පැය සහ විවේක කාලය'
      },
      description: {
        en: 'Terminal logs sync automatically over factory LAN. The system matches IN/OUT punches, deducts lunch breaks, flags late arrivals, and calculates overtime.',
        ta: 'ஹிக்விஷன் இயந்திரத்திலிருந்து வருகை தானாகவே பெறப்படுகிறது. வேலை செய்த நேரம், மதிய உணவு இடைவேளை கழிவு மற்றும் மேலதிக நேரம் துல்லியமாக கணக்கிடப்படுகிறது.',
        si: 'Hikvision යන්ත්‍රයෙන් දත්ත ස්වයංක්‍රීයව සමමුහුර්ත වේ. සේවය කළ පැය, විවේක කාලය සහ අතිකාල නිවැරදිව ගණනය වේ.'
      },
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      badge: 'bg-amber-100 text-amber-800',
      actionView: 'config' as const,
      actionText: {
        en: 'Biometric Settings',
        ta: 'கைரேகை அமைப்புகள்',
        si: 'ඇඟිලි සලකුණු සැකසුම්'
      }
    },
    {
      title: {
        en: '4. Run Statutory Monthly Payroll',
        ta: '4. மாதாந்த சம்பளக் கணக்கீடு',
        si: '4. මාසික වැටුප් ගණනය කිරීම'
      },
      subtitle: {
        en: '25-Day Rule, Incentives & EPF/ETF (8%+12%+3%)',
        ta: '25-நாள் விதி, ஊக்கத்தொகை & EPF/ETF',
        si: 'දින 25 නීතිය, දිරිදීමනා සහ EPF/ETF'
      },
      description: {
        en: 'Execute 1-click payroll runs factoring Basic Salary, 25-day No-Pay deductions, production bonuses, holiday OT multipliers, and employee 8% EPF deductions.',
        ta: 'அடிப்படை சம்பளம், 25-நாள் விடுமுறை கழிவு, உற்பத்தி போனஸ், விசேட OT மற்றும் 8% EPF கழிவுகளுடன் ஒரே கிளிக்கில் மாதாந்த சம்பளத்தை கணக்கிடுங்கள்.',
        si: 'මූලික වැටුප, දින 25 කැපීම්, නිෂ්පාදන බෝනස්, විශේෂ OT සහ 8% EPF සමඟ තනි ක්ලික් එකකින් වැටුප් ගණනය කරන්න.'
      },
      icon: Calculator,
      color: 'from-emerald-600 to-green-700',
      badge: 'bg-emerald-100 text-emerald-800',
      actionView: 'run-payroll' as const,
      actionText: {
        en: 'Open Run Payroll',
        ta: 'சம்பளப் பகுதிக்கு செல்ல',
        si: 'වැටුප් පද්ධතියට යන්න'
      }
    },
    {
      title: {
        en: '5. Batch Payslip Printing (4 on A4)',
        ta: '5. சம்பள சீட்டு அச்சிடுதல் (A4 இல் 4)',
        si: '5. පඩිපත් මුද්‍රණය (A4 පිටුවක 4)'
      },
      subtitle: {
        en: 'Cost-Saving Perforated Layout & Bank File',
        ta: 'செலவு குறைக்கும் A4 வடிவம் & வங்கி கோப்பு',
        si: 'වියදම් අවම A4 පඩිපත් සහ බැංකු ගොනු'
      },
      description: {
        en: 'Print all employee payslips formatted 4 per A4 sheet with company header and signature boxes. Export the Commercial Bank PayMaster text file for direct salary disbursals.',
        ta: 'A4 தாளில் 4 சம்பள சீட்டுகளை நிறுவன முத்திரை மற்றும் கையொப்பப் பெட்டிகளுடன் அச்சிடுங்கள். வங்கியின் PayMaster கோப்பையும் உடனடியாகப் பெறுங்கள்.',
        si: 'තනි A4 පිටුවක පඩිපත් 4ක් ආයතනික ලාංඡනය සමඟ මුද්‍රණය කරන්න. Commercial Bank PayMaster ගොනුව ක්ෂණිකව ලබාගන්න.'
      },
      icon: Printer,
      color: 'from-indigo-500 to-blue-600',
      badge: 'bg-indigo-100 text-indigo-800',
      actionView: 'run-payroll' as const,
      actionText: {
        en: 'View Payslips',
        ta: 'சம்பள சீட்டுகள்',
        si: 'පඩිපත් බලන්න'
      }
    },
    {
      title: {
        en: '6. Daily Safe Backup & Recovery',
        ta: '6. தினசரி காப்புப்பிரதி பாதுகாப்பு',
        si: '6. දෛනික දත්ත උපස්ථ සහ ආරක්ෂාව'
      },
      subtitle: {
        en: 'Admin ZIP Archive & Instant Restore',
        ta: 'நிர்வாகி ZIP ஆவணம் & உடனடி மீட்டெடுப்பு',
        si: 'ආරක්ෂිත ZIP උපස්ථ සහ ප්‍රතිසාධනය'
      },
      description: {
        en: 'Download encrypted daily ZIP packages containing your SQLite database, Excel registers, and company configuration. Protect your records against hardware failure with 1-click restore.',
        ta: 'SQLite தரவுத்தளம் மற்றும் எக்செல் ஆவணங்களுடன் கூடிய தினசரி ZIP கோப்பை பதிவிறக்கம் செய்து கணினியை பாதுகாப்பாக வைத்திருங்கள்.',
        si: 'SQLite දත්ත සමුදාය සහ එක්සෙල් ගොනු සහිත දෛනික ZIP උපස්ථ ලබාගෙන දත්ත සුරක්ෂිත කරගන්න.'
      },
      icon: Database,
      color: 'from-amber-600 to-red-600',
      badge: 'bg-amber-100 text-amber-800',
      actionView: 'config' as const,
      actionText: {
        en: 'Backup Center',
        ta: 'காப்புப்பிரதி பகுதி',
        si: 'උපස්ථ පද්ධතිය'
      }
    }
  ];

  const step = tourSteps[currentStep];
  const IconComponent = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    if (onNavigateToModule) {
      onNavigateToModule(step.actionView);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className={`bg-gradient-to-r ${step.color} p-6 text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-1">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                {step.title[language] || step.title.en}
              </h3>
            </div>
          </div>
          <p className="text-xs text-white/80 font-medium">
            {step.subtitle[language] || step.subtitle.en}
          </p>
        </div>

        {/* Tour Body */}
        <div className="p-6 space-y-5">
          <p className="text-stone-700 text-sm leading-relaxed">
            {step.description[language] || step.description.en}
          </p>

          {/* Quick Action Button to Navigate */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-stone-600 font-medium">
              Want to try this feature now?
            </span>
            <button
              onClick={handleAction}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 hover:bg-black text-white transition shadow-xs cursor-pointer"
            >
              <span>{step.actionText[language] || step.actionText.en}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-8 bg-emerald-600' 
                    : idx < currentStep 
                    ? 'w-2.5 bg-emerald-300' 
                    : 'w-2 bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              currentStep === 0 
                ? 'text-stone-300 cursor-not-allowed' 
                : 'text-stone-700 hover:bg-stone-200 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition cursor-pointer"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
            >
              <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
