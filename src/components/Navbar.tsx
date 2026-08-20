import React from 'react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';
import { Globe, Shield, LogOut, Building2, HelpCircle } from 'lucide-react';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onNavigate: (view: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config' | 'help') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  role,
  setRole,
  onNavigate,
  currentView
}) => {
  const t = translations[language];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">{t.app_title}</h1>
              <p className="text-xs text-stone-500 hidden sm:block">{t.app_subtitle}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => onNavigate('employees')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'employees' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.employees}
            </button>
            <button
              onClick={() => onNavigate('salary-schemes')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'salary-schemes' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.salary_schemes}
            </button>
            <button
              onClick={() => onNavigate('run-payroll')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'run-payroll' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.run_payroll}
            </button>
            <button
              onClick={() => onNavigate('epf-etf')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'epf-etf' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.epf_etf_balance}
            </button>
            <button
              onClick={() => onNavigate('config')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'config' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.configuration}
            </button>
            <button
              onClick={() => onNavigate('help')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                currentView === 'help' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-indigo-600 hover:bg-indigo-50/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t.help_center}</span>
            </button>
          </nav>

          {/* Language, Role Switcher & Quick Help */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Help Header Button */}
            <button
              onClick={() => onNavigate('help')}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
              title="Open Built-in Help Center"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help</span>
            </button>

            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg">
              <Globe className="w-4 h-4 text-stone-500 ml-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-medium text-stone-700 focus:outline-hidden cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="si">සිංහල</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center space-x-1 bg-stone-100 p-1 rounded-lg">
              <Shield className="w-4 h-4 text-emerald-600 ml-1" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-medium text-stone-700 focus:outline-hidden cursor-pointer pr-1 uppercase"
              >
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="payroll">Payroll</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

