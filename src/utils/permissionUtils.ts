import { UserRole, UserPermission, UserProfile, Language } from '../types';

export interface PermissionMeta {
  key: UserPermission;
  group: 'admin' | 'hr' | 'payroll' | 'biometric' | 'system';
  label: Record<Language, string>;
  description: Record<Language, string>;
  isDangerous?: boolean;
}

export const ALL_PERMISSIONS: UserPermission[] = [
  'manage_users',
  'manage_employees',
  'manage_salary_schemes',
  'manage_attendance',
  'run_payroll',
  'approve_payroll',
  'manage_epf_etf',
  'manage_biometric',
  'manage_working_time',
  'manage_incentives',
  'backup_restore',
  'export_reports',
  'view_only',
];

export const PERMISSION_METADATA: PermissionMeta[] = [
  {
    key: 'manage_users',
    group: 'admin',
    isDangerous: true,
    label: {
      en: 'Manage Users & Rights',
      ta: 'பயனர்கள் & உரிமைகள் மேலாண்மை',
      si: 'පරිශීලකයින් සහ හිමිකම් කළමනාකරණය',
    },
    description: {
      en: 'Create, edit, deactivate other users, and assign roles & system permissions.',
      ta: 'பிற பயனர்களை உருவாக்குதல், திருத்துதல், முடக்குதல் மற்றும் அனுமதிகளை ஒதுக்குதல்.',
      si: 'වෙනත් පරිශීලකයින් සෑදීම, සංස්කරණය, අක්‍රිය කිරීම සහ අවසර ලබා දීම.',
    },
  },
  {
    key: 'manage_employees',
    group: 'hr',
    label: {
      en: 'Employee Management',
      ta: 'பணியாளர் பதிவேடு மேலாண்மை',
      si: 'සේවක කළමනාකරණය',
    },
    description: {
      en: 'Add new staff, edit trilingual profiles, change status, and assign salary schemes.',
      ta: 'புதிய பணியாளர்களைச் சேர்த்தல், விவரங்களைத் திருத்துதல் மற்றும் சம்பளத் திட்டங்களை ஒதுக்குதல்.',
      si: 'නව සේවකයින් ඇතුළත් කිරීම, විස්තර සංස්කරණය සහ වැටුප් ක්‍රම පැවරීම.',
    },
  },
  {
    key: 'manage_attendance',
    group: 'hr',
    label: {
      en: 'Attendance & Leave Entry',
      ta: 'வருகை & விடுப்பு பதிவுகள்',
      si: 'පැමිණීම සහ නිවාඩු සටහන්',
    },
    description: {
      en: 'Mark daily check-ins, record paid/no-pay leaves, and manually adjust overtime hours.',
      ta: 'தினசரி வருகை, சம்பளமில்லா விடுப்பு மற்றும் மேலதிக நேரத்தை (OT) பதிவு செய்தல்.',
      si: 'දෛනික පැමිණීම, වැටුප් සහිත/රහිත නිවාඩු සහ අතිකාල පැය සටහන් කිරීම.',
    },
  },
  {
    key: 'manage_working_time',
    group: 'hr',
    label: {
      en: 'Working Time & Shifts',
      ta: 'வேலை நேரம் & சுழற்சி முறைகள்',
      si: 'වැඩ කරන වේලාවන් සහ මුර',
    },
    description: {
      en: 'Configure factory shift timings, grace periods, late deduction rules, and schedule assignments.',
      ta: 'வேலை நேரங்கள், சலுகை கால அவகாசம் மற்றும் தாமத கழித்தல் விதிகளை அமைத்தல்.',
      si: 'වැඩ මුර වේලාවන්, සහන කාලය සහ ප්‍රමාද කප්පාදු නීති වින්‍යාස කිරීම.',
    },
  },
  {
    key: 'manage_biometric',
    group: 'biometric',
    label: {
      en: 'Biometric LAN & Hardware',
      ta: 'பயோமெட்ரிக் சாதனம் & ஹார்ட்வேர்',
      si: 'ජෛවමිතික උපාංග සහ දෘඩාංග',
    },
    description: {
      en: 'Register Hikvision fingerprint terminals, sync attendance over LAN, and map device users.',
      ta: 'ஹிக்விஷன் பயோமெட்ரிக் சாதனங்களை இணைத்தல், LAN ஒத்திசைவு மற்றும் பயனர் மேப்பிங்.',
      si: 'Hikvision ඇඟිලි සලකුණු යන්ත්‍ර ලියාපදිංචිය, LAN සමමුහුර්තකරණය සහ පරිශීලක සිතියම්කරණය.',
    },
  },
  {
    key: 'manage_salary_schemes',
    group: 'payroll',
    label: {
      en: 'Salary Schemes & 25-Day Rules',
      ta: 'சம்பள திட்டங்கள் & 25 நாள் விதிகள்',
      si: 'වැටුප් ක්‍රම සහ දින 25 නීති',
    },
    description: {
      en: 'Define Basic salaries, fixed allowances, 25-day attendance shortfall tier deductions, and OT rates.',
      ta: 'அடிப்படை சம்பளம், படிகள், 25-நாள் வருகை கழித்தல் அடுக்குகள் மற்றும் OT கட்டணங்களை அமைத்தல்.',
      si: 'මූලික වැටුප්, දීමනා, දින 25 පැමිණීමේ කප්පාදු නීති සහ අතිකාල අනුපාත සැකසීම.',
    },
  },
  {
    key: 'manage_incentives',
    group: 'payroll',
    label: {
      en: 'Seasonal & Production Incentives',
      ta: 'ருதுசார் & உற்பத்தி ஊக்கத்தொகைகள்',
      si: 'කන්නයේ සහ නිෂ්පාදන දිරිගැන්වීම්',
    },
    description: {
      en: 'Set up holiday seasonal bonuses, unit-based manufacturing slabs, sales commission tiers, and special OT.',
      ta: 'பண்டிகை கால போனஸ், உற்பத்தி அடுக்குகள், விற்பனை கமிஷன் மற்றும் சிறப்பு OT விதிகளை அமைத்தல்.',
      si: 'උත්සව දිරිගැන්වීම්, නිෂ්පාදන ප්‍රතිලාභ, විකුණුම් කොමිස් සහ විශේෂ අතිකාල නීති.',
    },
  },
  {
    key: 'run_payroll',
    group: 'payroll',
    label: {
      en: 'Calculate Monthly Payroll',
      ta: 'மாதாந்திர ஊதிய கணக்கீடு',
      si: 'මාසික වැටුප් ගණනය කිරීම',
    },
    description: {
      en: 'Compute gross salary, allowances, EPF 8%, ETF 3%, deductions, and draft net pay rolls.',
      ta: 'மொத்த சம்பளம், படிகள், EPF 8%, ETF 3%, கழிவுகள் மற்றும் நிகர ஊதியத்தை கணக்கிடுதல்.',
      si: 'දළ වැටුප, දීමනා, EPF 8%, ETF 3%, කප්පාදු සහ ශුද්ධ වැටුප ගණනය කිරීම.',
    },
  },
  {
    key: 'approve_payroll',
    group: 'payroll',
    label: {
      en: 'Lock & Approve Payroll',
      ta: 'ஊதியத்தை பூட்டுதல் & ஒப்புதல்',
      si: 'වැටුප අගුළු දැමීම සහ අනුමත කිරීම',
    },
    description: {
      en: 'Finalize, lock, or unlock monthly payroll batches to prevent unauthorized adjustments.',
      ta: 'மாதாந்திர ஊதியத் தொகுதியை இறுதி செய்து பூட்டுதல் அல்லது திறத்தல்.',
      si: 'මාසික වැටුප් කාණ්ඩය අවසන් කර අගුළු දැමීම හෝ අගුළු හැරීම.',
    },
  },
  {
    key: 'manage_epf_etf',
    group: 'payroll',
    label: {
      en: 'EPF / ETF Remittance & C-Forms',
      ta: 'EPF/ETF பணம் செலுத்துதல் & C-படிவம்',
      si: 'EPF/ETF ගෙවීම් සහ C-ආකෘති',
    },
    description: {
      en: 'Record statutory remittances to Central Bank/ETF Board and monitor outstanding balances.',
      ta: 'மத்திய வங்கி/ETF வாரியத்திற்கு சட்டபூர்வ பணம் செலுத்துவதை பதிவு செய்தல் மற்றும் நிலுவை அறிதல்.',
      si: 'මහ බැංකුව/ETF මණ්ඩලය වෙත ව්‍යවස්ථාපිත ගෙවීම් වාර්තා කිරීම සහ හිඟ ශේෂයන් බැලීම.',
    },
  },
  {
    key: 'export_reports',
    group: 'system',
    label: {
      en: 'Export Reports & Payslips',
      ta: 'அறிக்கைகள் & சம்பள சீட்டுகள் ஏற்றுமதி',
      si: 'වාර්තා සහ වැටුප් පත්‍රිකා අපනයනය',
    },
    description: {
      en: 'Print 4-per-A4 payslips, download bank payroll transfer sheets, and export Excel statutory reports.',
      ta: '4-A4 சம்பள சீட்டுகள் அச்சிடுதல், வங்கி பரிமாற்ற படிவங்கள் மற்றும் Excel அறிக்கைகள் பதிவிறக்குதல்.',
      si: 'A4 එකක වැටුප් පත්‍රිකා 4ක් මුද්‍රණය, බැංකු වැටුප් ලේඛන සහ Excel වාර්තා බාගත කිරීම.',
    },
  },
  {
    key: 'backup_restore',
    group: 'system',
    isDangerous: true,
    label: {
      en: 'Backup & Database Restore',
      ta: 'காப்புப்பிரதி & தரவு மீட்டமைப்பு',
      si: 'උපස්ථ සහ දත්ත සමුදා ප්‍රතිස්ථාපනය',
    },
    description: {
      en: 'Download timestamped system ZIP backups and restore database snapshots.',
      ta: 'முழுமையான ZIP காப்புப்பிரதியை பதிவிறக்குதல் மற்றும் தரவுத்தளத்தை மீட்டமைத்தல்.',
      si: 'සම්පූර්ණ පද්ධති උපස්ථ බාගත කිරීම සහ දත්ත සමුදාය නැවත පිහිටුවීම.',
    },
  },
  {
    key: 'view_only',
    group: 'system',
    label: {
      en: 'View-Only Restrict Mode',
      ta: 'பார்வையாளர் மட்டும் முறை (View Only)',
      si: 'නැරඹීම පමණක් සීමා කිරීම',
    },
    description: {
      en: 'Restricts user to read-only browsing without ability to save changes or submit data.',
      ta: 'தரவை மாற்றவோ சேமிக்கவோ இயலாத பார்வையாளர் மட்டும் அனுமதி.',
      si: 'දත්ත වෙනස් කිරීමට හෝ සුරැකීමට නොහැකිව නැරඹීමට පමණක් සීමා කෙරේ.',
    },
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  admin: [
    'manage_users',
    'manage_employees',
    'manage_salary_schemes',
    'manage_attendance',
    'manage_working_time',
    'manage_biometric',
    'manage_incentives',
    'run_payroll',
    'approve_payroll',
    'manage_epf_etf',
    'export_reports',
    'backup_restore',
  ],
  hr: [
    'manage_employees',
    'manage_attendance',
    'manage_working_time',
    'manage_biometric',
    'manage_incentives',
    'export_reports',
  ],
  payroll: [
    'manage_salary_schemes',
    'manage_attendance',
    'manage_incentives',
    'run_payroll',
    'approve_payroll',
    'manage_epf_etf',
    'export_reports',
  ],
  manager: [
    'manage_attendance',
    'manage_biometric',
    'export_reports',
  ],
  viewer: [
    'export_reports',
    'view_only',
  ],
};

export const ROLE_DETAILS: Record<UserRole, { label: Record<Language, string>; color: string; badgeBg: string }> = {
  admin: {
    label: {
      en: 'System Administrator',
      ta: 'கணினி நிர்வாகி (Admin)',
      si: 'පද්ධති පරිපාලක (Admin)',
    },
    color: 'text-purple-700 border-purple-200 bg-purple-50',
    badgeBg: 'bg-purple-600 text-white',
  },
  hr: {
    label: {
      en: 'HR Manager',
      ta: 'மனித வள மேலாளர் (HR)',
      si: 'මානව සම්පත් කළමනාකරු (HR)',
    },
    color: 'text-blue-700 border-blue-200 bg-blue-50',
    badgeBg: 'bg-blue-600 text-white',
  },
  payroll: {
    label: {
      en: 'Payroll Accountant',
      ta: 'ஊதியக் கணக்காளர் (Payroll)',
      si: 'වැටුප් ගණකාධිකාරී (Payroll)',
    },
    color: 'text-emerald-700 border-emerald-200 bg-emerald-50',
    badgeBg: 'bg-emerald-600 text-white',
  },
  manager: {
    label: {
      en: 'Operations Supervisor',
      ta: 'மேற்பார்வையாளர் (Supervisor)',
      si: 'මෙහෙයුම් අධීක්ෂක',
    },
    color: 'text-amber-700 border-amber-200 bg-amber-50',
    badgeBg: 'bg-amber-600 text-white',
  },
  viewer: {
    label: {
      en: 'Auditor / Read-Only Viewer',
      ta: 'தணிக்கையாளர் (Auditor/Viewer)',
      si: 'විගණක / නරඹන්නා',
    },
    color: 'text-stone-700 border-stone-200 bg-stone-100',
    badgeBg: 'bg-stone-600 text-white',
  },
};

/**
 * Checks if a user has a specific permission.
 * Admin role automatically has all permissions unless explicitly overridden.
 */
export function hasUserPermission(user: UserProfile | null | undefined, permission: UserPermission): boolean {
  if (!user) return false;
  if (user.status === 'inactive') return false;
  if (user.role === 'admin') return true; // Admins bypass checks
  
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }
  
  // Fallback to role defaults
  const defaults = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  return defaults.includes(permission);
}
