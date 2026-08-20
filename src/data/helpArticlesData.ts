import { HelpArticle, HelpCategory } from '../types';

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    iconName: 'Rocket',
    colorClass: 'from-blue-500 to-indigo-600 text-white',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    title: {
      en: 'Getting Started',
      ta: 'ஆரம்ப வழிகாட்டி',
      si: 'ආරම්භක මාර්ගෝපදේශය'
    },
    description: {
      en: 'Quick start guide, first-time setup, company profile, and user navigation overview.',
      ta: 'விரைவான தொடக்கம், ஆரம்ப அமைப்பு, நிறுவன விபரம் மற்றும் அடிப்படை வழிகாட்டி.',
      si: 'පද්ධතිය භාවිතය ආරම්භ කිරීම, මූලික සැකසුම් සහ සංචාලනය.'
    },
    order: 1
  },
  {
    id: 'dashboard',
    iconName: 'LayoutDashboard',
    colorClass: 'from-emerald-500 to-teal-600 text-white',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: {
      en: 'Executive Dashboard',
      ta: 'முதன்மை கட்டுப்பாட்டு பலகை',
      si: 'ප්‍රධාන පාලක පුවරුව'
    },
    description: {
      en: 'Real-time attendance monitor, leave indicators, OT alerts, and biometric sync status.',
      ta: 'நிகழ்நேர வருகை, விடுப்பு விபரம், மேலதிக நேர ஊழியர்கள் மற்றும் கைரேகை இணைப்பு நிலை.',
      si: 'සජීවී පැමිණීම, නිවාඩු වාර්තා, අතිකාල සේවකයින් සහ උපකරණ තත්ත්වය.'
    },
    order: 2
  },
  {
    id: 'employees',
    iconName: 'Users',
    colorClass: 'from-violet-500 to-purple-600 text-white',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    title: {
      en: 'Employee Management',
      ta: 'ஊழியர் மேலாண்மை',
      si: 'සේවක කළමනාකරණය'
    },
    description: {
      en: 'Registering employees, NIC verification, trilingual names, bank details, and statutory schemes.',
      ta: 'ஊழியர் பதிவு, தேசிய அடையாள அட்டை, மும்மொழி பெயர், வங்கி விபரம் மற்றும் திட்டங்கள்.',
      si: 'සේවකයින් ලියාපදිංචිය, ජා.හැ.අංකය, භාෂා ත්‍රිත්ව නම්, බැංකු විස්තර.'
    },
    order: 3
  },
  {
    id: 'attendance',
    iconName: 'Clock',
    colorClass: 'from-amber-500 to-orange-600 text-white',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    title: {
      en: 'Attendance Tracking',
      ta: 'தினசரி வருகை பதிவு',
      si: 'පැමිණීම සටහන් කිරීම'
    },
    description: {
      en: 'Biometric punches, manual logs, lunch break deductions, and daily work hour calculations.',
      ta: 'கைரேகை பதிவுகள், கைமுறை உள்ளீடு, மதிய உணவு இடைவேளை கழிவு, வேலை நேர கணக்கீடு.',
      si: 'ඇඟිලි සලකුණු පැමිණීම්, අතින් ඇතුළත් කිරීම, විවේක කාලය සහ වැඩ කළ පැය ගණනය.'
    },
    order: 4
  },
  {
    id: 'leave',
    iconName: 'CalendarOff',
    colorClass: 'from-rose-500 to-pink-600 text-white',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    title: {
      en: 'Leave & No-Pay Rules',
      ta: 'விடுப்பு & சம்பளமில்லா விடுமுறை',
      si: 'නිවාඩු සහ වැටුප් රහිත දින'
    },
    description: {
      en: 'Special 25-day salary rule, basic no-pay deduction, and allowance shortfall reductions.',
      ta: '25-நாள் சம்பள விதி, அடிப்படை சம்பளமில்லா கழிவு மற்றும் படி குறைப்பு அட்டவணை.',
      si: 'දින 25 වැටුප් නීතිය, මූලික වැටුප් රහිත කැපීම් සහ දීමනා අඩුකිරීම්.'
    },
    order: 5
  },
  {
    id: 'working-time',
    iconName: 'Watch',
    colorClass: 'from-cyan-500 to-blue-600 text-white',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    title: {
      en: 'Working Time & Shifts',
      ta: 'வேலை நேரம் & சுழற்சி முறைகள்',
      si: 'වැඩ මුර සහ කාල සීමාවන්'
    },
    description: {
      en: 'Shift definitions, grace periods, late deduction rules, half-day thresholds, and night shifts.',
      ta: 'வேலை நேர வரம்புகள், தாமத சலுகை நேரம், அரை நாள் விதி மற்றும் இரவு சுழற்சி முறை.',
      si: 'වැඩ මුර සැකසුම්, සහන කාලය, ප්‍රමාද දඩ, අර්ධ දින නීති සහ රාත්‍රී වැඩ මුර.'
    },
    order: 6
  },
  {
    id: 'overtime',
    iconName: 'Zap',
    colorClass: 'from-yellow-500 to-amber-600 text-white',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    title: {
      en: 'Overtime & Special OT',
      ta: 'மேலதிக நேரம் (OT) & விசேட விதிகள்',
      si: 'අතිකාල (OT) සහ විශේෂ නීති'
    },
    description: {
      en: 'Standard 1.5x OT rate calculation, special date/time windows, multipliers, and department filters.',
      ta: 'சாதாரண 1.5x OT கணக்கீடு, விசேட நாட்கள், பெருக்கிகள் மற்றும் பிரிவு வாரியான விதிகள்.',
      si: 'සාමාන්‍ය 1.5x OT ගණනය, විශේෂ දින පරාසයන්, ගුණක සහ දෙපාර්තමේන්තු නීති.'
    },
    order: 7
  },
  {
    id: 'seasonal-incentives',
    iconName: 'Award',
    colorClass: 'from-fuchsia-500 to-purple-600 text-white',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    title: {
      en: 'Seasonal & Target Incentives',
      ta: 'பருவகால & இலக்கு ஊக்கத்தொகைகள்',
      si: 'වාරික සහ ඉලක්කගත දිරිදීමනා'
    },
    description: {
      en: 'Production targets, sales incentives, attendance bonuses, tiered slabs, and collision priority modes.',
      ta: 'உற்பத்தி இலக்கு, விற்பனை போனஸ், முழு வருகை ஊக்கத்தொகை மற்றும் முன்னுரிமை முறைகள்.',
      si: 'නිෂ්පාදන ඉලක්ක, විකුණුම් දිරිදීමනා, පැමිණීමේ බෝනස් සහ ස්ලැබ් ක්‍රම.'
    },
    order: 8
  },
  {
    id: 'payroll',
    iconName: 'Calculator',
    colorClass: 'from-emerald-600 to-green-700 text-white',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: {
      en: 'Payroll Engine',
      ta: 'சம்பள கணக்கீட்டு இயந்திரம்',
      si: 'වැටුප් ගණනය කිරීමේ පද්ධතිය'
    },
    description: {
      en: 'Full calculation sequence: Basic, No-pay, Allowances, OT, Incentives, EPF/ETF, Net Pay, and Lock.',
      ta: 'முழுமையான சம்பளக் கணக்கீடு: அடிப்படை, கழிவுகள், OT, போனஸ், EPF/ETF மற்றும் நிகர சம்பளம்.',
      si: 'සම්පූර්ණ වැටුප් ගණනය: මූලික වැටුප, කැපීම්, OT, දිරිදීමනා, EPF/ETF සහ ශුද්ධ වැටුප.'
    },
    order: 9
  },
  {
    id: 'epf-etf',
    iconName: 'ShieldCheck',
    colorClass: 'from-teal-500 to-emerald-600 text-white',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    title: {
      en: 'EPF / ETF Remittance',
      ta: 'EPF / ETF சட்டரீதியான மேலாண்மை',
      si: 'EPF / ETF ව්‍යවස්ථාපිත දායකත්ව'
    },
    description: {
      en: 'Sri Lankan statutory rates (8%, 12%, 3%), Central Bank Form C, department remittance, and balances.',
      ta: 'இலங்கை சட்ட விகிதங்கள் (8%, 12%, 3%), மத்திய வங்கி Form C மற்றும் துறைசார் கொடுப்பனவுகள்.',
      si: 'ශ්‍රී ලංකා ව්‍යවස්ථාපිත අනුපාත (8%, 12%, 3%), Form C වාර්තා සහ ගෙවීම් ශේෂයන්.'
    },
    order: 10
  },
  {
    id: 'payslip',
    iconName: 'Printer',
    colorClass: 'from-indigo-500 to-blue-600 text-white',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    title: {
      en: 'Payslip Printing & Export',
      ta: 'சம்பள சீட்டு அச்சிடுதல் & ஏற்றுமதி',
      si: 'පඩිපත් මුද්‍රණය සහ අපනයනය'
    },
    description: {
      en: '4 payslips per A4 sheet printing, single employee PDF, company branding, and digital signatures.',
      ta: 'A4 தாளில் 4 சம்பள சீட்டுகள் அச்சிடுதல், தனிநபர் PDF, நிறுவன முத்திரை மற்றும் கையொப்பங்கள்.',
      si: 'A4 පිටුවක පඩිපත් 4ක් මුද්‍රණය, තනි PDF පිටපත් සහ නිල අත්සන්.'
    },
    order: 11
  },
  {
    id: 'backup-restore',
    iconName: 'Database',
    colorClass: 'from-amber-600 to-red-600 text-white',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    title: {
      en: 'Backup & Disaster Recovery',
      ta: 'தரவு காப்புப்பிரதி & மீட்டமைத்தல்',
      si: 'දත්ත උපස්ථ සහ ප්‍රතිසාධනය'
    },
    description: {
      en: 'Admin-only daily ZIP download, Excel registers, encrypted database snapshots, and safe restore.',
      ta: 'நிர்வாகி மட்டும் ZIP பதிவிறக்கம், எக்செல் கோப்புகள் மற்றும் பாதுகாப்பான மீட்டெடுப்பு.',
      si: 'දෛනික ZIP උපස්ථ, එක්සෙල් ගොනු සහ ආරක්ෂිත ප්‍රතිසාධන ක්‍රමවේදය.'
    },
    order: 12
  },
  {
    id: 'biometric',
    iconName: 'Fingerprint',
    colorClass: 'from-purple-600 to-indigo-700 text-white',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    title: {
      en: 'Biometric Devices (Hikvision)',
      ta: 'கைரேகை இயந்திர இணைப்பு (Hikvision)',
      si: 'ඇඟිලි සලකුණු උපකරණ (Hikvision)'
    },
    description: {
      en: 'Hikvision DS-K1A8503MF ISAPI setup, employee mapping, SHA-256 deduplication, and Windows sync.',
      ta: 'ஹிக்விஷன் இயந்திர இணைப்பு, ஊழியர் இலக்க பொருத்தம், இரட்டை பதிவு தவிர்ப்பு மற்றும் விண்டෝஸ் சேவை.',
      si: 'Hikvision DS-K1A8503MF සැකසුම්, සේවක අංක සම්බන්ධ කිරීම සහ Windows Sync සේවාව.'
    },
    order: 13
  },
  {
    id: 'reports',
    iconName: 'FileSpreadsheet',
    colorClass: 'from-sky-500 to-indigo-600 text-white',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    title: {
      en: 'Reports & Bank PayMaster',
      ta: 'அறிக்கைகள் & வங்கி கோப்புகள்',
      si: 'වාර්තා සහ බැංකු ගෙවීම් ගොනු'
    },
    description: {
      en: 'Monthly payroll sheets, department summaries, Commercial Bank PayMaster text export, and audits.',
      ta: 'மாதாந்த சம்பள அறிக்கை, துறை சுருக்கம், வர்த்தக வங்கி ஊதிய பரிமாற்ற கோப்பு மற்றும் தணிக்கை.',
      si: 'මාසික වැටුප් වාර්තා, දෙපාර්තමේන්තු සාරාංශ සහ බැංකු PayMaster ගොනු අපනයනය.'
    },
    order: 14
  },
  {
    id: 'troubleshooting',
    iconName: 'Wrench',
    colorClass: 'from-red-500 to-rose-700 text-white',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    title: {
      en: 'Troubleshooting & Diagnostics',
      ta: 'பிரச்சினை தீர்க்கும் வழிகாட்டி',
      si: 'දෝෂ නිරාකරණ මාර්ගෝපදේශය'
    },
    description: {
      en: 'Resolving employee display issues, payroll mismatch, EPF variations, printer cuts, and LAN timeouts.',
      ta: 'ஊழியர் விபரம் காணப்படாமை, சம்பள முரண்பாடு, அச்சுப்பொறி சீரமைப்பு மற்றும் பிணைய சிக்கல்கள்.',
      si: 'සේවක ගැටළු, වැටුප් විෂමතා, EPF වෙනස්කම් සහ මුද්‍රණ දෝෂ විසඳීම.'
    },
    order: 15
  },
  {
    id: 'faq',
    iconName: 'HelpCircle',
    colorClass: 'from-slate-600 to-stone-800 text-white',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    title: {
      en: 'Frequently Asked Questions (FAQ)',
      ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      si: 'නිතර අසන ප්‍රශ්න (FAQ)'
    },
    description: {
      en: 'Answers to common questions regarding Sri Lankan labor regulations, shifts, and system functions.',
      ta: 'இலங்கை தொழில் சட்டங்கள், சுழற்சி முறை மற்றும் பொதுவான கேள்விகளுக்கான விடைகள்.',
      si: 'ශ්‍රී ලංකා කම්කරු නීති සහ පද්ධති ක්‍රියාකාරිත්වය පිළිබඳ පොදු ගැටළු.'
    },
    order: 16
  }
];

