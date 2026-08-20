import React, { useState, useEffect } from 'react';
import { CompanySettings, Language, UserRole } from '../types';
import { translations } from '../translations';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Save, 
  Key, 
  Globe, 
  Code, 
  ExternalLink, 
  Shield, 
  Server,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { testSupabaseConnection, SupabaseConnectionStatus } from '../utils/supabaseClient';

interface SupabaseSettingsProps {
  language: Language;
  role: UserRole;
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => Promise<void>;
}

export const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({
  language,
  role,
  settings,
  onSaveSettings
}) => {
  const t = translations[language];
  const isAdmin = role === 'admin';

  const [formData, setFormData] = useState({
    supabase_url: settings.supabase_url || '',
    supabase_anon_key: settings.supabase_anon_key || '',
    company_name: settings.company_name || 'UNIBRO SMART APPARELS (PVT) LTD',
    company_address: settings.company_address || 'No. 45, Galle Road, Colombo 03, Sri Lanka',
    epf_employer_rate: settings.epf_employer_rate ?? 12,
    epf_employee_rate: settings.epf_employee_rate ?? 8,
    etf_employer_rate: settings.etf_employer_rate ?? 3,
    standard_working_days: settings.standard_working_days ?? 25
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseConnectionStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    setFormData({
      supabase_url: settings.supabase_url || '',
      supabase_anon_key: settings.supabase_anon_key || '',
      company_name: settings.company_name || 'UNIBRO SMART APPARELS (PVT) LTD',
      company_address: settings.company_address || 'No. 45, Galle Road, Colombo 03, Sri Lanka',
      epf_employer_rate: settings.epf_employer_rate ?? 12,
      epf_employee_rate: settings.epf_employee_rate ?? 8,
      etf_employer_rate: settings.etf_employer_rate ?? 3,
      standard_working_days: settings.standard_working_days ?? 25
    });

    if (settings.supabase_url && settings.supabase_anon_key) {
      handleTest(settings.supabase_url, settings.supabase_anon_key);
    }
  }, [settings]);

  const handleTest = async (urlOverride?: string, keyOverride?: string) => {
    const urlToTest = urlOverride !== undefined ? urlOverride : formData.supabase_url;
    const keyToTest = keyOverride !== undefined ? keyOverride : formData.supabase_anon_key;

    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(urlToTest, keyToTest);
      setTestResult(result);
    } catch (e: any) {
      setTestResult({
        connected: false,
        message: e?.message || 'Error occurred while testing connectivity.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        ...formData
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await handleTest(formData.supabase_url, formData.supabase_anon_key);
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const copySqlSchema = () => {
    const sqlScript = `-- Supabase PostgreSQL Schema for UNIBRO SMART APPARELS
CREATE TABLE IF NOT EXISTS company_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL,
  company_address TEXT,
  epf_employer_rate NUMERIC DEFAULT 12,
  epf_employee_rate NUMERIC DEFAULT 8,
  etf_employer_rate NUMERIC DEFAULT 3,
  standard_working_days INTEGER DEFAULT 25,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_schemes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  basic_salary NUMERIC NOT NULL,
  fixed_allowance_25_days NUMERIC DEFAULT 0,
  deduct_day_1 NUMERIC DEFAULT 0,
  deduct_day_2 NUMERIC DEFAULT 0,
  deduct_day_3 NUMERIC DEFAULT 0,
  deduct_day_4 NUMERIC DEFAULT 0,
  deduct_additional_day NUMERIC DEFAULT 0,
  ot_normal_rate_per_hour NUMERIC DEFAULT 0,
  ot_off_rate_per_hour NUMERIC DEFAULT 0,
  ot_poya_rate_per_hour NUMERIC DEFAULT 0,
  epf_etf_applicable BOOLEAN DEFAULT true,
  budgetary_relief NUMERIC DEFAULT 0,
  bra_allowance NUMERIC DEFAULT 0,
  epf_applicable_allowances NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_number TEXT UNIQUE NOT NULL,
  full_name_en TEXT NOT NULL,
  full_name_ta TEXT,
  full_name_si TEXT,
  nic TEXT,
  department TEXT,
  designation TEXT,
  join_date DATE,
  employment_status TEXT DEFAULT 'Active',
  epf_enabled BOOLEAN DEFAULT true,
  etf_enabled BOOLEAN DEFAULT true,
  ot_eligible BOOLEAN DEFAULT true,
  salary_scheme_id TEXT REFERENCES salary_schemes(id),
  bank_name TEXT,
  bank_branch TEXT,
  bank_account_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  status TEXT DEFAULT 'Draft',
  is_locked BOOLEAN DEFAULT false,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  employee_count INTEGER DEFAULT 0,
  total_gross_pay NUMERIC DEFAULT 0,
  total_net_pay NUMERIC DEFAULT 0,
  total_epf_employee NUMERIC DEFAULT 0,
  total_epf_employer NUMERIC DEFAULT 0,
  total_etf_employer NUMERIC DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb
);`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Database className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Supabase Cloud Database Connectivity</h3>
              <p className="text-xs text-stone-500">Real-time PostgreSQL synchronization, biometric cloud sync & remote backup</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleTest()}
              disabled={testing}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center space-x-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{testing ? 'Testing...' : 'Check Connection Now'}</span>
            </button>
          </div>
        </div>

        {/* Live Status Result */}
        <div className="mt-5">
          {testResult ? (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
              testResult.connected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm">
                  {testResult.connected ? 'Connected to Supabase' : 'Connection Failed / Not Configured'}
                </div>
                <div>{testResult.message}</div>
                {testResult.latencyMs !== undefined && (
                  <div className="text-stone-500 font-mono">Response time: {testResult.latencyMs} ms</div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 text-xs flex items-center space-x-2">
              <Server className="w-4 h-4 text-stone-400" />
              <span>
                {formData.supabase_url ? 'Click "Check Connection Now" to test connectivity to your Supabase project.' : 'No Supabase credentials entered. Operating in offline/client storage mode.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center">
            <Key className="w-4 h-4 text-emerald-600 mr-2" />
            Supabase Project Credentials
          </h4>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
            {isAdmin ? 'Admin Editable' : 'Read Only'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase">
              Supabase Project URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={formData.supabase_url}
                onChange={(e) => setFormData({ ...formData, supabase_url: e.target.value })}
                disabled={!isAdmin}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs font-mono bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Found in your Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase">
              Anon / Public API Key (or Service Role Key)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={formData.supabase_anon_key}
                onChange={(e) => setFormData({ ...formData, supabase_anon_key: e.target.value })}
                disabled={!isAdmin}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs font-mono bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Found in your Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-stone-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Credentials are securely encrypted in system settings.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center">
                <Check className="w-4 h-4 mr-1 text-emerald-600" /> Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={!isAdmin || saving}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-xs ${
                isAdmin 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Supabase Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* SQL Setup Helper */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="font-bold text-sm text-white">Supabase PostgreSQL Quick Schema</h4>
              <p className="text-xs text-stone-400">Run this DDL script in your Supabase SQL Editor if you are setting up a new database</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={copySqlSchema}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
            <a
              href="/api/supabase-schema"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full SQL DDL</span>
            </a>
          </div>
        </div>

        <div className="bg-stone-950 p-4 rounded-xl font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-48 border border-stone-800">
          <pre>{`-- 1. Create tables
CREATE TABLE IF NOT EXISTS company_settings (id TEXT PRIMARY KEY, company_name TEXT, ...);
CREATE TABLE IF NOT EXISTS salary_schemes (id TEXT PRIMARY KEY, name TEXT, basic_salary NUMERIC, ...);
CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY, employee_number TEXT UNIQUE, ...);
CREATE TABLE IF NOT EXISTS payroll_runs (id TEXT PRIMARY KEY, month TEXT, items JSONB, ...);
CREATE TABLE IF NOT EXISTS biometric_attendance_logs (id TEXT PRIMARY KEY, timestamp TIMESTAMPTZ, ...);`}</pre>
        </div>
      </div>
    </div>
  );
};
