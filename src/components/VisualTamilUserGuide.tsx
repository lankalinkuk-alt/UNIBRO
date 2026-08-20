import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Fingerprint, 
  Calculator, 
  Printer, 
  Download, 
  UploadCloud, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Laptop,
  Check,
  FileSpreadsheet,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { openTamilBiometricGuidePrintWindow } from '../utils/helpPdfGenerator';

interface VisualTamilUserGuideProps {
  onNavigateToModule?: (view: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config') => void;
  onClose?: () => void;
}

export type TamilGuideTaskId = 
  | 'add-employee' 
  | 'configure-hours' 
  | 'mark-attendance' 
  | 'run-payroll' 
  | 'print-4-payslips' 
  | 'download-backup' 
  | 'restore-backup';

interface TaskGuideItem {
  id: TamilGuideTaskId;
  number: number;
  tamilTitle: string;
  tamilSubtitle: string;
  englishTitle: string;
  badgeColor: string;
  themeColor: string;
  icon: React.ElementType;
  targetModule?: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config';
}

export const tamilGuideTasks: TaskGuideItem[] = [
  {
    id: 'add-employee',
    number: 1,
    tamilTitle: '1. புதிய ஊழியரை சேர்த்தல்',
    tamilSubtitle: 'பெயர், NIC எண், சம்பளத் திட்டம் மற்றும் EPF/ETF அமைத்தல்',
    englishTitle: 'Add New Employee',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    themeColor: 'from-indigo-600 to-indigo-800',
    icon: Users,
    targetModule: 'employees'
  },
  {
    id: 'configure-hours',
    number: 2,
    tamilTitle: '2. வேலை நேரங்களை அமைத்தல்',
    tamilSubtitle: 'ஷிப்ட் தொடக்கம், முடிவு நேரம், தாமத சலுகை மற்றும் மதிய உணவு இடைவேளை',
    englishTitle: 'Configure Working Hours & Shifts',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    themeColor: 'from-sky-600 to-blue-800',
    icon: Clock,
    targetModule: 'salary-schemes'
  },
  {
    id: 'mark-attendance',
    number: 3,
    tamilTitle: '3. வருகையை பதிவு செய்தல் & கைரேகை இயந்திரம்',
    tamilSubtitle: 'Hikvision கைரேகை பஞ்ச் ஒத்திசைவு அல்லது கைமுறை வருகைப் பதிவு',
    englishTitle: 'Mark Attendance & Biometric Sync',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    themeColor: 'from-emerald-600 to-teal-800',
    icon: Fingerprint,
    targetModule: 'dashboard'
  },
  {
    id: 'run-payroll',
    number: 4,
    tamilTitle: '4. மாதாந்த சம்பளக் கணக்கீடு செய்தல்',
    tamilSubtitle: '25-நாள் விதி கழிவுகள், OT படிகள் மற்றும் EPF 8% பிடித்தம் செய்தல்',
    englishTitle: 'Run Monthly Payroll Calculation',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    themeColor: 'from-purple-600 to-indigo-800',
    icon: Calculator,
    targetModule: 'run-payroll'
  },
  {
    id: 'print-4-payslips',
    number: 5,
    tamilTitle: '5. ஒரு A4 தாளில் 4 சம்பள சீட்டுகள் அச்சிடுதல்',
    tamilSubtitle: 'காகித செலவைக் குறைக்கும் 4-on-A4 மைக்ரோ சம்பள சீட்டு அச்சுமுறை',
    englishTitle: 'Print 4 Payslips per A4 Sheet',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    themeColor: 'from-amber-600 to-orange-700',
    icon: Printer,
    targetModule: 'run-payroll'
  },
  {
    id: 'download-backup',
    number: 6,
    tamilTitle: '6. தரவு காப்புப்பிரதி (Backup) பதிவிறக்கம் செய்தல்',
    tamilSubtitle: 'கணினி பழுதானாலும் பாதுகாப்பாக இருக்க SQLite & ZIP காப்புப்பிரதி எடுத்தல்',
    englishTitle: 'Download Database Backup (.db / .zip)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    themeColor: 'from-teal-600 to-emerald-800',
    icon: Download,
    targetModule: 'config'
  },
  {
    id: 'restore-backup',
    number: 7,
    tamilTitle: '7. காப்புப்பிரதியை மீட்டமைத்தல் (Restore Backup)',
    tamilSubtitle: 'பழைய தரவு கோப்பை பதிவேற்றி அனைத்து தகவல்களையும் மீளப்பெறுதல்',
    englishTitle: 'Restore Database from Backup File',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    themeColor: 'from-rose-600 to-red-800',
    icon: UploadCloud,
    targetModule: 'config'
  }
];

export const VisualTamilUserGuide: React.FC<VisualTamilUserGuideProps> = ({
  onNavigateToModule,
  onClose
}) => {
  const [activeTaskId, setActiveTaskId] = useState<TamilGuideTaskId>('add-employee');

  const currentTask = tamilGuideTasks.find(t => t.id === activeTaskId) || tamilGuideTasks[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-stone-900">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-900/50">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>விளக்கப்படங்களுடன் கூடிய காட்சி வழிகாட்டி (Visual Tamil Step-by-Step Guide)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              7 முக்கிய பணிகளுக்கான தமிழ் காட்சி கையேடு
            </h1>
            <p className="text-sm sm:text-base text-stone-300 mt-2 max-w-2xl leading-relaxed">
              தொழில்நுட்ப அறிவு இல்லாத எவரும் இலகுவாகப் புரிந்துகொள்ளும் வகையில் வண்ணமயமான படங்கள், அம்புக்குறிகள் மற்றும் பெரிய தமிழ் விளக்கங்களுடன் வடிவமைக்கப்பட்டுள்ளது.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 flex items-center space-x-2 cursor-pointer shadow-xs"
              title="A4 கையேட்டை அச்சிடுங்கள்"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>கையேட்டை அச்சிடுங்கள் (Print A4)</span>
            </button>
            {currentTask.targetModule && onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule(currentTask.targetModule!)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <span>நேரடி பக்கத்திற்குச் செல்லவும்</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Task Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {tamilGuideTasks.map((task) => {
            const Icon = task.icon;
            const isActive = activeTaskId === task.id;
            return (
              <button
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black ${
                  isActive ? 'bg-white text-indigo-900' : 'bg-white/20 text-white'
                }`}>
                  {task.number}
                </div>
                <span>{task.englishTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Task Illustration Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden p-6 sm:p-8 space-y-8">
        
        {/* Active Task Heading Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-start space-x-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentTask.themeColor} text-white flex items-center justify-center shadow-md shrink-0`}>
              <currentTask.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${currentTask.badgeColor}`}>
                  பணி {currentTask.number} • TASK #{currentTask.number}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {currentTask.englishTitle}
                </span>
              </div>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                {currentTask.tamilTitle}
              </h2>
              <p className="text-sm text-stone-600 font-medium mt-0.5">
                {currentTask.tamilSubtitle}
              </p>
            </div>
          </div>

          {currentTask.targetModule && onNavigateToModule && (
            <button
              onClick={() => onNavigateToModule(currentTask.targetModule!)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition cursor-pointer self-start sm:self-auto"
            >
              <span>இப்போதே செய்ய கிளிக் செய்க</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* DYNAMIC ILLUSTRATION PANEL FOR EACH OF THE 7 TASKS */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-2xs">
          
          {/* TASK 1: ADD EMPLOYEE */}
          {activeTaskId === 'add-employee' && (
            <div className="space-y-6">
              
              {/* Illustrated Flow Banner */}
              <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
                <h3 className="text-lg font-black text-amber-300 flex items-center mb-4">
                  <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
                  ஊழியர் பதிவு செயல்முறை வரைபடம் (Step-by-Step Flow)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  
                  {/* Step 1 Box */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded-xl relative">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center mb-2 shadow-xs">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-white">ஊழியர் விபரம்</h4>
                    <p className="text-xs text-stone-200 mt-1">
                      ஆங்கிலம் & தமிழில் பெயர், NIC தேசிய அடையாள அட்டை எண்.
                    </p>
                    <div className="mt-2 text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-mono">
                      NIC: 199012345678
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden md:flex items-center justify-center text-amber-300">
                    <ArrowRight className="w-6 h-6 animate-pulse" />
                  </div>

                  {/* Step 2 Box */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded-xl relative">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center mb-2 shadow-xs">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-white">சம்பளத் திட்டம்</h4>
                    <p className="text-xs text-stone-200 mt-1">
                      அடிப்படைச் சம்பளம், பட்ஜெட் படி, 25-நாள் விதி தெரிவு.
                    </p>
                    <div className="mt-2 text-[10px] bg-sky-400/20 text-sky-200 px-2 py-0.5 rounded font-mono">
                      Scheme: Garment Staff
                    </div>
                  </div>

                  {/* Step 3 Box */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded-xl relative">
                    <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-900 font-black text-xs flex items-center justify-center mb-2 shadow-xs">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-emerald-300">சேமித்து முடிக்க</h4>
                    <p className="text-xs text-stone-200 mt-1">
                      EPF/ETF & வங்கி விபரங்களை வழங்கி Save பொத்தானை அழுத்தவும்.
                    </p>
                    <div className="mt-2 text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded font-mono">
                      EPF: 8% + 12% | ETF: 3%
                    </div>
                  </div>

                </div>
              </div>

              {/* Large Visual Screen Mockup with Annotated Directional Arrows */}
              <div className="bg-white rounded-2xl border-2 border-indigo-300 p-6 shadow-sm relative">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-stone-700 ml-2">ஊழியர் பதிவு திரை மாதிரி (Employee Form Visual Mockup)</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    நவா லேடி HRM
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                  
                  {/* Left Column: Form Inputs with Visual Callouts */}
                  <div className="space-y-4">
                    
                    {/* Callout 1 */}
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl relative group">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-indigo-950 flex items-center">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] mr-1.5 font-bold">1</span>
                          முழுப் பெயர் (ஆங்கிலம் & தமிழ்)
                        </label>
                        <span className="text-[10px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-bold">முக்கியம்</span>
                      </div>
                      <input 
                        type="text" 
                        readOnly 
                        value="Kamal Perera (கமல் பெரேரா)" 
                        className="w-full bg-white border border-indigo-300 rounded-lg p-2 text-xs font-bold text-stone-800"
                      />
                      <p className="text-[11px] text-indigo-700 mt-1 font-medium">
                        👉 சம்பள சீட்டுகளில் தமிழ் மற்றும் சிங்கள பெயர்கள் தானாக அச்சிடப்படும்.
                      </p>
                    </div>

                    {/* Callout 2 */}
                    <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-sky-950 flex items-center">
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] mr-1.5 font-bold">2</span>
                          தேசிய அடையாள அட்டை எண் (NIC) & EPF எண்
                        </label>
                        <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-bold">மத்திய வங்கி விதி</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value="NIC: 199254301298" 
                          className="bg-white border border-sky-300 rounded-lg p-2 text-xs font-mono font-bold text-stone-800"
                        />
                        <input 
                          type="text" 
                          readOnly 
                          value="EPF No: 0452" 
                          className="bg-white border border-sky-300 rounded-lg p-2 text-xs font-mono font-bold text-stone-800"
                        />
                      </div>
                      <p className="text-[11px] text-sky-700 mt-1 font-medium">
                        👉 இலங்கை மத்திய வங்கியின் C-படிவத்திற்கு சரியான NIC எண் அவசியம்.
                      </p>
                    </div>

                    {/* Callout 3 */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-amber-950 flex items-center">
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] mr-1.5 font-bold">3</span>
                          சம்பளத் திட்டம் (Salary Scheme)
                        </label>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">25-நாள் விதி</span>
                      </div>
                      <select className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold text-stone-800">
                        <option>ஆடை உற்பத்தி பிரிவு (Garment Staff Scheme A - LKR 45,000)</option>
                      </select>
                      <p className="text-[11px] text-amber-800 mt-1 font-medium">
                        👉 25 நாள் வேலை செய்தவருக்கு முழு கொடுப்பனவும், குறைந்தால் விகிதாசார கழிவும் நடக்கும்.
                      </p>
                    </div>

                  </div>

                  {/* Right Column: Bank & Confirmation Checklist */}
                  <div className="space-y-4 flex flex-col justify-between">
                    
                    {/* Callout 4 */}
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-emerald-950 flex items-center">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] mr-1.5 font-bold">4</span>
                          வங்கி விபரங்கள் (Bank PayMaster)
                        </label>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">Auto Transfer</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white p-2 rounded border border-emerald-300 flex justify-between">
                          <span className="text-stone-500 font-bold">Bank Name:</span>
                          <span className="font-bold text-stone-900">Commercial Bank of Ceylon (7010)</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-300 flex justify-between">
                          <span className="text-stone-500 font-bold">Account No:</span>
                          <span className="font-mono font-bold text-stone-900">8004592019</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                        👉 சம்பள தினத்தில் வங்கியின் மென்பொருளில் நேரடியாக ஏற்றும் TXT கோப்பு தயாராகும்.
                      </p>
                    </div>

                    {/* Glowing Save Button with Directional Guide */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-dashed border-indigo-400 rounded-2xl text-center relative">
                      <div className="inline-flex items-center space-x-1.5 bg-indigo-600 text-white font-black text-sm px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition transform cursor-pointer">
                        <Check className="w-4 h-4" />
                        <span>ஊழியரை சேமிக்கவும் (Save Employee)</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1 text-xs font-extrabold text-indigo-900 mt-2">
                        <ArrowDown className="w-4 h-4 text-indigo-600 animate-bounce" />
                        <span>இறுதியாக இந்த நீல நிற பொத்தானை அழுத்தவும்!</span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Pro Tips Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-950">முக்கிய குறிப்பு (Pro Tip):</h5>
                  <p className="mt-0.5 leading-relaxed">
                    ஊழியருக்கு கைரேகை இயந்திரத்தில் வழங்கப்பட்ட <strong>Enrollment ID</strong> எண்ணும் இந்த கணினியில் உள்ள <strong>Employee No</strong> எண்ணும் ஒன்றாக இருப்பதை உறுதி செய்து கொள்ளுங்கள்.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TASK 2: CONFIGURE WORKING HOURS */}
          {activeTaskId === 'configure-hours' && (
            <div className="space-y-6">
              
              {/* Illustrated Visual Shift Clock Banner */}
              <div className="bg-gradient-to-r from-sky-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-black text-amber-300 flex items-center mb-3">
                  <Clock className="w-5 h-5 mr-2 text-amber-400" />
                  வேலை நேர வரைபடம் (Daily Shift Schedule Layout)
                </h3>
                <p className="text-xs text-stone-300 mb-4 max-w-2xl leading-relaxed">
                  நவா லேடி அமைப்பில் ஷிப்ட் ஆரம்பம், சலுகை நேரம் (Grace Time), உணவு இடைவேளை மற்றும் மேலதிக நேரங்களை (OT) துல்லியமாக அமைக்கும் முறை.
                </p>

                {/* Timeline Visual Illustration */}
                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                    
                    <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-lg">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase block">1. ஷிப்ட் ஆரம்பம்</span>
                      <span className="text-lg font-black text-white">08:30 AM</span>
                      <span className="text-[10px] text-emerald-200 block mt-1">+15 நிமிடம் சலுகை (Grace)</span>
                    </div>

                    <div className="bg-amber-500/20 border border-amber-400/40 p-3 rounded-lg">
                      <span className="text-[10px] text-amber-300 font-bold uppercase block">2. மதிய உணவு இடைவேளை</span>
                      <span className="text-lg font-black text-white">12:30 - 01:15 PM</span>
                      <span className="text-[10px] text-amber-200 block mt-1">45 நிமிடம் தானாக கழியும்</span>
                    </div>

                    <div className="bg-sky-500/20 border border-sky-400/40 p-3 rounded-lg">
                      <span className="text-[10px] text-sky-300 font-bold uppercase block">3. ஷிப்ட் முடிவு</span>
                      <span className="text-lg font-black text-white">05:00 PM</span>
                      <span className="text-[10px] text-sky-200 block mt-1">8 மணிநேர சாதாரண வேலை</span>
                    </div>

                    <div className="bg-indigo-500/20 border border-indigo-400/40 p-3 rounded-lg">
                      <span className="text-[10px] text-indigo-300 font-bold uppercase block">4. மேலதிக நேரம் (OT)</span>
                      <span className="text-lg font-black text-amber-300">05:00 PM க்குப் பின்</span>
                      <span className="text-[10px] text-indigo-200 block mt-1">1.5x அல்லது 2.0x பெருக்கி</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Interactive Configuration Screen Mockup */}
              <div className="bg-white rounded-2xl border-2 border-sky-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                  <h4 className="text-sm font-black text-sky-950 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-sky-600" />
                    வேலை நேர அமைவு திரை (Working Hours Configuration Panel)
                  </h4>
                  <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                    Shift Config v4.8
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Left: Timing Controls */}
                  <div className="space-y-4 bg-sky-50/50 p-4 rounded-xl border border-sky-200">
                    <h5 className="font-extrabold text-xs text-sky-900 uppercase tracking-wider">
                      நேர அளவுருக்கள் (Timing Parameters)
                    </h5>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-stone-700 mb-1">
                          <span>வேலை ஆரம்ப நேரம் (Shift Start):</span>
                          <span className="text-indigo-600 font-mono">08:30 AM</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          👉 ஊழியர்கள் காலையில் பணிக்கு வருகை தர வேண்டிய ஆரம்ப நேரம்.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-stone-700 mb-1">
                          <span>தாமத சலுகை நேரம் (Grace Period):</span>
                          <span className="text-emerald-600 font-mono font-bold">15 Minutes</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          👉 08:45 வரை வரும் ஊழியர்களுக்கு தாமதக் கழிவு செய்யப்படாது.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-stone-700 mb-1">
                          <span>வேலை முடிவு நேரம் (Shift End):</span>
                          <span className="text-indigo-600 font-mono">05:00 PM</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          👉 இந்த நேரத்திற்குப் பிறகு செய்யப்படும் வேலை OT ஆகக் கருதப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Half Day & Break Rules */}
                  <div className="space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                    <h5 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                      இடைவேளை & அரை நாள் விதிகள் (Break & Rules)
                    </h5>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-stone-700 mb-1">
                          <span>மதிய உணவு இடைவேளை கழிவு:</span>
                          <span className="text-amber-700 font-mono font-bold">45 Minutes</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          👉 வருகைப் பதிவில் இருந்து 45 நிமிடங்கள் தானாகக் கழிக்கப்படும்.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-stone-700 mb-1">
                          <span>அரை நாள் வேலை வரம்பு (Half-Day Limit):</span>
                          <span className="text-purple-700 font-mono font-bold">4.5 Hours</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          👉 4.5 மணிநேரத்திற்கு குறைவாக பணிபுரிந்தால் அது அரை நாளாகக் கணக்கிடப்படும்.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-stone-700 mb-1">
                          <span>ஞாயிறு / விடுமுறை OT விகிதம்:</span>
                          <span className="text-rose-700 font-mono font-bold">2.0x Double Rate</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          👉 போயா மற்றும் விசேட விடுமுறை நாட்களில் இரட்டிப்பு OT கணக்கிடப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save Confirmation */}
                <div className="mt-5 pt-4 border-t border-stone-200 flex justify-end">
                  <button className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>நேர அமைப்புகளைப் புதுப்பிக்கவும் (Save Hours)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TASK 3: MARK ATTENDANCE */}
          {activeTaskId === 'mark-attendance' && (
            <div className="space-y-6">
              
              {/* Illustrated Biometric & Attendance Flow */}
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <h3 className="text-lg font-black text-emerald-300 flex items-center">
                    <Fingerprint className="w-5 h-5 mr-2 text-emerald-400" />
                    கைரேகை இயந்திரம் & வருகை பதிவு வரைபடம் (Biometric Sync Workflow)
                  </h3>
                  <button
                    onClick={openTamilBiometricGuidePrintWindow}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
                  >
                    <FileText className="w-4 h-4" />
                    PDF கையேட்டை பதிவிறக்குக / அச்சிடுக
                  </button>
                </div>
                <p className="text-xs text-stone-300 mb-5 max-w-2xl leading-relaxed">
                  Hikvision கைரேகை இயந்திரத்திலிருந்து ஒரு கிளிக் மூலம் அனைத்து ஊழியர்களின் வருகை மற்றும் புறப்பாடு பதிவுகளை UNIBRO SMART APPARELS கணினிக்கு மாற்றும் முறை.
                </p>

                {/* 3 Step Visual Path with Flow Connectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  
                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-2 shadow-md">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-white">ஊழியர் கைரேகை வைத்தல்</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      DS-K1A8503MF இயந்திரத்தில் ஊழியர்கள் விரலை வைக்கும் போது ஒலி கேட்கும்.
                    </p>
                    <span className="inline-block mt-2 text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      "Thank you" Sound
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-emerald-400/40 relative">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 font-black text-sm flex items-center justify-center mx-auto mb-2 shadow-md">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-amber-300">Sync Logs பொத்தானை அழுத்தவும்</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      நவா லேடி முகப்பு பக்கத்தில் உள்ள பச்சை நிற <strong>"Sync Punch Logs"</strong> பொத்தானை கிளிக் செய்யவும்.
                    </p>
                    <span className="inline-block mt-2 text-[10px] bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded font-mono">
                      LAN IP: 192.168.1.201
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-400 text-white font-black text-sm flex items-center justify-center mx-auto mb-2 shadow-md">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-indigo-300">தானியங்கி கணக்கீடு</h4>
                    <p className="text-xs text-stone-300 mt-1">
                      வருகை, தாமதம், விடுமுறை மற்றும் OT மணிநேரங்கள் தானாக அட்டவணையில் கணக்கிடப்படும்.
                    </p>
                    <span className="inline-block mt-2 text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                      Present: 42 | Late: 2 | OT: 18h
                    </span>
                  </div>

                </div>
              </div>

              {/* Attendance Console Illustration */}
              <div className="bg-white rounded-2xl border-2 border-emerald-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black text-stone-900">இன்றைய வருகை அட்டவணை மாதிரி (Live Attendance Table)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Hikvision Online
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Emp No</th>
                        <th className="p-2.5">ஊழியர் பெயர்</th>
                        <th className="p-2.5">வருகை நேரம் (In)</th>
                        <th className="p-2.5">புறப்பாடு (Out)</th>
                        <th className="p-2.5">வேலை நேரம்</th>
                        <th className="p-2.5">மேலதிக நேரம் (OT)</th>
                        <th className="p-2.5 rounded-r-lg">நிலை</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      <tr className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono font-bold">EMP-001</td>
                        <td className="p-2.5 font-bold text-stone-900">கமல் பெரேரா (Kamal)</td>
                        <td className="p-2.5 text-emerald-700 font-mono font-bold">08:24 AM</td>
                        <td className="p-2.5 text-stone-700 font-mono">06:30 PM</td>
                        <td className="p-2.5 text-stone-700 font-mono">9h 21m</td>
                        <td className="p-2.5 text-indigo-700 font-mono font-bold">+1.5 hrs</td>
                        <td className="p-2.5"><span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">Present</span></td>
                      </tr>
                      <tr className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono font-bold">EMP-002</td>
                        <td className="p-2.5 font-bold text-stone-900">பாத்திமா நஸ்ரின் (Fathima)</td>
                        <td className="p-2.5 text-amber-700 font-mono font-bold">08:52 AM</td>
                        <td className="p-2.5 text-stone-700 font-mono">05:00 PM</td>
                        <td className="p-2.5 text-stone-700 font-mono">7h 23m</td>
                        <td className="p-2.5 text-stone-400 font-mono">0.0 hrs</td>
                        <td className="p-2.5"><span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">Late (7m)</span></td>
                      </tr>
                      <tr className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono font-bold">EMP-003</td>
                        <td className="p-2.5 font-bold text-stone-900">சுனில் சில்வா (Sunil)</td>
                        <td className="p-2.5 text-stone-400 font-mono">--:--</td>
                        <td className="p-2.5 text-stone-400 font-mono">--:--</td>
                        <td className="p-2.5 text-stone-400 font-mono">0h 00m</td>
                        <td className="p-2.5 text-stone-400 font-mono">0.0 hrs</td>
                        <td className="p-2.5"><span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">Approved Leave</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <span className="font-bold">
                    💡 கைமுறை வருகை பதிவு (Manual Entry): இயந்திரம் இல்லாத போது "Mark Attendance" பொத்தானை அழுத்தி நேரடியாக பதியலாம்.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TASK 4: RUN PAYROLL */}
          {activeTaskId === 'run-payroll' && (
            <div className="space-y-6">
              
              {/* Illustrated Payroll Sequence Banner */}
              <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-black text-amber-300 flex items-center mb-3">
                  <Calculator className="w-5 h-5 mr-2 text-amber-400" />
                  சம்பளக் கணக்கீட்டு படிமுறை ஓட்டம் (Payroll Calculation Workflow)
                </h3>
                <p className="text-xs text-stone-300 mb-5 max-w-2xl leading-relaxed">
                  இலங்கை தொழில் சட்டங்கள், 25-நாள் வருகை விதி, EPF 8% + 12%, ETF 3% மற்றும் OT படிகளை உள்ளடக்கிய 4 படிமுறை கணக்கீடு.
                </p>

                {/* 4 Steps Visual Chain with Arrows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
                  
                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      1
                    </span>
                    <h5 className="font-bold text-xs text-white">மாதம் தெரிவு செய்</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      எ.கா: 2026-08 (ஆகஸ்ட் மாதம்)
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20">
                    <span className="w-6 h-6 rounded-full bg-sky-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      2
                    </span>
                    <h5 className="font-bold text-xs text-sky-200">25-நாள் விதி சரிபார்ப்பு</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      25 நாள் வேலை செய்தவருக்கு முழு படி, குறைந்தால் கழிவு.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      3
                    </span>
                    <h5 className="font-bold text-xs text-emerald-200">OT & படிகள் கூட்டுதல்</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      OT மணிநேரங்கள் மற்றும் உற்பத்தி இலக்கு படிகள் கூடும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-purple-400/40">
                    <span className="w-6 h-6 rounded-full bg-purple-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      4
                    </span>
                    <h5 className="font-bold text-xs text-purple-200">EPF கழித்து இறுதி செய்</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      EPF 8% கழித்து நிகர சம்பளம் (Net Salary) இறுதி செய்யப்படும்.
                    </p>
                  </div>

                </div>
              </div>

              {/* Visual Payslip Math Formula Box */}
              <div className="bg-white rounded-2xl border-2 border-purple-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                  <h4 className="text-sm font-black text-purple-950 flex items-center">
                    <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                    சம்பள சூத்திரம் (Sri Lankan Statutory Salary Breakdown)
                  </h4>
                  <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                    Standard Formula
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Total Earnings */}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <h5 className="font-extrabold text-emerald-900 uppercase text-[11px] border-b border-emerald-200 pb-1">
                      (+) மொத்த வருமானம் (Total Earnings)
                    </h5>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>அடிப்படைச் சம்பளம் (Basic):</span>
                      <span className="font-mono font-bold">LKR 45,000</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>பட்ஜெட் கொடுப்பனவு (BRA):</span>
                      <span className="font-mono font-bold">LKR 12,500</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>25-நாள் வருகை படி:</span>
                      <span className="font-mono font-bold text-emerald-700">+LKR 8,000</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>மேலதிக நேர கொடுப்பனவு (OT):</span>
                      <span className="font-mono font-bold text-emerald-700">+LKR 6,450</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-300 flex justify-between font-black text-emerald-950">
                      <span>Gross Salary:</span>
                      <span className="font-mono">LKR 71,950</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2">
                    <h5 className="font-extrabold text-rose-900 uppercase text-[11px] border-b border-rose-200 pb-1">
                      (-) பிடித்தங்கள் (Deductions)
                    </h5>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>EPF ஊழியர் பங்கு (8%):</span>
                      <span className="font-mono font-bold text-rose-700">-LKR 4,600</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>முன்பணம் பிடித்தம் (Advance):</span>
                      <span className="font-mono font-bold text-rose-700">-LKR 5,000</span>
                    </div>
                    <div className="flex justify-between font-medium text-stone-700">
                      <span>தாமதக் கழிவு (Late):</span>
                      <span className="font-mono font-bold text-rose-700">-LKR 350</span>
                    </div>
                    <div className="pt-7 border-t border-rose-300 flex justify-between font-black text-rose-950">
                      <span>Total Deductions:</span>
                      <span className="font-mono">LKR 9,950</span>
                    </div>
                  </div>

                  {/* Net Pay & Employer EPF/ETF */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-indigo-900 uppercase text-[11px] border-b border-indigo-200 pb-1">
                        (=) நிகர கொடுப்பனவு (Take-Home Net Pay)
                      </h5>
                      <div className="my-3 text-center">
                        <span className="text-xs text-indigo-700 font-bold block">வழங்கப்பட வேண்டிய நிகர சம்பளம்</span>
                        <span className="text-2xl font-black text-indigo-950 font-mono">LKR 62,000</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-indigo-200 text-[10px] space-y-1">
                      <div className="flex justify-between text-stone-600 font-semibold">
                        <span>முதலாளி EPF (12%):</span>
                        <span className="font-mono font-bold text-stone-900">LKR 6,900</span>
                      </div>
                      <div className="flex justify-between text-stone-600 font-semibold">
                        <span>முதலாளி ETF (3%):</span>
                        <span className="font-mono font-bold text-stone-900">LKR 1,725</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">
                    🔒 "Lock Payroll" பொத்தானை அழுத்திய பின் எவராலும் பதிவுகளை மாற்ற முடியாது.
                  </span>
                  <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>சம்பளக் கணக்கீட்டை தொடங்கு (Run Payroll)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TASK 5: PRINT 4 PAYSLIPS ON A4 */}
          {activeTaskId === 'print-4-payslips' && (
            <div className="space-y-6">
              
              {/* Illustrated 4-on-A4 Paper Concept Banner */}
              <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-black text-amber-300 flex items-center mb-3">
                  <Printer className="w-5 h-5 mr-2 text-amber-400" />
                  A4 தாளில் 4 சம்பள சீட்டுகள் அச்சிடும் முறை (4-on-A4 Layout Concept)
                </h3>
                <p className="text-xs text-stone-300 mb-5 max-w-2xl leading-relaxed">
                  நிறுவன காகித செலவை 75% குறைக்கும் வகையில் ஒரு A4 பக்கத்தில் 4 ஊழியர்களின் சம்பள சீட்டுகளை கத்தரிக்கும் கோடுகளுடன் (Dotted Cut Lines) அச்சிடும் விதம்.
                </p>

                {/* 3 Step Simple Guide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      1
                    </span>
                    <h5 className="font-bold text-xs text-white">Print 4-on-A4 கிளிக் செய்க</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      Payroll பக்கத்தில் உள்ள "Print 4-on-A4" பொத்தானை அழுத்தவும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20">
                    <span className="w-6 h-6 rounded-full bg-sky-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      2
                    </span>
                    <h5 className="font-bold text-xs text-sky-200">அச்சு அமைவு சரிபார்</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      Paper Size: A4, Margins: None / Minimum என தெரிவு செய்யவும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-emerald-400/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-1">
                      3
                    </span>
                    <h5 className="font-bold text-xs text-emerald-200">4 பாகமாக கத்தரிக்கவும்</h5>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      புள்ளி கோடுகளின் வழியே வெட்டி ஊழியர்களுக்கு வழங்கலாம்.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual A4 Grid Layout Mockup with Dotted Cut Lines */}
              <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-stone-800">
                      A4 காகித மாதிரி வரைபடம் (A4 Sheet 4-Quadrant Visual Layout)
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                    Standard A4 (210mm x 297mm)
                  </span>
                </div>

                {/* Simulated A4 Paper */}
                <div className="max-w-2xl mx-auto bg-stone-50 border-2 border-dashed border-stone-400 p-4 rounded-xl relative shadow-inner">
                  
                  {/* Grid 2x2 with Perforation Crosshair */}
                  <div className="grid grid-cols-2 gap-4 relative">
                    
                    {/* Quadrant 1 */}
                    <div className="bg-white p-3.5 rounded-lg border border-stone-300 shadow-2xs text-[10px] space-y-1 relative">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                        <span className="font-bold text-indigo-900">UNIBRO SMART APPARELS</span>
                        <span className="font-mono font-bold text-stone-500">EMP-001</span>
                      </div>
                      <p className="font-bold text-stone-800">கமல் பெரேரா (Kamal Perera)</p>
                      <div className="flex justify-between text-stone-600">
                        <span>Basic + BRA:</span>
                        <span className="font-mono">57,500</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>EPF (8%):</span>
                        <span className="font-mono">-4,600</span>
                      </div>
                      <div className="pt-1 border-t border-stone-200 flex justify-between font-black text-emerald-700 text-[11px]">
                        <span>Net Pay:</span>
                        <span className="font-mono">LKR 62,000</span>
                      </div>
                      <span className="absolute bottom-1 right-2 text-[8px] text-stone-400 font-mono">1/4 A4</span>
                    </div>

                    {/* Quadrant 2 */}
                    <div className="bg-white p-3.5 rounded-lg border border-stone-300 shadow-2xs text-[10px] space-y-1 relative">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                        <span className="font-bold text-indigo-900">UNIBRO SMART APPARELS</span>
                        <span className="font-mono font-bold text-stone-500">EMP-002</span>
                      </div>
                      <p className="font-bold text-stone-800">பாத்திமா நஸ்ரின் (Fathima)</p>
                      <div className="flex justify-between text-stone-600">
                        <span>Basic + BRA:</span>
                        <span className="font-mono">48,000</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>EPF (8%):</span>
                        <span className="font-mono">-3,840</span>
                      </div>
                      <div className="pt-1 border-t border-stone-200 flex justify-between font-black text-emerald-700 text-[11px]">
                        <span>Net Pay:</span>
                        <span className="font-mono">LKR 51,200</span>
                      </div>
                      <span className="absolute bottom-1 right-2 text-[8px] text-stone-400 font-mono">2/4 A4</span>
                    </div>

                    {/* Quadrant 3 */}
                    <div className="bg-white p-3.5 rounded-lg border border-stone-300 shadow-2xs text-[10px] space-y-1 relative">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                        <span className="font-bold text-indigo-900">UNIBRO SMART APPARELS</span>
                        <span className="font-mono font-bold text-stone-500">EMP-003</span>
                      </div>
                      <p className="font-bold text-stone-800">சுனில் சில்வா (Sunil Silva)</p>
                      <div className="flex justify-between text-stone-600">
                        <span>Basic + BRA:</span>
                        <span className="font-mono">52,000</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>EPF (8%):</span>
                        <span className="font-mono">-4,160</span>
                      </div>
                      <div className="pt-1 border-t border-stone-200 flex justify-between font-black text-emerald-700 text-[11px]">
                        <span>Net Pay:</span>
                        <span className="font-mono">LKR 56,400</span>
                      </div>
                      <span className="absolute bottom-1 right-2 text-[8px] text-stone-400 font-mono">3/4 A4</span>
                    </div>

                    {/* Quadrant 4 */}
                    <div className="bg-white p-3.5 rounded-lg border border-stone-300 shadow-2xs text-[10px] space-y-1 relative">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                        <span className="font-bold text-indigo-900">UNIBRO SMART APPARELS</span>
                        <span className="font-mono font-bold text-stone-500">EMP-004</span>
                      </div>
                      <p className="font-bold text-stone-800">அனுஷா பெர்னாண்டோ (Anusha)</p>
                      <div className="flex justify-between text-stone-600">
                        <span>Basic + BRA:</span>
                        <span className="font-mono">42,000</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>EPF (8%):</span>
                        <span className="font-mono">-3,360</span>
                      </div>
                      <div className="pt-1 border-t border-stone-200 flex justify-between font-black text-emerald-700 text-[11px]">
                        <span>Net Pay:</span>
                        <span className="font-mono">LKR 46,100</span>
                      </div>
                      <span className="absolute bottom-1 right-2 text-[8px] text-stone-400 font-mono">4/4 A4</span>
                    </div>

                  </div>

                  {/* Scissors Center Icon Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border border-amber-500">
                      ✂️ கத்தரிக்கும் நேர்கோடு (Perforation Line)
                    </span>
                  </div>

                </div>

                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                  <span className="font-bold">
                    💡 பிரிண்டர் அமைப்பில் (Printer Settings) 'Scale: Fit to Printable Area' என வைத்தால் சீட்டுகள் துல்லியமாக அமையும்.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TASK 6: DOWNLOAD BACKUP */}
          {activeTaskId === 'download-backup' && (
            <div className="space-y-6">
              
              {/* Illustrated Backup Flow Banner */}
              <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-black text-teal-300 flex items-center mb-3">
                  <Download className="w-5 h-5 mr-2 text-teal-400" />
                  தரவு காப்புப்பிரதி (Backup) எடுக்கும் வரைபடம்
                </h3>
                <p className="text-xs text-stone-300 mb-5 max-w-2xl leading-relaxed">
                  கணினி பழுதடைதல், வைரஸ் தாக்குதல் அல்லது வன்வட்டு (Hard Disk) செயலிழப்பிலிருந்து நிறுவன சம்பளத் தரவுகளை பாதுகாக்க 1-கிளிக் காப்புப்பிரதி முறை.
                </p>

                {/* 3 Step Sequence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  
                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
                    <span className="w-7 h-7 rounded-full bg-teal-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-2">
                      1
                    </span>
                    <h5 className="font-bold text-sm text-white">அமைப்புகள் (Config) செல்லவும்</h5>
                    <p className="text-xs text-stone-300 mt-1">
                      மேல் மெனுவில் உள்ள <strong>"Configuration"</strong> பக்கத்தை கிளிக் செய்யவும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-teal-400/40">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-2">
                      2
                    </span>
                    <h5 className="font-bold text-sm text-amber-300">Download Backup அழுத்தவும்</h5>
                    <p className="text-xs text-stone-300 mt-1">
                      பச்சை நிற <strong>"Download Full Database Backup (.zip / .db)"</strong> பொத்தானை கிளிக் செய்யவும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
                    <span className="w-7 h-7 rounded-full bg-emerald-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-2">
                      3
                    </span>
                    <h5 className="font-bold text-sm text-emerald-300">Pen Drive-ல் சேமிக்கவும்</h5>
                    <p className="text-xs text-stone-300 mt-1">
                      பதிவிறக்கப்பட்ட கோப்பை USB Pen Drive அல்லது Google Drive-ல் பாதுகாப்பாக வைக்கவும்.
                    </p>
                  </div>

                </div>
              </div>

              {/* Visual Backup Action Box */}
              <div className="bg-white rounded-2xl border-2 border-teal-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                  <h4 className="text-sm font-black text-teal-950 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-teal-600" />
                    தானியங்கி காப்புப்பிரதி பாதுகாப்பு பலகம் (Automated Backup & Archive)
                  </h4>
                  <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                    Encrypted Snapshot
                  </span>
                </div>

                <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h5 className="font-extrabold text-stone-900 text-sm">
                      சம்பள தரவுத்தளம் (nava_lady_payroll_backup.sqlite / .zip)
                    </h5>
                    <p className="text-xs text-stone-600 mt-1">
                      அனைத்து ஊழியர் விபரங்கள், கைரேகை பதிவுகள், சம்பள பட்டியல்கள் மற்றும் EPF/ETF அறிக்கைகள் அடங்கிய முழுமையான கோப்பு.
                    </p>
                    <span className="inline-block text-[10px] text-teal-800 bg-teal-200/60 font-mono px-2 py-0.5 rounded mt-2 font-bold">
                      Size: ~2.4 MB • Status: Complete & Verified
                    </span>
                  </div>

                  <div className="shrink-0">
                    <button className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-md transition flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>காப்புப்பிரதியை பதிவிறக்கு (Download Backup)</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>பரிந்துரை:</strong> ஒவ்வொரு வார இறுதியிலும் அல்லது மாதாந்த சம்பளக் கணக்கீடு முடிந்தவுடனும் ஒரு காப்புப்பிரதி எடுத்து பாதுகாப்பது சிறந்தது.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TASK 7: RESTORE BACKUP */}
          {activeTaskId === 'restore-backup' && (
            <div className="space-y-6">
              
              {/* Illustrated Restore Flow Banner */}
              <div className="bg-gradient-to-r from-rose-950 via-red-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-black text-rose-300 flex items-center mb-3">
                  <UploadCloud className="w-5 h-5 mr-2 text-rose-400" />
                  காப்புப்பிரதியை மீட்டமைக்கும் முறை (Database Restoration Workflow)
                </h3>
                <p className="text-xs text-stone-300 mb-5 max-w-2xl leading-relaxed">
                  புதிய கணினியில் மென்பொருளை நிறுவும் போதோ அல்லது முந்தைய தரவுகளை மீளப்பெற வேண்டிய போதோ காப்புப்பிரதி கோப்பை ஏற்றும் முறை.
                </p>

                {/* 3 Step Sequence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  
                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
                    <span className="w-7 h-7 rounded-full bg-rose-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-2">
                      1
                    </span>
                    <h5 className="font-bold text-sm text-white">கோப்பை தெரிவு செய்</h5>
                    <p className="text-xs text-stone-300 mt-1">
                      முன்பு பதிவிறக்கிய <strong>.sqlite அல்லது .zip</strong> கோப்பை கணினியிலிருந்து தேர்ந்தெடுக்கவும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-rose-400/40">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-2">
                      2
                    </span>
                    <h5 className="font-bold text-sm text-amber-300">சரிபார்ப்பு & உறுதிப்படுத்தல்</h5>
                    <p className="text-xs text-stone-300 mt-1">
                      கோப்பின் உண்மைத்தன்மை மற்றும் பதிவுகள் தானாக சரிபார்க்கப்படும்.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
                    <span className="w-7 h-7 rounded-full bg-emerald-400 text-slate-900 font-black text-xs inline-flex items-center justify-center mb-2">
                      3
                    </span>
                    <h5 className="font-bold text-sm text-emerald-300">மீட்டமைத்தல் பூர்த்தி</h5>
                    <p className="text-xs text-stone-300 mt-1">
                      பழைய ஊழியர்கள் மற்றும் சம்பள விபரங்கள் அனைத்தும் உடனடியாக மீளமைக்கப்படும்.
                    </p>
                  </div>

                </div>
              </div>

              {/* Visual Restore Dropzone Action Box */}
              <div className="bg-white rounded-2xl border-2 border-rose-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                  <h4 className="text-sm font-black text-rose-950 flex items-center">
                    <UploadCloud className="w-5 h-5 mr-2 text-rose-600" />
                    காப்புப்பிரதி பதிவேற்ற தளம் (Upload & Restore Zone)
                  </h4>
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full">
                    Critical Operation
                  </span>
                </div>

                {/* Visual Drag and Drop Box */}
                <div className="border-2 border-dashed border-rose-300 rounded-2xl p-8 text-center bg-rose-50/40 hover:bg-rose-50/70 transition cursor-pointer">
                  <UploadCloud className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-bounce" />
                  <h5 className="font-extrabold text-sm text-rose-950">
                    காப்புப்பிரதி கோப்பை இங்கே இழுத்து விடவும் (Drag & Drop .db / .zip File)
                  </h5>
                  <p className="text-xs text-stone-500 mt-1">
                    அல்லது உங்கள் கணினியிலிருந்து கோப்பை தேர்ந்தெடுக்க கிளிக் செய்யவும்.
                  </p>
                  <button className="mt-4 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition inline-flex items-center space-x-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>கோப்பைத் தேர்ந்தெடு (Select Backup File)</span>
                  </button>
                </div>

                {/* Critical Warning Callout */}
                <div className="mt-5 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-rose-200 flex items-start space-x-3 text-xs text-rose-950">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-rose-950">எச்சரிக்கை (Important Warning):</h5>
                    <p className="mt-0.5 leading-relaxed">
                      காப்புப்பிரதியை மீட்டமைக்கும் போது தற்போதுள்ள தற்காலிக தகவல்கள் மாற்றப்பட்டு, காப்புப்பிரதி எடுக்கப்பட்ட அன்றைய நிலைக்கு கணினி திரும்பும்.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Fast Selector Grid for All 7 Tasks */}
        <div className="pt-6 border-t border-stone-200">
          <h3 className="text-base font-extrabold text-stone-900 mb-4 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-indigo-600" />
            7 பணிகளையும் நேரடியாகப் பார்க்கவும் (Quick Switcher)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tamilGuideTasks.map((task) => {
              const Icon = task.icon;
              const isSelected = activeTaskId === task.id;

              return (
                <button
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-400 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 block">பணி {task.number}</span>
                    <h5 className="text-xs font-bold text-stone-900 leading-tight">
                      {task.tamilTitle.replace(/^\d+\.\s*/, '')}
                    </h5>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
