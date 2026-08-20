import React, { useState, useEffect } from 'react';
import { CompanySettings, Language, UserRole, Employee } from '../types';
import { translations } from '../translations';
import { Settings, ShieldCheck, Download, Upload, ShieldAlert, History, Database, Award, Clock, BarChart3, Fingerprint, Users } from 'lucide-react';
import JSZip from 'jszip';
import { SeasonalIncentiveModule } from './SeasonalIncentiveModule';
import { SpecialOTModule } from './SpecialOTModule';
import { ProductionSalesModule } from './ProductionSalesModule';
import { WorkingTimeModule } from './WorkingTimeModule';
import { BiometricManagement } from './BiometricManagement';
import { UserManagement } from './UserManagement';

interface ConfigurationModuleProps {
  language: Language;
  role?: UserRole;
  currentUserId?: string;
  onUserSwitch?: (user: any) => void;
}

export const ConfigurationModule: React.FC<ConfigurationModuleProps> = ({
  language,
  role = 'admin',
  currentUserId,
  onUserSwitch,
}) => {
  const t = translations[language];
  const isAdmin = role === 'admin';
  const [activeTab, setActiveTab] = useState<'users' | 'biometric' | 'backup' | 'seasonal' | 'special-ot' | 'production' | 'working-time'>('users');
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [settings, setSettings] = useState<CompanySettings>({
    company_name: 'UNIBRO SMART APPARELS (PVT) LTD',
    company_address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
    epf_employer_rate: 12,
    epf_employee_rate: 8,
    etf_employer_rate: 3,
    standard_working_days: 25,
    supabase_url: '',
    supabase_anon_key: '',
    seasonal_incentive_collision_mode: 'highest_only'
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [restoringStatus, setRestoringStatus] = useState<string>('');

  useEffect(() => {
    fetchSettings();
    fetchAuditLogs();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) setEmployees(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBackup = async () => {
    if (!isAdmin) {
      alert(t.admin_only_backup);
      return;
    }
    try {
      const res = await fetch('/api/backup', {
        headers: { 'x-user-role': role }
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t.error_occurred);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('content-disposition');
      let filename = `HRM-Backup-${new Date().toISOString().slice(0, 10)}.zip`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      alert(t.backup_success);
      fetchAuditLogs();
    } catch (err) {
      console.error(err);
      alert(t.error_occurred);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert(t.admin_only_backup);
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(t.restore_confirm)) {
      e.target.value = '';
      return;
    }

    setRestoringStatus(t.validating_backup);
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      let restoredData: any = null;
      if (zipContent.files['full_backup.json']) {
        const jsonStr = await zipContent.files['full_backup.json'].async('text');
        restoredData = JSON.parse(jsonStr);
      } else {
        alert("Invalid backup structure. Missing full_backup.json file.");
        setRestoringStatus('');
        e.target.value = '';
        return;
      }

      if (!restoredData || !restoredData.employees || !restoredData.company_settings) {
        alert("Invalid backup structure. Required tables missing.");
        setRestoringStatus('');
        e.target.value = '';
        return;
      }

      setRestoringStatus(t.restoring_data);
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role
        },
        body: JSON.stringify(restoredData)
      });

      if (res.ok) {
        alert(t.restore_success);
        window.location.reload();
      } else {
        const errData = await res.json();
        alert(errData.error || t.error_occurred);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process backup file.");
    } finally {
      setRestoringStatus('');
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{t.configuration}</h2>
          <p className="text-sm text-stone-500">Manage statutory rates, system backup & restore, seasonal incentives, and special OT rules.</p>
        </div>

        {/* Configuration Sub-nav Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'users' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            {t.user_management || "User Management & Rights"}
          </button>
          <button
            onClick={() => setActiveTab('biometric')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'biometric' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-indigo-600" />
            {t.biometric_devices || "Biometric Devices"}
          </button>
          <button
            onClick={() => setActiveTab('working-time')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'working-time' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            Working Time & Shifts
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'backup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'seasonal' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            {t.seasonal_incentives}
          </button>
          <button
            onClick={() => setActiveTab('special-ot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'special-ot' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            {t.special_ot_rules}
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'production' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            {t.production_sales_data}
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center">
          <ShieldAlert className="w-5 h-5 text-amber-600 mr-2 shrink-0" />
          <span>{t.admin_only_backup}</span>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* System Backup & Restore Section */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-lg font-bold text-stone-900 flex items-center">
                <Database className="w-5 h-5 text-emerald-600 mr-2" />
                {t.backup_restore_section}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                Admin Secured
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Backup Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-1">Create System Backup</h4>
                  <p className="text-xs text-stone-500">
                    Download a secure ZIP archive containing all application tables (.xlsx Excel files) including employees, attendance, payroll, leave, seasonal incentive rules, special OT rules, and settings.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  disabled={!isAdmin}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition-all ${
                    isAdmin
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.download_daily_backup}
                </button>
              </div>

              {/* Restore Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-1">{t.restore_backup}</h4>
                  <p className="text-xs text-stone-500">
                    Upload a previously downloaded ZIP backup to restore all application records and database tables securely.
                  </p>
                </div>

                <div>
                  {restoringStatus ? (
                    <div className="text-center py-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold animate-pulse">
                      {restoringStatus}
                    </div>
                  ) : (
                    <label className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xs transition-all ${
                      isAdmin
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}>
                      <Upload className="w-4 h-4 mr-2" />
                      <span>{t.restore_backup}</span>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleRestoreBackup}
                        disabled={!isAdmin}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

            </div>

            {/* Audit Log Table */}
            <div className="pt-6 border-t border-stone-200 space-y-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center">
                <History className="w-4 h-4 text-stone-600 mr-2" />
                {t.audit_log_title} ({auditLogs.length})
              </h4>

              {auditLogs.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs">No backup or restore history recorded yet.</div>
              ) : (
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Timestamp</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 font-medium text-stone-800">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-xs ${
                              log.action === 'BACKUP' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600">{log.user}</td>
                          <td className="px-4 py-3 text-stone-600">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <UserManagement
          language={language}
          currentRole={role}
          currentUserId={currentUserId}
          onUserSwitch={onUserSwitch}
        />
      )}

      {activeTab === 'biometric' && (
        <BiometricManagement
          t={(k) => (t as any)[k] || k}
          lang={language}
          employees={employees}
          onRefreshParent={fetchEmployees}
        />
      )}
      {activeTab === 'seasonal' && <SeasonalIncentiveModule language={language} />}
      {activeTab === 'special-ot' && <SpecialOTModule language={language} />}
      {activeTab === 'production' && <ProductionSalesModule language={language} />}
      {activeTab === 'working-time' && <WorkingTimeModule language={language} />}
    </div>
  );
};
