import React from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  Calculator, 
  Printer, 
  Database, 
  Fingerprint, 
  ShieldCheck, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Download
} from 'lucide-react';

interface MockupProps {
  type: string;
}

export const HelpMockup: React.FC<MockupProps> = ({ type }) => {
  switch (type) {
    case 'dashboard':
      return (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border border-stone-800 shadow-inner font-sans my-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Dashboard Cockpit</span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">LAN 192.168.1.201 • Synced 08:04 AM</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <span className="text-[10px] text-stone-400 block font-semibold uppercase">Present</span>
              <span className="text-lg font-black text-emerald-400">42</span>
            </div>
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <span className="text-[10px] text-stone-400 block font-semibold uppercase">On Leave</span>
              <span className="text-lg font-black text-amber-400">3</span>
            </div>
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <span className="text-[10px] text-stone-400 block font-semibold uppercase">Absent</span>
              <span className="text-lg font-black text-rose-400">1</span>
            </div>
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <span className="text-[10px] text-stone-400 block font-semibold uppercase">Overtime</span>
              <span className="text-lg font-black text-indigo-400">18</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-2 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span className="text-stone-300 font-medium text-[11px]">Hikvision DS-K1A8503MF: Online (LAN Connected)</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">100% HEALTH</span>
          </div>
        </div>
      );

    case 'employee-form':
      return (
        <div className="bg-white rounded-xl p-4 border border-violet-200 shadow-xs font-sans my-4 text-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
            <span className="text-xs font-bold text-violet-700 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Employee Master Profile
            </span>
            <span className="text-[10px] bg-violet-50 text-violet-700 font-semibold px-2 py-0.5 rounded-full">Trilingual Ready</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <span className="text-stone-500 block text-[9px] uppercase font-bold">English Name</span>
              <span className="font-semibold text-stone-800">Kamal Perera</span>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <span className="text-stone-500 block text-[9px] uppercase font-bold">National ID (NIC)</span>
              <span className="font-semibold text-stone-800 font-mono">199123456789</span>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <span className="text-stone-500 block text-[9px] uppercase font-bold">Tamil Name</span>
              <span className="font-semibold text-stone-800">கමල් පෙරේරා / கமல் பெரேரா</span>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <span className="text-stone-500 block text-[9px] uppercase font-bold">Department / Scheme</span>
              <span className="font-semibold text-stone-800">Production - Grade A</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-[10px] text-stone-600 bg-violet-50/60 p-2 rounded border border-violet-100 font-medium">
            <span className="flex items-center text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> EPF (8%+12%)</span>
            <span className="flex items-center text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> ETF (3%)</span>
            <span className="flex items-center text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> OT Eligible</span>
          </div>
        </div>
      );

    case 'payroll-run':
      return (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border border-stone-800 shadow-inner font-sans my-4 text-xs">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2.5">
            <span className="font-bold text-emerald-400 flex items-center">
              <Calculator className="w-3.5 h-3.5 mr-1.5" /> Payroll Calculation Execution
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">August 2026</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between py-1 border-b border-stone-800 text-stone-300">
              <span>Basic Salary (25 Days)</span>
              <span className="font-bold text-white">LKR 45,000.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-800 text-rose-400">
              <span>(-) No Pay Leave Deduction (2 Days)</span>
              <span>- LKR 3,600.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-800 text-emerald-400">
              <span>(+) Normal & Special Overtime (14 Hrs)</span>
              <span>+ LKR 4,725.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-800 text-indigo-400">
              <span>(+) Target Production Incentive</span>
              <span>+ LKR 5,000.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-800 text-rose-400">
              <span>(-) Employee Statutory EPF (8%)</span>
              <span>- LKR 3,312.00</span>
            </div>
            <div className="flex justify-between pt-1.5 text-xs font-bold text-emerald-300">
              <span>NET PAYABLE SALARY</span>
              <span className="text-sm text-emerald-400">LKR 47,813.00</span>
            </div>
          </div>
        </div>
      );

    case 'payslip-4a4':
      return (
        <div className="bg-stone-100 rounded-xl p-3 border border-stone-300 shadow-xs font-sans my-4 text-[10px] text-stone-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-stone-900 uppercase tracking-tight flex items-center">
              <Printer className="w-3.5 h-3.5 mr-1 text-indigo-600" /> 4-Per-A4 Sheet Grid Print Layout
            </span>
            <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[9px]">A4 Perforated</span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border border-stone-200 border-dashed">
            <div className="border border-stone-300 p-2 rounded bg-stone-50/50">
              <div className="font-bold text-stone-900 border-b pb-0.5 text-[9px]">UNIBRO SMART APPARELS</div>
              <div className="text-[8px] text-stone-500">Emp #101 • Kamal Perera</div>
              <div className="flex justify-between text-[8px] mt-1 font-semibold text-emerald-700">
                <span>Net Salary:</span>
                <span>LKR 47,813</span>
              </div>
              <div className="border-t border-dashed mt-1.5 pt-0.5 text-[7px] text-stone-400 flex justify-between">
                <span>Emp Sign: _______</span>
                <span>Auth: _______</span>
              </div>
            </div>

            <div className="border border-stone-300 p-2 rounded bg-stone-50/50">
              <div className="font-bold text-stone-900 border-b pb-0.5 text-[9px]">UNIBRO SMART APPARELS</div>
              <div className="text-[8px] text-stone-500">Emp #102 • Priya Fernando</div>
              <div className="flex justify-between text-[8px] mt-1 font-semibold text-emerald-700">
                <span>Net Salary:</span>
                <span>LKR 51,200</span>
              </div>
              <div className="border-t border-dashed mt-1.5 pt-0.5 text-[7px] text-stone-400 flex justify-between">
                <span>Emp Sign: _______</span>
                <span>Auth: _______</span>
              </div>
            </div>

            <div className="border border-stone-300 p-2 rounded bg-stone-50/50">
              <div className="font-bold text-stone-900 border-b pb-0.5 text-[9px]">UNIBRO SMART APPARELS</div>
              <div className="text-[8px] text-stone-500">Emp #103 • Sunil Jayasinghe</div>
              <div className="flex justify-between text-[8px] mt-1 font-semibold text-emerald-700">
                <span>Net Salary:</span>
                <span>LKR 38,950</span>
              </div>
              <div className="border-t border-dashed mt-1.5 pt-0.5 text-[7px] text-stone-400 flex justify-between">
                <span>Emp Sign: _______</span>
                <span>Auth: _______</span>
              </div>
            </div>

            <div className="border border-stone-300 p-2 rounded bg-stone-50/50">
              <div className="font-bold text-stone-900 border-b pb-0.5 text-[9px]">UNIBRO SMART APPARELS</div>
              <div className="text-[8px] text-stone-500">Emp #104 • Fathima Rameez</div>
              <div className="flex justify-between text-[8px] mt-1 font-semibold text-emerald-700">
                <span>Net Salary:</span>
                <span>LKR 44,100</span>
              </div>
              <div className="border-t border-dashed mt-1.5 pt-0.5 text-[7px] text-stone-400 flex justify-between">
                <span>Emp Sign: _______</span>
                <span>Auth: _______</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'biometric-lan':
      return (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border border-stone-800 shadow-inner font-sans my-4 text-xs">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
            <span className="font-bold text-purple-400 flex items-center">
              <Fingerprint className="w-3.5 h-3.5 mr-1.5" /> Biometric LAN Network Architecture
            </span>
            <span className="text-[10px] text-stone-400 font-mono">ISAPI Digest Auth</span>
          </div>

          <div className="flex items-center justify-between space-x-2 text-[10px] text-center mb-3">
            <div className="bg-stone-800 p-2.5 rounded-lg border border-purple-900/50 flex-1">
              <Fingerprint className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <span className="font-bold block text-white">Hikvision DS-K1A8503MF</span>
              <span className="text-[9px] text-stone-400 font-mono">192.168.1.201</span>
            </div>

            <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />

            <div className="bg-stone-800 p-2.5 rounded-lg border border-indigo-900/50 flex-1">
              <Wifi className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
              <span className="font-bold block text-white">Windows Sync Service</span>
              <span className="text-[9px] text-emerald-400 font-semibold">Auto-Poll 5 Min</span>
            </div>

            <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />

            <div className="bg-stone-800 p-2.5 rounded-lg border border-emerald-900/50 flex-1">
              <Database className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <span className="font-bold block text-white">HRM Database</span>
              <span className="text-[9px] text-stone-400">SHA-256 Deduplicated</span>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/40 rounded p-2 text-[10px] text-purple-200">
            <span className="font-bold text-purple-300">Offline Resilience:</span> If network connection drops, punches are queued safely on the local PC disk and flushed automatically upon reconnection.
          </div>
        </div>
      );

    case 'backup-zip':
      return (
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs font-sans my-4 text-xs text-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
            <span className="font-bold text-amber-800 flex items-center">
              <Database className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Daily Encrypted Backup ZIP Bundle
            </span>
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[9px]">Admin Only</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] mb-2 font-mono">
            <div className="bg-stone-50 p-2 rounded border border-stone-200 flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>database.sqlite</span>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200 flex items-center space-x-2">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>employees.xlsx</span>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200 flex items-center space-x-2">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>payroll_history.xlsx</span>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200 flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>company_settings.json</span>
            </div>
          </div>
          <span className="text-[10px] text-stone-500 block">Checksum SHA-256 verified before any database restore.</span>
        </div>
      );

    case 'epf-calc':
      return (
        <div className="bg-teal-950 text-teal-100 rounded-xl p-4 border border-teal-800 shadow-inner font-sans my-4 text-xs">
          <div className="flex items-center justify-between border-b border-teal-800 pb-2 mb-2.5">
            <span className="font-bold text-teal-300 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Sri Lankan Statutory EPF & ETF Breakdown
            </span>
            <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[9px] font-bold">CBSL Mandate</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-2">
            <div className="bg-teal-900/60 p-2 rounded border border-teal-700">
              <span className="text-teal-400 font-bold block text-[9px]">EMPLOYEE EPF</span>
              <span className="text-sm font-extrabold text-white">8%</span>
              <span className="text-[8px] text-teal-300 block">Deducted from Basic</span>
            </div>
            <div className="bg-teal-900/60 p-2 rounded border border-teal-700">
              <span className="text-teal-400 font-bold block text-[9px]">EMPLOYER EPF</span>
              <span className="text-sm font-extrabold text-white">12%</span>
              <span className="text-[8px] text-teal-300 block">Factory Contribution</span>
            </div>
            <div className="bg-teal-900/60 p-2 rounded border border-teal-700">
              <span className="text-teal-400 font-bold block text-[9px]">EMPLOYER ETF</span>
              <span className="text-sm font-extrabold text-white">3%</span>
              <span className="text-[8px] text-teal-300 block">Trust Fund Board</span>
            </div>
          </div>
          <span className="text-[9.5px] text-teal-300/80 block">Qualifying Base = Basic Salary - No Pay Leave Shortfall</span>
        </div>
      );

    default:
      return null;
  }
};
