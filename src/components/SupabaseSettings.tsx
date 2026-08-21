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
  Check,
  ArrowUpToLine,
  AlertTriangle,
  Layers,
  Table,
  Users,
  FileSpreadsheet,
  Cpu,
  UserCheck,
  Clock,
  DollarSign
} from 'lucide-react';
import { 
  testSupabaseConnection, 
  SupabaseConnectionStatus, 
  syncAllDataToSupabase, 
  diagnoseAllTables,
  TableHealthReport,
  APP_TABLE_DEFINITIONS,
  SUPABASE_MIGRATION_SQL
} from '../utils/supabaseClient';

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
  const [tableReports, setTableReports] = useState<TableHealthReport[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

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
      if (result.tableReports) {
        setTableReports(result.tableReports);
      }
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

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncAllDataToSupabase();
      if (res.success) {
        setSyncStatus(`Successfully synced ${res.employeesSynced} employees, ${res.schemesSynced} salary schemes, ${res.devicesSynced ?? 0} biometric devices, and ${res.logsSynced ?? 0} in/out attendance logs to Supabase!`);
        await handleTest();
      } else {
        setSyncStatus(`Sync issue: ${res.error || 'Check database permissions.'}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 8000);
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'company_settings': return <Globe className="w-4 h-4 text-sky-600" />;
      case 'salary_schemes': return <FileSpreadsheet className="w-4 h-4 text-purple-600" />;
      case 'employees': return <Users className="w-4 h-4 text-emerald-600" />;
      case 'biometric_devices': return <Cpu className="w-4 h-4 text-amber-600" />;
      case 'biometric_user_mappings': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'biometric_attendance_logs': return <Clock className="w-4 h-4 text-rose-600" />;
      case 'payroll_runs': return <DollarSign className="w-4 h-4 text-teal-600" />;
      default: return <Table className="w-4 h-4 text-stone-600" />;
    }
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
              <p className="text-xs text-stone-500">Real-time PostgreSQL synchronization, remote backup & multi-device sync</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {formData.supabase_url && (
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncing || testing}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2 border border-emerald-200 transition cursor-pointer"
              >
                <ArrowUpToLine className={`w-3.5 h-3.5 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync All Data to Supabase'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleTest()}
              disabled={testing}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center space-x-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{testing ? 'Checking All Tables...' : 'Check All Tables Now'}</span>
            </button>
          </div>
        </div>

        {/* Sync Toast */}
        {syncStatus && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Live Status Result */}
        <div className="mt-5">
          {testResult ? (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
              testResult.missingColumns
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : testResult.connected 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.missingColumns ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : testResult.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs flex-1">
                <div className="font-bold text-sm">
                  {testResult.missingColumns 
                    ? 'Connected — Table Schema Notice' 
                    : testResult.connected 
                      ? 'Connected & All Tables Verified' 
                      : 'Connection Failed / Not Configured'}
                </div>
                <div>{testResult.message}</div>
                {testResult.latencyMs !== undefined && (
                  <div className="text-stone-500 font-mono">Response time: {testResult.latencyMs} ms</div>
                )}
                {testResult.missingColumns && (
                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={copySqlSchema}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied Migration SQL!' : 'Copy SQL Migration Fix'}</span>
                    </button>
                    <a
                      href="https://supabase.com/dashboard/project/_/sql"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-800 hover:text-amber-900 underline font-medium flex items-center space-x-1"
                    >
                      <span>Open Supabase SQL Editor</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 text-xs flex items-center space-x-2">
              <Server className="w-4 h-4 text-stone-400" />
              <span>
                {formData.supabase_url ? 'Click "Check All Tables Now" to run comprehensive diagnostics across every database table.' : 'No Supabase credentials entered. Operating in offline/client storage mode.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Individual Table Diagnostics Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h4 className="text-sm font-bold text-stone-900 flex items-center">
              <Layers className="w-4 h-4 text-emerald-600 mr-2" />
              Every Table Sync & Health Status ({APP_TABLE_DEFINITIONS.length} Tables)
            </h4>
            <p className="text-xs text-stone-500">Live schema verification, RLS security policies, and row count check per table</p>
          </div>
          <button
            type="button"
            onClick={copySqlSchema}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied Full Schema SQL' : 'Copy All Tables Schema SQL'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(tableReports.length > 0 ? tableReports : APP_TABLE_DEFINITIONS.map(def => ({
            tableName: def.name,
            displayName: def.label,
            status: formData.supabase_url ? 'warning' : 'missing_table',
            statusText: formData.supabase_url ? 'Pending Verification' : 'Not Configured',
            rowCount: 0,
            errorDetails: undefined,
            fixRecommendation: undefined
          } as TableHealthReport))).map((report, idx) => (
            <div 
              key={report.tableName || idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                report.status === 'healthy'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : report.status === 'warning'
                    ? 'bg-amber-50/50 border-amber-200'
                    : report.status === 'missing_table'
                      ? 'bg-rose-50/40 border-rose-200'
                      : report.status === 'rls_blocked'
                        ? 'bg-purple-50/40 border-purple-200'
                        : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getTableIcon(report.tableName)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900">{report.displayName}</div>
                    <div className="font-mono text-[10px] text-stone-500">{report.tableName}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {report.status === 'healthy' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Ready</span>
                    </span>
                  )}
                  {report.status === 'warning' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{report.statusText}</span>
                    </span>
                  )}
                  {(report.status === 'missing_table' || report.status === 'error') && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center space-x-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>{report.statusText}</span>
                    </span>
                  )}
                  {report.status === 'rls_blocked' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-purple-600" />
                      <span>RLS Blocked</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100/80">
                <span className="text-stone-500">
                  Rows in Supabase: <strong className="font-mono text-stone-800">{report.rowCount}</strong>
                </span>
                {report.errorDetails ? (
                  <span className="text-[10px] text-rose-700 truncate max-w-[200px]" title={report.errorDetails}>
                    {report.errorDetails}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-medium">Synced & Queryable</span>
                )}
              </div>

              {report.fixRecommendation && (
                <div className="p-2 rounded-lg bg-white/80 border border-stone-200 text-[10px] text-stone-700">
                  <span className="font-semibold text-stone-900">Recommended fix:</span> {report.fixRecommendation}
                </div>
              )}
            </div>
          ))}
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
              <h4 className="font-bold text-sm text-white">Supabase PostgreSQL Quick Schema & RLS</h4>
              <p className="text-xs text-stone-400">Run this DDL script in your Supabase SQL Editor to create tables with public access</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={copySqlSchema}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
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

        <div className="bg-stone-950 p-4 rounded-xl font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-56 border border-stone-800">
          <pre>{`-- 1. Create tables with TEXT keys for seamless sync
CREATE TABLE IF NOT EXISTS company_settings (id TEXT PRIMARY KEY DEFAULT 'default', company_name TEXT, ...);
CREATE TABLE IF NOT EXISTS salary_schemes (id TEXT PRIMARY KEY, name TEXT, basic_salary NUMERIC, ...);
CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY, employee_number TEXT UNIQUE, ...);
CREATE TABLE IF NOT EXISTS biometric_devices (id TEXT PRIMARY KEY, name TEXT, ip_address TEXT, ...);
CREATE TABLE IF NOT EXISTS biometric_attendance_logs (id TEXT PRIMARY KEY, timestamp TIMESTAMPTZ, ...);
CREATE TABLE IF NOT EXISTS payroll_runs (id TEXT PRIMARY KEY, month TEXT, items JSONB, ...);

-- 2. Permissive RLS Policies for Web Client
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access employees" ON employees FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;`}</pre>
        </div>
      </div>
    </div>
  );
};