export const helpArticles: HelpArticle[] = [
  // 1. Getting Started
  {
    id: 'quick-start-overview',
    categoryId: 'getting-started',
    slug: 'quick-start-overview',
    iconName: 'Rocket',
    badgeColor: 'bg-blue-100 text-blue-800',
    readTimeMins: 4,
    targetRoute: 'dashboard',
    title: {
      en: 'Quick Start & System Overview',
      ta: 'விரைவான தொடக்கம் & கணினி மேலோட்டம்',
      si: 'පද්ධතිය භාවිතය ආරම්භ කිරීම සහ මූලික හැඳින්වීම'
    },
    summary: {
      en: 'Learn how to navigate UNIBRO SMART APPARELS - HRM System and understand the core workflow.',
      ta: 'UNIBRO SMART APPARELS - HRM மனிதவள மற்றும் சம்பள கணினி அமைப்பின் அடிப்படை செயல்பாடுகளை எளிதாக அறிந்துகொள்ளுங்கள்.',
      si: 'UNIBRO SMART APPARELS - HRM පද්ධතියේ මූලික ක්‍රියාකාරීත්වය සහ භාවිතය පිළිබඳව ඉගෙන ගන්න.'
    },
    tags: {
      en: ['Getting Started', 'Overview', 'Navigation', 'Login', 'Roles'],
      ta: ['ஆரம்பம்', 'மேலோட்டம்', 'வழிகாட்டி', 'பணிகள்'],
      si: ['ආරම්භය', 'හැඳින්වීම', 'භූමිකාවන්', 'මූලික']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Role-Based Access Control',
          ta: 'பயனர் பங்கு தேர்வு (Role Switch)',
          si: 'පරිශීලක භූමිකාව තෝරා ගැනීම'
        },
        description: {
          en: 'The top navigation bar allows you to operate as Admin, HR, or Payroll Officer. Admin has full rights including Backup & Restore. HR can manage employee records and attendance. Payroll can calculate and lock monthly salaries.',
          ta: 'மேல் பட்டியில் Admin, HR, அல்லது Payroll ஆக மாறலாம். Admin முழுமையான காப்புப்பிரதி உரிமைகளைக் கொண்டுள்ளார். HR ஊழியர் பதிவுகளை நிர்வகிக்கலாம். Payroll சம்பளக் கணக்கீடுகளை மேற்கொள்கிறது.',
          si: 'ඉහළ තීරුවේ ඇති Admin, HR, හෝ Payroll අතර මාරු විය හැක. Admin හට සම්පූර්ණ අවසරයන් ද, HR හට සේවක තොරතුරු ද, Payroll හට වැටුප් ගණනය කිරීම් ද කළ හැක.'
        },
        illustrationType: 'dashboard',
        callout: {
          type: 'info',
          text: {
            en: 'Switch language at any time in the top right menu between English, Tamil, and Sinhala.',
            ta: 'மேல் வலதுபுறத்தில் எந்நேரமும் தமிழ், சிங்களம் அல்லது ஆங்கிலத்திற்கு மொழியை மாற்றலாம்.',
            si: 'ඉහළ දකුණු කෙළවරින් ඕනෑම වේලාවක සිංහල, දෙමළ හෝ ඉංග්‍රීසි භාෂාව තෝරාගත හැක.'
          }
        }
      },
      {
        stepNumber: 2,
        title: {
          en: 'Primary 5-Step Operational Cycle',
          ta: 'மாதாந்த 5 முக்கிய செயற்பாடுகள்',
          si: 'ප්‍රධාන මාසික පියවර 5'
        },
        description: {
          en: '1) Register Employees with Salary Schemes. 2) Record or Sync Attendance. 3) Configure Seasonal & Special OT Rules. 4) Run Payroll Calculation. 5) Batch Print Payslips (4-on-A4) and Take Daily Backup.',
          ta: '1) சம்பள திட்டத்துடன் ஊழியர்களை பதிவு செய்தல். 2) வருகையை பதிவு செய்தல். 3) ஊக்கத்தொகை மற்றும் OT விதிகளை அமைத்தல். 4) சம்பளத்தை கணக்கிடுதல். 5) சம்பள சீட்டு அச்சிடுதல் மற்றும் காப்புப்பிரதி எடுத்தல்.',
          si: '1) සේවකයින් ලියාපදිංචි කිරීම. 2) පැමිණීම සටහන් කිරීම. 3) දිරිදීමනා සහ OT නීති සැකසීම. 4) වැටුප් ගණනය කිරීම. 5) පඩිපත් මුද්‍රණය සහ උපස්ථ ලබා ගැනීම.'
        },
        illustrationType: 'payroll-run'
      }
    ],
    proTip: {
      en: 'Use the Help button in the top navigation bar or the floating helper button to open instant context help anytime!',
      ta: 'எந்தவொரு பக்கத்திலும் உடனடியாக உதவி பெற மேல் பட்டி அல்லது மிதக்கும் உதவி பொத்தானை பயன்படுத்தவும்!',
      si: 'ඕනෑම පිටුවකදී ක්ෂණික සහය ලබා ගැනීමට ඉහළ තීරුවේ ඇති උපකාරක බොත්තම භාවිතා කරන්න!'
    },
    warning: {
      en: 'Always download a Daily Safe Backup (ZIP) before calculating the final monthly payroll run.',
      ta: 'இறுதி மாதாந்த சம்பளத்தை கணக்கிடுவதற்கு முன்னர் எப்போதும் தினசரி காப்புப்பிரதியை (ZIP) பதிவிறக்கவும்.',
      si: 'අවසන් මාසික වැටුප් ගණනය කිරීමට පෙර සැමවිටම දත්ත උපස්ථයක් (ZIP) බාගත කරගන්න.'
    }
  },

  // 2. Executive Dashboard
  {
    id: 'dashboard-guide',
    categoryId: 'dashboard',
    slug: 'dashboard-guide',
    iconName: 'LayoutDashboard',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    readTimeMins: 3,
    targetRoute: 'dashboard',
    title: {
      en: 'Using the Executive Real-Time Dashboard',
      ta: 'நிகழ்நேர கட்டுப்பாட்டு பலகையை பயன்படுத்துவது எப்படி',
      si: 'ප්‍රධාන පාලක පුවරුව භාවිතය'
    },
    summary: {
      en: 'Monitor real-time factory attendance, live Hikvision biometric punches, leaves, late arrivals, and statutory funds.',
      ta: 'தொழிற்சாலையின் நேரடி வருகை, கைரேகை இயந்திர நிலை, விடுப்புகள் மற்றும் தாமதங்களை ஒரே பார்வையில் கண்காணிக்கவும்.',
      si: 'කර්මාන්තශාලාවේ සජීවී පැමිණීම, ඇඟිලි සලකුණු සටහන්, නිවාඩු සහ ප්‍රමාද වීම් එකවර අධීක්ෂණය කරන්න.'
    },
    tags: {
      en: ['Dashboard', 'Present', 'Absent', 'Leave', 'Live Punches', 'Biometrics'],
      ta: ['கட்டுப்பாட்டு பலகை', 'வருகை', 'விடுப்பு', 'தாமதம்', 'கைரேகை'],
      si: ['පාලක පුවරුව', 'පැමිණීම', 'නිවාඩු', 'අතිකාල']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Real-Time Summary Cards',
          ta: 'நிகழ்நேர சுருக்க விபர அட்டைகள்',
          si: 'සජීවී සාරාංශ කාඩ්පත්'
        },
        description: {
          en: 'The top 4 cards instantly reflect today\'s attendance status: Today Present (Active workers on floor), On Approved Leave, Absent Without Leave, and Overtime Workers actively clocking extra hours.',
          ta: 'மேல் உள்ள 4 அட்டைகள் இன்றைய நிலவரத்தை காட்டுகின்றன: பணியில் உள்ளோர், விடுப்பில் உள்ளோர், சமூகமளிக்காதோர் மற்றும் மேலதிக நேர ஊழியர்கள்.',
          si: 'ඉහළ කාඩ්පත් 4 මඟින් අද දින සේවයට වාර්තා කළ, නිවාඩු ලබාගත්, නොපැමිණි සහ අතිකාල සේවය කරන සේවක සංඛ්‍යාව පෙන්වයි.'
        },
        illustrationType: 'dashboard'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Hikvision LAN Status & Live Punch Stream',
          ta: 'ஹிக்விஷன் பிணைய நிலை & நேரடி கைரேகை பதிவுகள்',
          si: 'Hikvision සජීවී ඇඟිලි සලකුණු තොරතුරු'
        },
        description: {
          en: 'The Biometric Banner confirms whether terminal DS-K1A8503MF is Online on your factory LAN. The Live Feeds widget displays the last 5 employees clocking in with exact timestamp and verification method (Fingerprint / RFID Card / Face).',
          ta: 'கைரேகை பட்டை இயந்திரம் ஆன்லைனில் உள்ளதா என்பதை உறுதிப்படுத்துகிறது. நேரடி ஊட்டமானது கடைசியாக வருகை பதிவு செய்த 5 ஊழியர்களின் விபரங்களைக் காட்டுகிறது.',
          si: 'උපකරණය සක්‍රීයව පවතින බව බැනරයෙන් පෙන්වයි. සජීවී තීරුව මඟින් අවසන් වරට පැමිණීම සටහන් කළ සේවකයින් 5 දෙනාගේ තොරතුරු ක්ෂණිකව පෙන්වයි.'
        },
        illustrationType: 'biometric-lan'
      }
    ],
    proTip: {
      en: 'Click the "Refresh Data" button in the top right to instantly poll the server for latest biometric check-ins without reloading the browser.',
      ta: 'புதிய கைரேகை பதிவுகளை உடனடியாகப் புதுப்பிக்க மேல் வலதுபுறத்தில் உள்ள "Refresh" பொத்தானை அழுத்தவும்.',
      si: 'බ්‍රව්සරය රීලෝඩ් නොකර නවතම දත්ත ලබා ගැනීමට "Refresh" බොත්තම ඔබන්න.'
    }
  },

  // 3. Employee Management
  {
    id: 'employee-management',
    categoryId: 'employees',
    slug: 'employee-management',
    iconName: 'Users',
    badgeColor: 'bg-violet-100 text-violet-800',
    readTimeMins: 5,
    targetRoute: 'employees',
    title: {
      en: 'Employee Registration & Master Data',
      ta: 'ஊழியர் பதிவு மற்றும் விபர மேலாண்மை',
      si: 'සේවක ලියාපදිංචිය සහ තොරතුරු කළමනාකරණය'
    },
    summary: {
      en: 'Step-by-step guide to registering factory workers, managing trilingual names (English, Tamil, Sinhala), NIC, and bank disbursement info.',
      ta: 'புதிய ஊழியர்களை பதிவு செய்தல், மும்மொழி பெயர் உள்ளீடு, அடையாள அட்டை மற்றும் வங்கி விபரங்களை அமைப்பது பற்றிய வழிகாட்டி.',
      si: 'නව සේවකයින් ලියාපදිංචි කිරීම, භාෂා ත්‍රිත්ව නම්, ජාතික හැඳුනුම්පත් අංකය සහ බැංකු ගිණුම් විස්තර ඇතුළත් කිරීම.'
    },
    tags: {
      en: ['Employees', 'Registration', 'NIC', 'Bank', 'EPF', 'ETF', 'Salary Scheme'],
      ta: ['ஊழியர்கள்', 'பதிவு', 'வங்கி', 'அடையாள அட்டை', 'திட்டம்'],
      si: ['සේවකයින්', 'ලියාපදිංචිය', 'හැඳුනුම්පත', 'වැටුප් ක්‍රමය']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Click "+ Add Employee"',
          ta: '"+ Add Employee" பொத்தானை அழுத்தவும்',
          si: '"+ Add Employee" බොත්තම ඔබන්න'
        },
        description: {
          en: 'Navigate to the Employees tab and click the emerald "+ Add Employee" button in the top toolbar to open the trilingual registration modal.',
          ta: 'Employees பகுதிக்கு சென்று மேல் உள்ள "+ Add Employee" பொத்தானை அழுத்துவதன் மூலம் புதிய ஊழியர் பதிவு படிவத்தை திறக்கவும்.',
          si: 'Employees ටැබ් එකට ගොස් ඉහළ ඇති "+ Add Employee" බොත්තම ඔබා ලියාපදිංචි පෝරමය විවෘත කරන්න.'
        },
        illustrationType: 'employee-form'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Enter Trilingual Names & NIC',
          ta: 'மும்மொழி பெயர்கள் & NIC உள்ளிடல்',
          si: 'භාෂා ත්‍රිත්ව නම් සහ ජා.හැ.අංකය'
        },
        description: {
          en: 'Enter Full Name in English (Mandatory for Bank Export), Tamil (for payslips), and Sinhala. Enter the 10-character Old NIC (e.g. 912345678V) or 12-digit New NIC (e.g. 199123456789).',
          ta: 'ஆங்கிலத்தில் முழுப் பெயர் (வங்கி கோப்புகளுக்கு அவசியம்), தமிழ் மற்றும் சிங்களத்தில் உள்ளிடவும். பழைய (912345678V) அல்லது புதிய 12 இலக்க NIC ஐ உள்ளிடவும்.',
          si: 'ඉංග්‍රීසි, දෙමළ සහ සිංහල භාෂාවලින් සම්පූර්ණ නම ඇතුළත් කරන්න. පැරණි හෝ නව ඉලක්කම් 12 ජාතික හැඳුනුම්පත් අංකය ඇතුළත් කරන්න.'
        },
        illustrationType: 'employee-form'
      },
      {
        stepNumber: 3,
        title: {
          en: 'Assign Salary Scheme & Statutory Toggles',
          ta: 'சம்பள திட்டம் & சட்டப்பூர்வ தெரிவுகள்',
          si: 'වැටුප් ක්‍රමය සහ ව්‍යවස්ථාපිත තේරීම්'
        },
        description: {
          en: 'Select the employee\'s assigned Salary Scheme (e.g., Apparel Production Grade A - LKR 45,000). Ensure EPF Enabled (8%+12%) and ETF Enabled (3%) checkmarks are enabled according to statutory mandates.',
          ta: 'பொருத்தமான சம்பள திட்டத்தை தேர்ந்தெடுக்கவும். EPF மற்றும் ETF சட்டரீதியாக தேவைப்படும் ஊழியர்களுக்கு இயக்கப்பட்டுள்ளதை உறுதி செய்யவும்.',
          si: 'අදාළ වැටුප් ක්‍රමය තෝරන්න. EPF (8%+12%) සහ ETF (3%) සක්‍රීය කර ඇති බව තහවුරු කරගන්න.'
        },
        illustrationType: 'epf-calc'
      }
    ],
    proTip: {
      en: 'Entering bank account number and branch allows one-click generation of the Commercial Bank PayMaster direct salary transfer file during payroll processing.',
      ta: 'வங்கி கணக்கு விபரங்களை உள்ளிடுவதன் மூலம் சம்பள தினத்தில் வங்கியின் PayMaster கோப்பை ஒரே கிளிக்கில் உருவாக்கலாம்.',
      si: 'බැංකු විස්තර නිවැරදිව ඇතුළත් කිරීමෙන් වැටුප් ගෙවීමේදී Commercial Bank PayMaster ගොනුව ක්ෂණිකව ලබාගත හැක.'
    },
    warning: {
      en: 'Employee Number must match the User ID registered inside the Hikvision Biometric Terminal for automatic punch matching.',
      ta: 'ஹிக்விஷன் கைரேகை இயந்திரத்தில் பதிவு செய்யப்பட்ட User ID யும் ஊழியர் இலக்கமும் (Employee Number) ஒரே மாதிரியாக இருக்க வேண்டும்.',
      si: 'ස්වයංක්‍රීයව ඇඟිලි සලකුණු සම්බන්ධ වීමට Hikvision යන්ත්‍රයේ User ID එක සහ Employee Number එක සමාන විය යුතුය.'
    }
  },

  // 4. Working Time & 25-Day Salary Rule
  {
    id: 'special-25-day-rule',
    categoryId: 'leave',
    slug: 'special-25-day-rule',
    iconName: 'CalendarOff',
    badgeColor: 'bg-rose-100 text-rose-800',
    readTimeMins: 4,
    targetRoute: 'salary-schemes',
    title: {
      en: 'The 25-Day Working Rule & Allowance Deductions',
      ta: '25-நாள் சம்பள விதி & படி குறைப்பு முறைமை',
      si: 'දින 25 වැටුප් නීතිය සහ දීමනා අඩුකිරීම්'
    },
    summary: {
      en: 'Understand how basic no-pay deductions and tiered allowance cuts are applied when an employee works fewer than 25 standard factory days.',
      ta: 'ஊழியர் ஒருவர் 25 வேலை நாட்களை விட குறைவாக பணிபுரியும் போது அடிப்படை சம்பளக் கழிவு மற்றும் படிக் குறைப்புகள் எவ்வாறு கணக்கிடப்படுகின்றன என்பதை அறியுங்கள்.',
      si: 'සේවකයෙකු සම්මත දින 25ට වඩා අඩුවෙන් සේවය කළ විට මූලික වැටුප සහ දීමනා අඩු වන ආකාරය තේරුම් ගන්න.'
    },
    tags: {
      en: ['25-Day Rule', 'No-Pay', 'Shortfall', 'Deductions', 'Basic Salary'],
      ta: ['25 நாள் விதி', 'சம்பளமில்லா கழிவு', 'குறைப்பு', 'அடிப்படை'],
      si: ['දින 25 නීතිය', 'වැටුප් රහිත', 'කැපීම්', 'දීමනා']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Standard 25-Day Base Benchmark',
          ta: '25-நாள் நிலையான அடிப்படை',
          si: 'සම්මත දින 25 පදනම'
        },
        description: {
          en: 'Sri Lankan apparel industry standards define 25 working days per payroll cycle. Daily Basic Rate = Basic Salary ÷ 25.',
          ta: 'இலங்கை ஆடை உற்பத்தித்துறை விதிப்படி ஒரு மாதத்திற்கு 25 வேலை நாட்கள் கணக்கிடப்படுகிறது. ஒரு நாள் அடிப்படை = Basic Salary ÷ 25.',
          si: 'ශ්‍රී ලංකා ඇඟලුම් ක්ෂේත්‍රයේ සම්මතය වන්නේ මසකට වැඩ කරන දින 25කි. දෛනික මූලික වැටුප = මූලික වැටුප ÷ 25.'
        },
        illustrationType: 'payroll-run'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Tiered Allowance Shortfall Schedule',
          ta: 'படி குறைப்பு படிநிலைகள் (Tiered Schedule)',
          si: 'දීමනා අඩුකිරීමේ පියවර'
        },
        description: {
          en: 'Fixed allowances are linked to attendance. If an employee misses days: Day 1 Shortfall (e.g. LKR 500 deducted), Day 2 Shortfall (LKR 1,000), Day 3 Shortfall (LKR 1,500), Day 4 Shortfall (LKR 2,000), and >4 Days (Entire allowance forfeited).',
          ta: 'ஊழியர் விடுமுறை எடுக்கும் போது: 1வது நாள் (ரூ. 500 கழிவு), 2வது நாள் (ரூ. 1,000), 3வது நாள் (ரூ. 1,500), 4வது நாள் (ரூ. 2,000), 4 நாட்களுக்கு மேல் முழு படியும் இழக்கப்படும்.',
          si: 'සේවකයෙකු නිවාඩු ලබාගත් විට: 1 වන දිනය (රු. 500), 2 වන දිනය (රු. 1,000), 3 වන දිනය (රු. 1,500), 4 වන දිනය (රු. 2,000), දින 4කට වැඩි නම් සම්පූර්ණ දීමනාව අහිමි වේ.'
        },
        illustrationType: 'epf-calc'
      }
    ],
    proTip: {
      en: 'You can configure custom deduction amounts per scheme in the "Salary Schemes" tab to match your factory union or employer agreements.',
      ta: 'ஒவ்வொரு சம்பள திட்டத்திற்கும் இந்த கழிவுத் தொகைகளை "Salary Schemes" பகுதியில் உங்கள் விருப்பப்படி மாற்றியமைக்கலாம்.',
      si: '"Salary Schemes" මඟින් එක් එක් වැටුප් ක්‍රමයට අදාළව මෙම අඩු කිරීම් අගයන් ඔබගේ ආයතනික ප්‍රතිපත්ති අනුව වෙනස් කළ හැක.'
    }
  },

  // 5. Payroll Engine & Calculation Order
  {
    id: 'payroll-engine-workflow',
    categoryId: 'payroll',
    slug: 'payroll-engine-workflow',
    iconName: 'Calculator',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    readTimeMins: 5,
    targetRoute: 'run-payroll',
    title: {
      en: 'Payroll Calculation Sequence & Execution',
      ta: 'சம்பள கணக்கீட்டு முறைமை & வரிசை',
      si: 'වැටුප් ගණනය කිරීමේ ක්‍රියාවලිය'
    },
    summary: {
      en: 'Complete breakdown of the statutory Sri Lankan calculation engine: Basic, No-Pay, Allowance deductions, Overtime, Incentives, EPF 8%, and Net Salary.',
      ta: 'இலங்கை சட்டதிட்டங்களுக்கு அமைவான சம்பளக் கணக்கீட்டு வரிசை: அடிப்படை, கழிவுகள், மேலதிக நேரம், போனஸ், EPF 8% மற்றும் நிகர சம்பளம்.',
      si: 'ව්‍යවස්ථාපිත වැටුප් ගණනය කිරීමේ පියවර: මූලික වැටුප, වැටුප් රහිත කැපීම්, OT, දිරිදීමනා, EPF 8% සහ ශුද්ධ වැටුප.'
    },
    tags: {
      en: ['Payroll', 'Calculation', 'Sequence', 'Net Salary', 'Deductions', 'EPF', 'ETF'],
      ta: ['சம்பளம்', 'கணக்கீடு', 'நிகர சம்பளம்', 'கழிவுகள்', 'EPF'],
      si: ['වැටුප්', 'ගණනය', 'ශුද්ධ වැටුප', 'කැපීම්']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Select Payroll Month & Fetch Attendance',
          ta: 'மாதத்தை தேர்வு செய்து வருகையை ஏற்றுதல்',
          si: 'වැටුප් මාසය තෝරා පැමිණීම් ලබා ගැනීම'
        },
        description: {
          en: 'Navigate to "Run Payroll", choose the target period (e.g., August 2026). The system automatically aggregates biometric check-ins, leaves, and OT hours for all active employees.',
          ta: '"Run Payroll" பகுதிக்கு சென்று மாதத்தை தெரிவு செய்யவும். கணினி தானாகவே அனைத்து ஊழியர்களின் வருகை மற்றும் OT நேரத்தை ஒருங்கிணைக்கும்.',
          si: '"Run Payroll" වෙත ගොස් අදාළ මාසය තෝරන්න. පද්ධතිය මඟින් සියලුම සේවකයින්ගේ පැමිණීම් සහ OT පැය ස්වයංක්‍රීයව ගණනය කරනු ඇත.'
        },
        illustrationType: 'payroll-run'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Statutory Formula Execution Order',
          ta: 'கணக்கீட்டு சூத்திர வரிசை',
          si: 'ගණනය කිරීමේ සූත්‍ර අනුපිළිවෙල'
        },
        description: {
          en: '1) Basic Earned = Basic - (Shortfall Days × Daily Basic). 2) Allowance Earned = Fixed Allowance - Shortfall Deduction. 3) Normal OT = OT Hours × (Basic / 200 × 1.5). 4) Special OT Multipliers. 5) Target & Seasonal Bonuses. 6) Gross Earnings. 7) Employee EPF 8% (Qualifying Base). 8) Net Salary = Gross - EPF 8%.',
          ta: '1) பெறப்பட்ட அடிப்படை = Basic - No Pay கழிவு. 2) பெறப்பட்ட படி = Fixed Allowance - படி கழிவு. 3) OT = OT மணி × (Basic/200 × 1.5). 4) விசேட OT. 5) போனஸ். 6) மொத்த வருமானம். 7) ஊழியர் EPF 8%. 8) நிகர சம்பளம் = Gross - EPF 8%.',
          si: '1) මූලික ඉපැයීම = Basic - No Pay කැපීම්. 2) දීමනා = Fixed Allowance - දීමනා කැපීම්. 3) OT = OT පැය × (Basic/200 × 1.5). 4) විශේෂ OT. 5) බෝනස්. 6) මුළු ඉපැයීම. 7) සේවක EPF 8%. 8) ශුද්ධ වැටුප = Gross - EPF 8%.'
        },
        illustrationType: 'epf-calc'
      },
      {
        stepNumber: 3,
        title: {
          en: 'Lock & Finalize Payroll',
          ta: 'சம்பளத்தை பூட்டி உறுதிப்படுத்துதல் (Lock)',
          si: 'වැටුප් වාර්තාව තහවුරු කර අගුළු දැමීම (Lock)'
        },
        description: {
          en: 'Once audited, click "Lock Payroll". Locked payroll prevents accidental alterations, generates frozen historical records for Central Bank audits, and enables batch payslip printing.',
          ta: 'சரிபார்த்த பின்னர் "Lock Payroll" பொத்தானை அழுத்தவும். இது தவறுதலான மாற்றங்களைத் தடுத்து மத்திய வங்கி தணிக்கைக்கான நிலையான பதிவை உருவாக்கும்.',
          si: 'තොරතුරු පරීක්ෂා කිරීමෙන් පසු "Lock Payroll" ඔබන්න. මෙය අනවශ්‍ය වෙනස්කම් වැළැක්වීම සහ මුද්‍රණය සඳහා පහසුකම් සපයයි.'
        },
        illustrationType: 'payroll-run'
      }
    ],
    proTip: {
      en: 'You can unlock a payroll batch at any time using the Admin role if retroactive attendance adjustments are required before disbursement.',
      ta: 'வங்கி கொடுப்பனவுக்கு முன் மாற்றங்கள் செய்ய வேண்டுமெனில் Admin பயனர் எந்நேரமும் Unlock செய்யலாம்.',
      si: 'ගෙවීම් කිරීමට පෙර යම් වෙනසක් අවශ්‍ය නම් Admin භූමිකාව හරහා Unlock කළ හැක.'
    }
  },

  // 6. EPF / ETF Remittance
  {
    id: 'epf-etf-management',
    categoryId: 'epf-etf',
    slug: 'epf-etf-management',
    iconName: 'ShieldCheck',
    badgeColor: 'bg-teal-100 text-teal-800',
    readTimeMins: 4,
    targetRoute: 'epf-etf',
    title: {
      en: 'EPF (8%+12%) and ETF (3%) Statutory Remittance',
      ta: 'EPF & ETF சட்டரீதியான மேலாண்மை மற்றும் கொடுப்பனவுகள்',
      si: 'EPF සහ ETF ව්‍යවස්ථාපිත ගෙවීම් කළමනාකරණය'
    },
    summary: {
      en: 'Track total monthly employer obligations to the Central Bank EPF Department and ETF Board, record department settlements, and deduct paid balances.',
      ta: 'மத்திய வங்கி EPF திணைக்களம் மற்றும் ETF சபைக்கு செலுத்த வேண்டிய மாதாந்த பொறுப்புகள், துறைசார் கொடுப்பனவுகள் மற்றும் நிலுவைகளை நிர்வகித்தல்.',
      si: 'මහ බැංකු EPF දෙපාර්තමේන්තුව සහ ETF මණ්ඩලය වෙත ගෙවිය යුතු දායකත්වයන් සහ ශේෂයන් කළමනාකරණය.'
    },
    tags: {
      en: ['EPF', 'ETF', 'Central Bank', 'Form C', 'Remittance', 'Balance', 'Department'],
      ta: ['EPF', 'ETF', 'மத்திய வங்கி', 'கொடுப்பனவு', 'நிலுவை'],
      si: ['EPF', 'ETF', 'මහ බැංකුව', 'ගෙවීම්', 'ශේෂය']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Review Assessed Statutory Liability',
          ta: 'மதிப்பிடப்பட்ட சட்டரீதியான பொறுப்பை சரிபார்த்தல்',
          si: 'ව්‍යවස්ථාපිත දායකත්ව මුදල පරීක්ෂා කිරීම'
        },
        description: {
          en: 'The system computes: Employee EPF (8% deducted from salary), Employer EPF (12% factory contribution), and Employer ETF (3% factory contribution) for all active eligible employees.',
          ta: 'கணினி தானாகவே கணக்கிடுகிறது: ஊழியர் EPF (8%), நிறுவன EPF (12%) மற்றும் நிறுவன ETF (3%).',
          si: 'සේවක EPF (8%), සේවායෝජක EPF (12%) සහ සේවායෝජක ETF (3%) අගයන් ස්වයංක්‍රීයව ගණනය වේ.'
        },
        illustrationType: 'epf-calc'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Record Direct Payment / Bank Remittance',
          ta: 'வங்கி கொடுப்பனவை பதிவு செய்தல்',
          si: 'බැංකු ගෙවීම් සටහන් කිරීම'
        },
        description: {
          en: 'When your accounts department pays the Central Bank EPF account via Cheque or SLIPS transfer, click "Record Employer Payment", enter the Cheque/Reference number, payment date, and remitted amount to deduct from the outstanding balance.',
          ta: 'மத்திய வங்கிக்கு காசோலை அல்லது வங்கி மூலம் பணம் செலுத்தியவுடன், "Record Employer Payment" அழுத்தி காசோலை இலக்கம் மற்றும் தொகையை உள்ளிட்டு நிலுவையிலிருந்து கழிக்கவும்.',
          si: 'චෙක්පත් හෝ බැංකු මඟින් ගෙවීම් කළ පසු "Record Employer Payment" මඟින් අදාළ චෙක්පත් අංකය සහ මුදල ඇතුළත් කර ශේෂය අඩු කරන්න.'
        },
        illustrationType: 'dashboard'
      }
    ],
    proTip: {
      en: 'Export the Central Bank Form C monthly schedule directly into Excel for official submission before the last working day of the following month.',
      ta: 'அடுத்த மாத இறுதி வேலை நாளுக்குள் சமர்ப்பிக்க வேண்டிய Form C அறிக்கையை Excel வடிவில் உடனடியாக ஏற்றுமதி செய்யலாம்.',
      si: 'ඊළඟ මාසයේ අවසන් දිනයට පෙර භාරදිය යුතු Form C වාර්තාව Excel ආකාරයෙන් ක්ෂණිකව බාගත කරගත හැක.'
    }
  },

  // 7. Payslip Printing (4 on A4)
  {
    id: 'payslip-batch-printing',
    categoryId: 'payslip',
    slug: 'payslip-batch-printing',
    iconName: 'Printer',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    readTimeMins: 3,
    targetRoute: 'run-payroll',
    title: {
      en: 'Printing 4 Payslips on a Single A4 Sheet',
      ta: 'ஒரே A4 தாளில் 4 சம்பள சீட்டுகளை அச்சிடுதல்',
      si: 'තනි A4 පිටුවක පඩිපත් 4ක් මුද්‍රණය කිරීම'
    },
    summary: {
      en: 'Save paper and optimize factory printing costs with 4-per-A4 perforated micro-slips formatted in English, Tamil, and Sinhala.',
      ta: 'காகித செலவை மீதப்படுத்த ஒரே A4 தாளில் 4 சம்பள சீட்டுகளை தமிழ், சிங்களம் மற்றும் ஆங்கிலத்தில் அச்சிடும் முறை.',
      si: 'කඩදාසි ඉතිරි කර ගනිමින් තනි A4 පිටුවක පඩිපත් 4ක් සිංහල, දෙමළ සහ ඉංග්‍රීසි භාෂාවලින් මුද්‍රණය කිරීම.'
    },
    tags: {
      en: ['Payslip', 'Print', 'A4', '4 per Page', 'Perforated', 'PDF Export'],
      ta: ['சம்பள சீட்டு', 'அச்சிடுதல்', 'A4', '4 சீட்டுகள்', 'PDF'],
      si: ['පඩිපත්', 'මුද්‍රණය', 'A4 පිටුව', 'PDF']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Click "Print Payslips (4 on A4)"',
          ta: '"Print Payslips (4 on A4)" பொத்தானை அழுத்தவும்',
          si: '"Print Payslips (4 on A4)" බොත්තම ඔබන්න'
        },
        description: {
          en: 'From the Run Payroll screen, click the "Print Payslips (4 on A4)" button. The batch printing preview modal will render all workers in an exact 2×2 grid per page.',
          ta: 'Run Payroll பகுதியிலிருந்து "Print Payslips (4 on A4)" பொத்தானை அழுத்தவும். 2×2 அமைப்பில் அனைத்து ஊழியர்களுக்கும் சீட்டுகள் தயாராகும்.',
          si: 'Run Payroll වෙතින් "Print Payslips (4 on A4)" ඔබන්න. පිටුවකට පඩිපත් 4ක් (2×2) බැගින් පෙන්වනු ඇත.'
        },
        illustrationType: 'payslip-4a4'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Configure Printer Margins & Print',
          ta: 'அச்சுப்பொறி அமைப்புகளை சரிசெய்து அச்சிடவும்',
          si: 'මුද්‍රණ යන්ත්‍රයේ Margin සකසා මුද්‍රණය කරන්න'
        },
        description: {
          en: 'In your browser print dialog, set Margins to "None" or "Minimum", Paper Size to "A4", and ensure "Background graphics" is checked to display styled headers and dividing dashed cut-lines.',
          ta: 'அச்சு சாளரத்தில் Margins ஐ "None" என வைத்து, தாள் அளவை "A4" என தெரிவு செய்து, Background Graphics ஐ சரிபார்த்து அச்சிடவும்.',
          si: 'Print dialog හි Margin "None" ලෙස ද, කඩදාසි ප්‍රමාණය "A4" ලෙස ද, Background graphics සක්‍රීය කර මුද්‍රණය කරන්න.'
        },
        illustrationType: 'payslip-4a4'
      }
    ],
    proTip: {
      en: 'Each micro-slip includes designated signature boxes for Employee Signature and Authorized Factory Officer approval.',
      ta: 'ஒவ்வொரு சம்பள சீட்டிலும் ஊழியர் மற்றும் அதிகாரியின் கையொப்பத்திற்கான இடங்கள் ஒதுக்கப்பட்டுள்ளன.',
      si: 'සෑම පඩිපතකම සේවකයාගේ සහ බලයලත් නිලධාරියාගේ අත්සන සඳහා ඉඩ වෙන් කර ඇත.'
    }
  },

  // 8. Biometric Integration (Hikvision DS-K1A8503MF)
  {
    id: 'biometric-integration',
    categoryId: 'biometric',
    slug: 'biometric-integration',
    iconName: 'Fingerprint',
    badgeColor: 'bg-purple-100 text-purple-800',
    readTimeMins: 6,
    targetRoute: 'config',
    targetTab: 'biometric',
    title: {
      en: 'Hikvision DS-K1A8503MF Biometric Setup & Windows Sync',
      ta: 'ஹிக்விஷன் DS-K1A8503MF கைரேகை இயந்திர இணைப்பு மற்றும் விண்டோஸ் சேவை',
      si: 'Hikvision DS-K1A8503MF ඇඟිලි සලකුණු යන්ත්‍රය සහ Windows Sync සේවාව'
    },
    summary: {
      en: 'Connect Hikvision attendance terminals over local factory LAN via ISAPI, configure auto-sync intervals, and run the background sync engine with offline buffering.',
      ta: 'தொழிற்சாலை உள்ளூர் பிணையத்தில் (LAN) ஹிக்விஷன் இயந்திரத்தை இணைத்தல், தானியங்கி ஒத்திசைவு மற்றும் ஆஃப்லைன் வரிசை மேலாண்மை.',
      si: 'දේශීය LAN ජාලය හරහා Hikvision යන්ත්‍රය සම්බන්ධ කිරීම, ස්වයංක්‍රීය දත්ත සමමුහුර්තකරණය සහ නොබැඳි දත්ත ගබඩාව.'
    },
    tags: {
      en: ['Hikvision', 'Biometric', 'DS-K1A8503MF', 'ISAPI', 'LAN', 'Fingerprint', 'Windows Service'],
      ta: ['ஹிக்விஷன்', 'கைரேகை', 'பிணையம்', 'LAN', 'ஒத்திசைவு'],
      si: ['Hikvision', 'ඇඟිලි සලකුණු', 'ජාලය', 'සමමුහුර්තකරණය']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Configure Device IP & ISAPI Credentials',
          ta: 'இயந்திரத்தின் IP முகவரி & கடவுச்சொல்லை உள்ளிடல்',
          si: 'යන්ත්‍රයේ IP ලිපිනය සහ මුරපදය ඇතුළත් කිරීම'
        },
        description: {
          en: 'Go to Configuration -> Biometric Devices -> Click "Add Device". Enter Terminal Name (e.g. "Factory Main Gate"), Model "DS-K1A8503MF", Local IP (e.g. 192.168.1.201), Port (80), Username (admin), and the Device Password.',
          ta: 'Configuration -> Biometric Devices சென்று "Add Device" அழுத்தவும். பெயர், மாதிரி DS-K1A8503MF, IP முகவரி (192.168.1.201), போர்ட் (80), பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',
          si: 'Configuration -> Biometric Devices වෙත ගොස් "Add Device" ඔබන්න. නම, මාදිලිය DS-K1A8503MF, IP ලිපිනය, Port සහ මුරපදය ඇතුළත් කරන්න.'
        },
        illustrationType: 'biometric-lan'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Map Employee User IDs',
          ta: 'ஊழியர் இலக்கங்களை பொருத்துதல் (Mapping)',
          si: 'සේවක අංක සම්බන්ධ කිරීම'
        },
        description: {
          en: 'Switch to the "Employee Mapping" tab and click "Auto-Match by Employee Number". The system pairs the Device User ID (e.g. ID #101) with Employee #101.',
          ta: '"Employee Mapping" பகுதிக்கு சென்று "Auto-Match by Employee Number" அழுத்துவதன் மூலம் இயந்திர User ID ஐ ஊழியர் இலக்கத்துடன் இணைக்கவும்.',
          si: '"Employee Mapping" ටැබ් එකට ගොස් "Auto-Match by Employee Number" ඔබා යන්ත්‍රයේ අංකය සේවක අංකය සමඟ සම්බන්ධ කරන්න.'
        },
        illustrationType: 'biometric-lan'
      },
      {
        stepNumber: 3,
        title: {
          en: 'Windows Background Sync Client with Offline Recovery',
          ta: 'விண்டோஸ் பின்னணி சேவை & ஆஃப்லைன் பாதுகாப்பு',
          si: 'Windows Background Sync සහ නොබැඳි ආරක්ෂාව'
        },
        description: {
          en: 'Install the bundled Windows service on your factory reception/server PC. It polls the terminal every 5 minutes using HTTP Digest authentication and securely queues punches on local disk if the internet connection is disrupted.',
          ta: 'தொழிற்சாலை கணினியில் விண்டோஸ் சேவையை நிறுவவும். இது 5 நிமிடங்களுக்கு ஒருமுறை பதிவுகளைப் பெற்று இணையம் துண்டிக்கப்பட்டாலும் கணினியில் பாதுகாப்பாக சேமிக்கும்.',
          si: 'කර්මාන්තශාලා පරිගණකයේ Windows Sync සේවාව ක්‍රියාත්මක කරන්න. අන්තර්ජාලය විසන්ධි වුවද දත්ත සුරක්ෂිතව තබාගෙන සම්බන්ධ වූ පසු අප්ලෝඩ් කරයි.'
        },
        illustrationType: 'biometric-lan'
      }
    ],
    proTip: {
      en: 'Every biometric punch is stamped with a SHA-256 cryptographic hash (device_serial:user_id:timestamp) preventing any duplicate punches across repeated sync passes.',
      ta: 'ஒவ்வொரு கைரேகை பதிவிலும் SHA-256 குறியீடு உள்ளதால் மீண்டும் மீண்டும் ஒத்திசைவு செய்தாலும் இரட்டைப் பதிவுகள் உருவாகாது.',
      si: 'සෑම ඇඟිලි සලකුණු සටහනකටම SHA-256 ආරක්ෂිත කේතයක් ලැබෙන බැවින් ද්විත්ව සටහන් ඇති නොවේ.'
    },
    warning: {
      en: 'Ensure your Hikvision device clock is synchronized with Sri Lanka Standard Time (Asia/Colombo GMT+5:30) via NTP (e.g., pool.ntp.org).',
      ta: 'ஹிக்விஷன் இயந்திரத்தின் கடிகாரம் இலங்கை நேரத்துடன் (GMT+5:30) சரியாக உள்ளதை உறுதி செய்யவும்.',
      si: 'Hikvision යන්ත්‍රයේ වේලාව ශ්‍රී ලංකා වේලාවට (GMT+5:30) නිවැරදිව සකසා ඇති බව තහවුරු කරගන්න.'
    }
  },

  // 9. Backup & Disaster Recovery
  {
    id: 'backup-restore-guide',
    categoryId: 'backup-restore',
    slug: 'backup-restore-guide',
    iconName: 'Database',
    badgeColor: 'bg-amber-100 text-amber-800',
    readTimeMins: 4,
    targetRoute: 'config',
    targetTab: 'backup',
    title: {
      en: 'Daily Safe Backup (ZIP) & One-Click Restore',
      ta: 'தினசரி காப்புப்பிரதி (ZIP) & மீட்டமைத்தல் வழிகாட்டி',
      si: 'දෛනික ආරක්ෂිත උපස්ථ (ZIP) සහ ප්‍රතිසාධනය'
    },
    summary: {
      en: 'Safeguard your company payroll records with encrypted daily backups containing SQLite database dumps, Excel registers, and company metadata.',
      ta: 'உங்கள் நிறுவனத்தின் சம்பளத் தரவுகளை நாளாந்தம் ZIP வடிவில் பாதுகாப்பாக பதிவிறக்கம் செய்து அவசர காலத்தில் மீட்டெடுக்கும் முறை.',
      si: 'ඔබගේ වැටුප් දත්ත දෛනිකව ZIP ආකාරයෙන් සුරක්ෂිතව බාගත කරගැනීම සහ අවශ්‍ය විටක නැවත ලබා ගැනීම.'
    },
    tags: {
      en: ['Backup', 'Restore', 'ZIP', 'Excel', 'Disaster Recovery', 'Admin Only'],
      ta: ['காப்புப்பிரதி', 'மீட்டமைத்தல்', 'ZIP', 'எக்செல்', 'பாதுகாப்பு'],
      si: ['උපස්ථ', 'ප්‍රතිසාධනය', 'ZIP ගොනුව', 'ආරක්ෂාව']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Click "Download Daily Backup"',
          ta: '"Download Daily Backup" பொத்தானை அழுத்தவும்',
          si: '"Download Daily Backup" බොත්තම ඔබන්න'
        },
        description: {
          en: 'Go to Configuration -> System Backup (Admin role only) and click "Download Daily Backup". The system generates a timestamped package e.g. `nava-lady-payroll-backup-2026-08-14.zip`.',
          ta: 'Configuration -> Backup பகுதிக்கு சென்று (Admin மட்டும்) "Download Daily Backup" அழுத்தவும். கணினி உடனடியாக ZIP கோப்பைத் தரும்.',
          si: 'Configuration -> Backup වෙත ගොස් "Download Daily Backup" ඔබන්න. `nava-lady-payroll-backup-...zip` ගොනුව බාගත වනු ඇත.'
        },
        illustrationType: 'backup-zip'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Inspect Contents of the Backup ZIP',
          ta: 'ZIP கோப்பில் உள்ள ஆவணங்களை பார்த்தல்',
          si: 'උපස්ථ ගොනුවේ අඩංගු දෑ'
        },
        description: {
          en: 'The archive contains: 1) `database.sqlite` (complete transactional DB), 2) `employees.xlsx` (employee master sheet), 3) `payroll_history.xlsx`, 4) `biometric_punches.xlsx`, and 5) `company_settings.json`.',
          ta: 'ZIP கோப்பில் SQLite தரவுத்தளம், ஊழியர் விபர எக்செல், சம்பள வரலாறு, கைரேகை பதிவுகள் மற்றும் நிறுவன அமைப்புகள் இருக்கும்.',
          si: 'මෙම ZIP ගොනුවේ SQLite දත්ත සමුදාය, සේවක ලේඛනය, වැටුප් ඉතිහාසය, ඇඟිලි සලකුණු සටහන් සහ සැකසුම් අඩංගු වේ.'
        },
        illustrationType: 'backup-zip'
      },
      {
        stepNumber: 3,
        title: {
          en: 'Restoring from a Previous Backup',
          ta: 'முந்தைய காப்புப்பிரதியிலிருந்து மீட்டெடுத்தல்',
          si: 'පෙර උපස්ථයකින් දත්ත නැවත ලබා ගැනීම'
        },
        description: {
          en: 'In disaster scenarios, drag and drop the backup ZIP file into the restore box, verify the validation checksum, and confirm to restore all tables instantly.',
          ta: 'அவசர நிலைகளில், ZIP கோப்பை தெரிவு செய்து உறுதிப்படுத்துவதன் மூலம் அனைத்து தரவுகளையும் உடனடியாக மீட்டெடுக்கலாம்.',
          si: 'හදිසි අවස්ථාවකදී ZIP ගොනුව තෝරා තහවුරු කිරීමෙන් සියලුම දත්ත ක්ෂණිකව නැවත ලබාගත හැක.'
        },
        illustrationType: 'backup-zip'
      }
    ],
    proTip: {
      en: 'Store a copy of your daily backup ZIP file on an external USB flash drive or secure cloud storage (Google Drive / OneDrive) at the end of each working day.',
      ta: 'ஒவ்வொரு வேலை நாளின் இறுதியிலும் இந்த ZIP கோப்பை USB டிரைவ் அல்லது கூகுள் டிரைவில் சேமித்து வைக்கவும்.',
      si: 'සෑම වැඩ කරන දිනකම අවසානයේ මෙම උපස්ථ ගොනුව USB ඩ්‍රයිව් එකක හෝ Google Drive හි සුරක්ෂිතව තබා ගන්න.'
    },
    warning: {
      en: 'Restoring a backup will overwrite the current live database with the contents of the archive. Always take a fresh backup before performing a restore.',
      ta: 'மீட்டமைக்கும் போது தற்போதைய தரவுகள் மாற்றப்படும். எனவே மீட்டெடுக்கும் முன் புதிய காப்புப்பிரதி ஒன்றை எடுத்துக்கொள்ளவும்.',
      si: 'ප්‍රතිසාධනය කිරීමේදී දැනට පවතින දත්ත වෙනස් වන බැවින් ඊට පෙර නව උපස්ථයක් ලබා ගන්න.'
    }
  },

  // 10. Troubleshooting Articles
  {
    id: 'troubleshooting-common-issues',
    categoryId: 'troubleshooting',
    slug: 'troubleshooting-common-issues',
    iconName: 'Wrench',
    badgeColor: 'bg-red-100 text-red-800',
    readTimeMins: 5,
    title: {
      en: 'Diagnostic & Troubleshooting Guide',
      ta: 'பொதுவான பிழை தீர்க்கும் வழிகாட்டி',
      si: 'පොදු දෝෂ සහ ගැටළු විසඳීමේ මාර්ගෝපදේශය'
    },
    summary: {
      en: 'Step-by-step solutions for missing employees, payroll calculation stalls, EPF mismatches, printer alignment, and biometric timeouts.',
      ta: 'ஊழியர் விபரம் தெரியாமை, சம்பள கணக்கீடு சிக்கல், EPF முரண்பாடு, அச்சு சீரமைப்பு மற்றும் கைரேகை இணைப்பு பிழைகளுக்கான தீர்வுகள்.',
      si: 'සේවක තොරතුරු නොපෙන්වීම, වැටුප් ගණනය ගැටළු, EPF විෂමතා සහ මුද්‍රණ දෝෂ සඳහා විසඳුම්.'
    },
    tags: {
      en: ['Troubleshooting', 'Errors', 'Fix', 'EPF Mismatch', 'Printer', 'Biometric Offline'],
      ta: ['பிழை திருத்தம்', 'தீர்வு', 'அச்சுப்பொறி', 'EPF முரண்பாடு'],
      si: ['දෝෂ නිරාකරණය', 'ගැටළු', 'විසඳුම්', 'මුද්‍රණ']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Issue: Employee Not Appearing in Payroll Run',
          ta: 'சிக்கல்: சம்பள பட்டியலில் ஊழியர் பெயர் காணப்படாமை',
          si: 'ගැටළුව: වැටුප් ලේඛනයේ සේවකයා නොපෙන්වීම'
        },
        description: {
          en: 'Check: 1) Is the employee status set to "Active"? (Probation/Resigned are filtered if terminated). 2) Is a valid Salary Scheme assigned to the employee? Open Employees -> Edit -> select Salary Scheme.',
          ta: 'தீர்வு: 1) ஊழியர் "Active" நிலையில் உள்ளாரா என பார்க்கவும். 2) ஊழியருக்கு Salary Scheme இணைக்கப்பட்டுள்ளதா என சரிபார்க்கவும்.',
          si: 'විසඳුම: 1) සේවකයාගේ තත්ත්වය "Active" ද? 2) සේවකයාට Salary Scheme එකක් සම්බන්ධ කර ඇත්දැයි පරීක්ෂා කරන්න.'
        },
        illustrationType: 'employee-form'
      },
      {
        stepNumber: 2,
        title: {
          en: 'Issue: Biometric Terminal Shows "Offline"',
          ta: 'சிக்கல்: கைரேகை இயந்திரம் "Offline" என காட்டுகிறது',
          si: 'ගැටළුව: ඇඟිලි සලකුණු යන්ත්‍රය "Offline" ලෙස පෙන්වීම'
        },
        description: {
          en: 'Check: 1) Ensure the LAN Ethernet cable is firmly connected to the Hikvision unit. 2) Ping the device IP (e.g. 192.168.1.201) from your PC. 3) Verify the admin password matches device settings in Configuration -> Biometric Devices.',
          ta: 'தீர்வு: 1) LAN கேபிள் சரியாக பொருத்தப்பட்டுள்ளதா என பார்க்கவும். 2) கணினியிலிருந்து IP முகவரியை பிங் செய்யவும். 3) கடவுச்சொல் சரியாக உள்ளதா என உறுதிப்படுத்தவும்.',
          si: 'විසඳුම: 1) LAN කේබලය නිවැරදිව සම්බන්ධ කර ඇත්දැයි බලන්න. 2) IP ලිපිනය පරීක්ෂා කරන්න. 3) මුරපදය නිවැරදිදැයි තහවුරු කරගන්න.'
        },
        illustrationType: 'biometric-lan'
      },
      {
        stepNumber: 3,
        title: {
          en: 'Issue: Payslips Print Misaligned or Splitting on A4',
          ta: 'சிக்கல்: சம்பள சீட்டு தாளில் சரியாக பொருந்தாமை',
          si: 'ගැටළුව: මුද්‍රණයේදී පඩිපත් පිටුවට නිවැරදිව නොගැලපීම'
        },
        description: {
          en: 'In Chrome/Edge Print Settings: 1) Change Paper Size to "A4". 2) Set Margins to "None" or "Custom (0mm)". 3) Enable "Background Graphics". 4) Set Scale to "100%" or "Fit to Printable Area".',
          ta: 'அச்சு அமைப்பில்: Paper Size "A4", Margins "None", Background Graphics "Checked", Scale "100%" என மாற்றவும்.',
          si: 'මුද්‍රණ සැකසුම් වල: Paper Size "A4", Margins "None", Background Graphics "Checked", Scale "100%" ලෙස සකසන්න.'
        },
        illustrationType: 'payslip-4a4'
      }
    ],
    faqs: [
      {
        question: {
          en: 'Why is EPF not calculating for a specific employee?',
          ta: 'குறிப்பிட்ட ஊழியருக்கு EPF ஏன் கணக்கிடப்படவில்லை?',
          si: 'යම් සේවකයෙකුට EPF ගණනය නොවන්නේ ඇයි?'
        },
        answer: {
          en: 'Open the Employees tab, edit the employee profile, and ensure the "EPF Enabled" checkbox is ticked.',
          ta: 'Employees பகுதிக்கு சென்று குறித்த ஊழியரை Edit செய்து "EPF Enabled" தெரிவு இயக்கப்பட்டுள்ளதா என பார்க்கவும்.',
          si: 'Employees වෙත ගොස් අදාළ සේවකයා Edit කර "EPF Enabled" සක්‍රීය කර ඇති බව තහවුරු කරන්න.'
        }
      },
      {
        question: {
          en: 'Can I undo a calculation after clicking "Calculate Payroll"?',
          ta: 'சம்பள கணக்கீட்டை செய்த பின் மீண்டும் மாற்ற முடியுமா?',
          si: 'වැටුප් ගණනය කළ පසු නැවත වෙනස් කළ හැකිද?'
        },
        answer: {
          en: 'Yes. As long as the payroll batch is not locked, you can adjust attendance, incentives, or scheme values and click "Calculate Payroll" again to refresh calculations.',
          ta: 'ஆம். சம்பளம் Lock செய்யப்படாத வரை நீங்கள் எப்போது வேண்டுமானாலும் விபரங்களை மாற்றிவிட்டு மீண்டும் "Calculate Payroll" அழுத்தலாம்.',
          si: 'ඔව්. වැටුප් ලේඛනය Lock කර නොමැති නම්, අවශ්‍ය වෙනස්කම් කර නැවත "Calculate Payroll" එබිය හැක.'
        }
      }
    ]
  },

  // 11. FAQ Module
  {
    id: 'frequently-asked-questions',
    categoryId: 'faq',
    slug: 'frequently-asked-questions',
    iconName: 'HelpCircle',
    badgeColor: 'bg-slate-100 text-slate-800',
    readTimeMins: 4,
    title: {
      en: 'Frequently Asked Questions (FAQ)',
      ta: 'அடிக்கடி கேட்கப்படும் வினாக்களும் விடைகளும்',
      si: 'නිතර අසන ප්‍රශ්න සහ පිළිතුරු'
    },
    summary: {
      en: 'Comprehensive answers to Sri Lankan statutory labor laws, Shop & Office Act rules, EPF department deadlines, and software questions.',
      ta: 'இலங்கை தொழில் சட்டங்கள், கடைகள் மற்றும் அலுவலகங்கள் சட்டம், EPF செலுத்தும் காலக்கெடு மற்றும் மென்பொருள் பயன்பாடு தொடர்பான வினாக்கள்.',
      si: 'ශ්‍රී ලංකා කම්කරු නීති, සාප්පු සහ කාර්යාල පනත, EPF නියමිත දින සහ පද්ධතිය පිළිබඳ තොරතුරු.'
    },
    tags: {
      en: ['FAQ', 'Labor Law', 'Statutory', 'Questions', 'Sri Lanka'],
      ta: ['வினா விடை', 'சட்டங்கள்', 'பொதுவானவை'],
      si: ['ප්‍රශ්නෝත්තර', 'නීතිමය', 'සාමාන්‍ය']
    },
    steps: [
      {
        stepNumber: 1,
        title: {
          en: 'Statutory EPF/ETF Remittance Deadlines',
          ta: 'EPF/ETF மாதாந்த கொடுப்பனவு காலக்கெடு',
          si: 'EPF/ETF මාසික ගෙවීම් කාලසීමාව'
        },
        description: {
          en: 'Under Central Bank regulations, monthly EPF (8% + 12%) and ETF (3%) contributions must be credited on or before the last working day of the subsequent calendar month.',
          ta: 'மத்திய வங்கி விதிகளின்படி, மாதாந்த EPF (8%+12%) மற்றும் ETF (3%) கொடுப்பனவுகள் அடுத்த மாதத்தின் இறுதி வேலை நாளுக்குள் செலுத்தப்பட வேண்டும்.',
          si: 'මහ බැංකු නීති අනුව මාසික EPF (8%+12%) සහ ETF (3%) දායක මුදල් ඊළඟ මාසයේ අවසන් වැඩ කරන දිනට පෙර ගෙවිය යුතුය.'
        },
        illustrationType: 'epf-calc'
      }
    ],
    faqs: [
      {
        question: {
          en: 'How is normal overtime calculated in Sri Lanka?',
          ta: 'இலங்கையில் சாதாரண மேலாதிக்க நேரம் (OT) எவ்வாறு கணக்கிடப்படுகிறது?',
          si: 'ශ්‍රී ලංකාවේ සාමාන්‍ය අතිකාල (OT) ගණනය කරන්නේ කෙසේද?'
        },
        answer: {
          en: 'Standard OT Rate = (Basic Salary ÷ 200) × 1.5 per hour. For shop & office workers, normal working hours are capped at 8 hours/day (45 hours/week).',
          ta: 'சாதாரண OT மணித்தியால விகிதம் = (Basic Salary ÷ 200) × 1.5. ஒரு நாளைக்கு 8 மணி நேரத்திற்கு மேற்பட்ட வேலைக்கு இது பொருந்தும்.',
          si: 'සාමාන්‍ය OT පැයක අනුපාතය = (මූලික වැටුප ÷ 200) × 1.5 වේ. දිනකට පැය 8 ඉක්මවන කාලය සඳහා මෙය හිමිවේ.'
        }
      },
      {
        question: {
          en: 'What happens if an employee works on a Mercantile Holiday?',
          ta: 'வணிக விடுமுறை (Mercantile Holiday) நாளில் பணிபுரிந்தால் என்ன சலுகை?',
          si: 'වෙළඳ නිවාඩු (Mercantile Holiday) දිනක සේවය කළහොත් ලැබෙන ප්‍රතිලාභ මොනවාද?'
        },
        answer: {
          en: 'You can configure Special OT rules with a 2.0x or 3.0x multiplier in Configuration -> Special OT Rules for designated holiday dates.',
          ta: 'Configuration -> Special OT Rules பகுதியில் குறிப்பிட்ட விடுமுறை தினத்திற்கு 2.0x அல்லது 3.0x மடங்கு OT வீதத்தை நீங்கள் அமைக்கலாம்.',
          si: 'Configuration -> Special OT Rules වෙත ගොස් අදාළ නිවාඩු දිනය සඳහා 2.0x හෝ 3.0x ගුණකයක් සැකසිය හැක.'
        }
      },
      {
        question: {
          en: 'How do I generate the bank transfer file for Commercial Bank / BOC?',
          ta: 'வர்த்தக வங்கி அல்லது BOC க்கான சம்பள பரிமாற்ற கோப்பை எவ்வாறு உருவாக்குவது?',
          si: 'Commercial Bank හෝ BOC සඳහා වැටුප් ගොනුව සාදා ගන්නේ කෙසේද?'
        },
        answer: {
          en: 'In the Run Payroll module, click "Export Bank File (PayMaster)". It formats the standard `.txt` disbursement file ready for direct portal upload.',
          ta: 'Run Payroll பகுதியில் "Export Bank File" பொத்தானை அழுத்தவும். இது வங்கி இணையதளத்தில் பதிவேற்றக்கூடிய PayMaster கோப்பை உடனடியாக உருவாக்கும்.',
          si: 'Run Payroll හි "Export Bank File" ඔබන්න. මෙය බැංකු පද්ධතියට සෘජුවම අප්ලෝඩ් කළ හැකි PayMaster .txt ගොනුව සාදයි.'
        }
      }
    ]
  }
];
