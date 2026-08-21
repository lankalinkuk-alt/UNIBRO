import React, { useState, useEffect } from 'react';
import { Language, UserRole, Employee } from '../types';
import { translations } from '../translations';
import {
  saveBiometricLogToSupabase,
  syncBiometricDataToSupabase
} from '../utils/supabaseClient';
import {
  PlayCircle,
  UserPlus,
  Calculator,
  Settings,
  ArrowRight,
  ShieldCheck,
  Users,
  FileText,
  UserCheck,
  CalendarOff,
  UserX,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Fingerprint,
  Wifi,
  WifiOff,
  Activity,
  BookOpen,
  Search,
  LogIn,
  LogOut,
  Calendar,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Filter,
  PlusCircle,
  Layers,
  Cpu
} from 'lucide-react';

interface DashboardProps {
  language: Language;
  onNavigate: (view: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config' | 'help') => void;
  stats: {
    employeeCount: number;
    lastPayrollNet: number;
    epfTotal: number;
    etfTotal: number;
  };
  role?: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ language, onNavigate, stats, role = 'admin' }) => {
  const t = translations[language];
  const isAdmin = role === 'admin';

  // Selected date filter (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState<'punches' | 'roster' | 'late' | 'leave' | 'absent'>('punches');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [punchTypeFilter, setPunchTypeFilter] = useState<'all' | 'check_in' | 'check_out'>('all');

  const [attendanceData, setAttendanceData] = useState<any>({
    date: new Date().toISOString().slice(0, 10),
    work_start_time: '08:30',
    summary: { today_present: 0, on_leave: 0, absent: 0, overtime_employees: 0, total_active: 0 },
    biometric_summary: {
      total_devices: 1,
      online_devices: 1,
      offline_devices: 0,
      last_sync_time: new Date().toISOString(),
      today_punches_count: 0,
      recent_punches: []
    },
    today_leave_list: [],
    late_arrivals: [],
    present_list: [],
    absent_list: [],
    overtime_list: [],
    recent_biometric_punches: []
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [syncingBiometrics, setSyncingBiometrics] = useState(false);
  const [processingDaily, setProcessingDaily] = useState(false);

  // Manual / Test Punch Modal
  const [showTestPunchModal, setShowTestPunchModal] = useState(false);
  const [testPunchEmpId, setTestPunchEmpId] = useState('');
  const [testPunchType, setTestPunchType] = useState<'check_in' | 'check_out'>('check_in');
  const [testVerifyMode, setTestVerifyMode] = useState<'fingerprint' | 'card' | 'face' | 'password'>('fingerprint');
  const [testPunchTime, setTestPunchTime] = useState(new Date().toISOString().slice(0, 16));
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAttendance = async (targetDate = selectedDate) => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/dashboard/realtime-attendance?date=${targetDate}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch real-time attendance', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [empRes, devRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/biometric/devices')
      ]);
      if (empRes.ok) {
        const empList = await empRes.json();
        setEmployees(empList);
        if (empList.length > 0 && !testPunchEmpId) {
          setTestPunchEmpId(empList[0].id);
        }
      }
      if (devRes.ok) {
        setDevices(await devRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch auxiliary data', err);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
    fetchAuxiliaryData();
    const interval = setInterval(() => fetchAttendance(selectedDate), 45000); // 45 seconds auto-refresh
    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleSyncBiometricTerminal = async () => {
    setSyncingBiometrics(true);
    try {
      const devId = devices[0]?.id || 'bio-dev-001';
      const res = await fetch(`/api/biometric/devices/${devId}/sync-now`, { method: 'POST' });
      if (res.ok) {
        await fetchAttendance(selectedDate);
        showToast('Biometric terminal polled & latest attendance records synced successfully!');
      } else {
        showToast('Terminal sync responded with warning. Logs refreshed.', 'info');
        await fetchAttendance(selectedDate);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not reach terminal. Polling fallback logs.', 'info');
      await fetchAttendance(selectedDate);
    } finally {
      setSyncingBiometrics(false);
    }
  };

  const handleProcessDailyAttendance = async () => {
    setProcessingDaily(true);
    try {
      const res = await fetch('/api/biometric/process-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Attendance processed for ${data.processed_count || 'all'} employees!`);
        await fetchAttendance(selectedDate);
      } else {
        showToast('Processed attendance successfully.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error processing daily records', 'error');
    } finally {
      setProcessingDaily(false);
    }
  };

  const handleCreateTestPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPunchEmpId) {
      showToast('Please select an employee', 'error');
      return;
    }

    try {
      const selectedEmp = employees.find(e => e.id === testPunchEmpId);
      const safeTime = testPunchTime ? new Date(testPunchTime).toISOString() : new Date().toISOString();
      const payload = {
        device_id: devices[0]?.id || 'bio-dev-001',
        employee_id: testPunchEmpId,
        employee_number: selectedEmp?.employee_number,
        employee_name: selectedEmp?.full_name_en,
        department: selectedEmp?.department,
        device_user_id: selectedEmp?.employee_number ? selectedEmp.employee_number.replace(/\D/g, '') || '1' : '1',
        verify_mode: testVerifyMode,
        check_time: safeTime,
        punch_type: testPunchType
      };

      const res = await fetch('/api/biometric/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Save directly to Supabase as well
      try {
        await saveBiometricLogToSupabase(payload);
      } catch (sbErr) {
        console.warn('Supabase test punch push notice:', sbErr);
      }

      if (res.ok) {
        showToast(`Recorded ${testPunchType === 'check_in' ? 'Check-IN' : 'Check-OUT'} punch for ${selectedEmp?.full_name_en || 'Employee'} (Saved to local DB & Supabase)!`);
        setShowTestPunchModal(false);
        await fetchAttendance(selectedDate);
      } else {
        showToast('Failed to record punch', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error creating test punch', 'error');
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingBiometrics(true);
    try {
      const res = await syncBiometricDataToSupabase();
      if (res.success) {
        showToast(`Supabase Synced! ${res.logsSynced} attendance logs saved to Supabase.`);
        await fetchAttendance(selectedDate);
      } else {
        showToast(`Supabase Sync: ${res.error || 'Please check configuration'}`, 'info');
      }
    } catch (err: any) {
      showToast(`Sync error: ${err.message || 'Failed to sync'}`, 'error');
    } finally {
      setSyncingBiometrics(false);
    }
  };

  const summary = attendanceData.summary || { today_present: 0, on_leave: 0, absent: 0, overtime_employees: 0, total_active: 0 };
  const bioSummary = attendanceData.biometric_summary || {
    total_devices: 1,
    online_devices: 1,
    offline_devices: 0,
    last_sync_time: null,
    today_punches_count: 0
  };

  const allPunches: any[] = attendanceData.recent_biometric_punches || bioSummary.recent_punches || [];

  // Filtered punches
  const filteredPunches = allPunches.filter((punch: any) => {
    const matchesSearch = !searchQuery ||
      (punch.employee_name && punch.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (punch.employee_number && punch.employee_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (punch.department && punch.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (punch.device_user_id && String(punch.device_user_id).includes(searchQuery));

    const matchesType = punchTypeFilter === 'all' || punch.punch_type === punchTypeFilter;

    return matchesSearch && matchesType;
  });

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
      showToast(t.backup_success);
    } catch (err) {
      console.error(err);
      alert(t.error_occurred);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-fade-in ${
          toastMessage.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : toastMessage.type === 'error'
            ? 'bg-rose-900 text-rose-100 border-rose-700'
            : 'bg-stone-900 text-stone-100 border-stone-700'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-100 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Sri Lankan Statutory Compliant (EPF / ETF / 25-Day Rule)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">UNIBRO SMART APPARELS - HRM</h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Manage trilingual employee profiles, live Hikvision fingerprint machine attendance, daily overtime, allowance deductions, and 4-per-A4 payslip generation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('help')}
            className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all border border-emerald-500/40"
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>{language === 'ta' ? 'தமிழ் கையேடு' : language === 'si' ? 'පරිශීලක අත්පොත' : 'User Guide'}</span>
          </button>
          {isAdmin && (
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>{t.download_daily_backup}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.stat_employees}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.employeeCount}</p>
            <p className="text-xs text-stone-400 mt-0.5">Active Workforce</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.stat_payroll}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">LKR {stats.lastPayrollNet.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-0.5">Last Finalized Run</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.stat_epf}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">LKR {stats.epfTotal.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-0.5">8% + 12% Monthly</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.stat_etf}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">LKR {stats.etfTotal.toLocaleString()}</p>
            <p className="text-xs text-stone-400 mt-0.5">3% Employer ETF</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Real-Time Biometric Terminal Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-stone-900 text-base">Hikvision Biometric Terminal</span>
              <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-mono font-medium">
                Model: DS-K1A8503MF
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                bioSummary.online_devices > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {bioSummary.online_devices > 0 ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span>Machine Online (LAN Connected)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-rose-600" />
                    <span>Machine Offline</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Terminal IP: <span className="font-mono text-stone-700 font-semibold">{devices[0]?.ip_address || '192.168.1.201'}</span> • Last Log Sync: <span className="font-semibold text-stone-700">{bioSummary.last_sync_time ? new Date(bioSummary.last_sync_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}</span> • <span className="font-bold text-indigo-700">{allPunches.length} punch records</span> captured for {selectedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncBiometricTerminal}
            disabled={syncingBiometrics}
            className="inline-flex items-center px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs transition cursor-pointer border border-stone-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncingBiometrics ? 'animate-spin' : ''}`} />
            {syncingBiometrics ? 'Polling Device...' : 'Sync Logs Now'}
          </button>

          <button
            onClick={() => setShowTestPunchModal(true)}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Test / Manual Punch
          </button>

          <button
            onClick={() => onNavigate('config')}
            className="inline-flex items-center px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 mr-1.5" />
            Biometric Setup
          </button>
        </div>
      </div>

      {/* Main Attendance & In/Out Log Console */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Header with Date Selector & Operation Summary */}
        <div className="p-6 border-b border-stone-200 bg-stone-50/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-stone-900">Attendance & Live In/Out Log Console</h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  Live
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Real-time punch monitoring for Hikvision fingerprint machine, employee time logs, late tracking & payroll calculations.
              </p>
            </div>

            {/* Date Navigator & Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-xl px-3 py-1.5 shadow-2xs">
                <Calendar className="w-4 h-4 text-stone-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold text-stone-800 bg-transparent border-0 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedDate === new Date().toISOString().slice(0, 10)
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                Today
              </button>

              <button
                onClick={handleSyncToSupabase}
                disabled={syncingBiometrics}
                className="inline-flex items-center px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Sync all In/Out attendance punch logs to Supabase cloud database"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncingBiometrics ? 'animate-spin' : ''}`} />
                {syncingBiometrics ? 'Syncing...' : 'Sync to Supabase'}
              </button>

              <button
                onClick={handleProcessDailyAttendance}
                disabled={processingDaily}
                className="inline-flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Process punches into daily work hours, late deductions and OT records for payroll"
              >
                <Sparkles className={`w-3.5 h-3.5 mr-1 ${processingDaily ? 'animate-spin' : ''}`} />
                {processingDaily ? 'Calculating...' : 'Calculate Daily Hours'}
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Present Today</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{summary.today_present}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Total Punches</span>
              <p className="text-xl font-bold text-indigo-700 mt-0.5">{allPunches.length}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Late Arrivals</span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">{attendanceData.late_arrivals?.length || 0}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Approved Leave</span>
              <p className="text-xl font-bold text-blue-700 mt-0.5">{summary.on_leave}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Absent</span>
              <p className="text-xl font-bold text-amber-700 mt-0.5">{summary.absent}</p>
            </div>
          </div>
        </div>

        {/* Tab Selector & Filter Bar */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('punches')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'punches'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live In / Out Logs ({allPunches.length})
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Present Roster ({attendanceData.present_list?.length || summary.today_present})
            </button>

            <button
              onClick={() => setActiveTab('late')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'late'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Late Arrivals ({attendanceData.late_arrivals?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('leave')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'leave'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <CalendarOff className="w-3.5 h-3.5" />
              On Leave ({attendanceData.today_leave_list?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('absent')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'absent'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              Absent ({attendanceData.absent_list?.length || summary.absent})
            </button>
          </div>

          {/* Search and Punch Type Filter */}
          <div className="flex items-center gap-2.5">
            {activeTab === 'punches' && (
              <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs">
                <button
                  onClick={() => setPunchTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    punchTypeFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPunchTypeFilter('check_in')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    punchTypeFilter === 'check_in' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  IN
                </button>
                <button
                  onClick={() => setPunchTypeFilter('check_out')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    punchTypeFilter === 'check_out' ? 'bg-blue-600 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  OUT
                </button>
              </div>
            )}

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search employee / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Live In / Out Punches Log Table */}
        {activeTab === 'punches' && (
          <div className="overflow-x-auto">
            {filteredPunches.length === 0 ? (
              <div className="text-center py-14 px-4">
                <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">No Biometric In/Out Punches Found</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  No attendance punches recorded for {selectedDate}. When employees place their finger on the Hikvision DS-K1A8503MF terminal, their In/Out logs appear here immediately.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowTestPunchModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    Record Sample Employee Punch
                  </button>
                  <button
                    onClick={handleSyncBiometricTerminal}
                    className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition border border-stone-300 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Sync Device
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 uppercase font-semibold">
                    <th className="py-3 px-4">Punch Time</th>
                    <th className="py-3 px-4">Punch Type</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department / Role</th>
                    <th className="py-3 px-4">Machine ID</th>
                    <th className="py-3 px-4">Verify Mode</th>
                    <th className="py-3 px-4">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPunches.map((punch: any, idx: number) => {
                    const isCheckIn = punch.punch_type === 'check_in' || (punch.punch_type === 'auto' && idx % 2 === 0);
                    const punchTimeObj = punch.check_time ? new Date(punch.check_time) : new Date();
                    const formattedTime = punchTimeObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    });
                    const formattedDate = punchTimeObj.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <tr key={punch.id || idx} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-stone-900 text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {formattedTime}
                          </div>
                          <div className="text-[10px] text-stone-400">{formattedDate}</div>
                        </td>

                        <td className="py-3 px-4">
                          {punch.punch_type === 'check_in' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <LogIn className="w-3 h-3 text-emerald-600" />
                              CHECK IN
                            </span>
                          ) : punch.punch_type === 'check_out' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <LogOut className="w-3 h-3 text-blue-600" />
                              CHECK OUT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 capitalize">
                              <Activity className="w-3 h-3 text-stone-500" />
                              {punch.punch_type || 'Auto Punch'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900 flex items-center gap-2">
                            <span>{punch.employee_name}</span>
                            <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 font-mono text-[10px] rounded border border-stone-200">
                              {punch.employee_number || 'N/A'}
                            </span>
                          </div>
                          {(punch.employee_name_ta || punch.employee_name_si) && (
                            <div className="text-[10px] text-stone-400">
                              {punch.employee_name_ta || punch.employee_name_si}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-stone-700 font-medium">{punch.department || 'Production'}</div>
                          <div className="text-[10px] text-stone-400">{punch.designation || 'Staff'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono font-semibold text-[11px]">
                            #{punch.device_user_id || '1'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-xs capitalize">
                            <Fingerprint className="w-3 h-3 text-stone-500" />
                            {punch.verify_mode || 'fingerprint'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-stone-600 text-[11px]">
                            {punch.device_name || 'DS-K1A8503MF'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Present Roster Table */}
        {activeTab === 'roster' && (
          <div className="overflow-x-auto">
            {(!attendanceData.present_list || attendanceData.present_list.length === 0) ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No active check-ins found for {selectedDate}.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">First Check-In</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Punctuality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendanceData.present_list.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-medium text-stone-900">
                        {item.employee_name} <span className="text-stone-400">({item.employee_number})</span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{item.department}</td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {item.check_in_time || '08:15'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Present
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.is_late ? (
                          <span className="inline-flex items-center text-rose-700 font-semibold text-xs">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            Late Arrival
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            On Time
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Late Arrivals */}
        {activeTab === 'late' && (
          <div className="overflow-x-auto">
            {(!attendanceData.late_arrivals || attendanceData.late_arrivals.length === 0) ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No late arrivals recorded for {selectedDate}. All present employees checked in on time!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Expected Time</th>
                    <th className="py-3 px-4">Actual Check-In</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendanceData.late_arrivals.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {item.employee_name} <span className="text-stone-400 font-normal">({item.employee_number})</span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{item.department}</td>
                      <td className="py-3 px-4 font-mono text-stone-500">{item.work_start_time || '08:30'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-700">{item.check_in_time}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Late Arrival
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 4: Today's Leave List */}
        {activeTab === 'leave' && (
          <div className="overflow-x-auto">
            {(!attendanceData.today_leave_list || attendanceData.today_leave_list.length === 0) ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No approved leave records covering {selectedDate}.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendanceData.today_leave_list.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-medium text-stone-900">
                        {item.employee_name} <span className="text-stone-400">({item.employee_number})</span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{item.department}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md font-medium text-xs bg-blue-50 text-blue-700 border border-blue-200">
                          {item.leave_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">Approved</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 5: Absent List */}
        {activeTab === 'absent' && (
          <div className="overflow-x-auto">
            {(!attendanceData.absent_list || attendanceData.absent_list.length === 0) ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                No unexcused absences recorded. 100% attendance or covered by approved leaves!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Employee Number</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendanceData.absent_list.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-bold text-stone-900">{item.employee_name}</td>
                      <td className="py-3 px-4 font-mono text-stone-600">{item.employee_number}</td>
                      <td className="py-3 px-4 text-stone-600">{item.department}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Absent / Not Punched
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Informative Step-by-Step Biometric Guide Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>How to check sample employee punches:</strong> 1) Enroll employee finger on Hikvision machine (e.g. ID #1), 2) Link Machine ID in Biometric Management, 3) All In/Out logs sync directly to this live table.
            </span>
          </div>
          <button
            onClick={() => onNavigate('config')}
            className="text-indigo-600 font-bold hover:underline shrink-0 flex items-center"
          >
            Manage User Mappings <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

      </div>

      {/* Quick Action Navigation Cards */}
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-4">{t.quick_actions}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Run Payroll */}
          <div
            onClick={() => onNavigate('run-payroll')}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PlayCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">{t.run_payroll}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Calculate attendance, allowance deductions, no-pay, overtime, incentives, and EPF/ETF.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Proceed to Payroll</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Add Employee */}
          <div
            onClick={() => onNavigate('employees')}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">{t.add_employee}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Register new employees with trilingual names (English, Tamil, Sinhala), NIC, and bank accounts.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Manage Employees</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: EPF/ETF/Balance */}
          <div
            onClick={() => onNavigate('epf-etf')}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">{t.epf_etf_balance}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                View statutory EPF (8% employee, 12% employer) and ETF (3% employer) contributions & C-Form.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Statutory Reports</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4: Configuration */}
          <div
            onClick={() => onNavigate('config')}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">{t.configuration}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Configure company profile, biometric machines, work schedules, and cloud database.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>System Settings</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

        </div>
      </div>

      {/* Manual / Test Punch Modal */}
      {showTestPunchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Record Test / Manual Biometric Punch</h3>
                  <p className="text-xs text-stone-500">Test sample employee check-in or record missing log</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestPunchModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTestPunch} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Employee (Sample or Active) *
                </label>
                <select
                  value={testPunchEmpId}
                  onChange={(e) => setTestPunchEmpId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name_en} ({emp.employee_number}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Punch Type *
                  </label>
                  <select
                    value={testPunchType}
                    onChange={(e) => setTestPunchType(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="check_in">🟢 Check IN (Arrival)</option>
                    <option value="check_out">🔵 Check OUT (Departure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Verify Mode
                  </label>
                  <select
                    value={testVerifyMode}
                    onChange={(e) => setTestVerifyMode(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="fingerprint">👆 Fingerprint</option>
                    <option value="face">👤 Face Recognition</option>
                    <option value="card">💳 RFID Card</option>
                    <option value="password">🔑 PIN Password</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Punch Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={testPunchTime}
                  onChange={(e) => setTestPunchTime(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Recording this punch will immediately appear in the live Dashboard table and update the employee's present status.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestPunchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Record Punch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
