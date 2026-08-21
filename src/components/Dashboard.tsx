import React, { useState, useEffect } from 'react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';
import { PlayCircle, UserPlus, Calculator, Settings, ArrowRight, ShieldCheck, Users, FileText, UserCheck, CalendarOff, UserX, Clock, AlertCircle, RefreshCw, Download, Fingerprint, Wifi, WifiOff, Activity, BookOpen } from 'lucide-react';

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

  const [attendanceData, setAttendanceData] = useState<any>({
    summary: { today_present: 0, on_leave: 0, absent: 0, overtime_employees: 0, total_active: 0 },
    biometric_summary: {
      total_devices: 1,
      online_devices: 1,
      offline_devices: 0,
      last_sync_time: new Date().toISOString(),
      today_total_punches: 0
    },
    today_leave_list: [],
    late_arrivals: [],
    present_list: [],
    absent_list: [],
    overtime_list: [],
    recent_biometric_punches: []
  });
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/dashboard/realtime-attendance');
      const data = await res.json();
      setAttendanceData(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch real-time attendance", err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 60000); // 60 seconds auto-refresh
    return () => clearInterval(interval);
  }, []);

  const summary = attendanceData.summary || { today_present: 0, on_leave: 0, absent: 0, overtime_employees: 0, total_active: 0 };
  const bioSummary = attendanceData.biometric_summary || {
    total_devices: 1,
    online_devices: 1,
    offline_devices: 0,
    last_sync_time: null,
    today_total_punches: 0
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
    } catch (err) {
      console.error(err);
      alert(t.error_occurred);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-100 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Sri Lankan Statutory Compliant (EPF / ETF / 25-Day Rule)
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-3">UNIBRO SMART APPARELS - HRM</h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Manage multilingual employee records, Sri Lankan 25-working-day attendance shortfalls, allowance deductions, overtime, and generate 4-per-A4 professional payslips instantly.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('help')}
            className="px-4 py-3 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all border border-emerald-500/40"
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>{language === 'ta' ? 'தமிழ் காட்சி கையேடு' : language === 'si' ? 'පරිශීලක අත්පොත' : 'User Guide'}</span>
          </button>
          {isAdmin && (
            <button
              onClick={handleDownloadBackup}
              className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 mr-1 text-emerald-700" />
              <span>{t.download_daily_backup}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t.stat_employees}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.employeeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t.stat_payroll}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">LKR {stats.lastPayrollNet.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t.stat_epf}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">LKR {stats.epfTotal.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t.stat_etf}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">LKR {stats.etfTotal.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Real-Time Attendance Widgets Section */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center">
              <Clock className="w-5 h-5 text-emerald-600 mr-2" />
              Real-Time Attendance & Operations Dashboard
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Live attendance monitoring, leave tracking, and overtime synchronization (Auto-refreshes every 60s).
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-stone-500">
            <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
            <button
              onClick={fetchAttendance}
              disabled={loadingAttendance}
              className="inline-flex items-center px-3 py-1.5 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 text-stone-700 font-medium cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingAttendance ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Hikvision Biometric Device Status Banner */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm">Hikvision Terminal (DS-K1A8503MF)</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  bioSummary.online_devices > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {bioSummary.online_devices > 0 ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-600" />
                      {t.device_online || 'Online (LAN Connected)'}
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-600" />
                      {t.device_offline || 'Offline'}
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {(t as any).last_sync_time || 'Last Synced'}: {bioSummary.last_sync_time ? new Date(bioSummary.last_sync_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'} • {bioSummary.today_total_punches} punches captured today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('config')}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition"
            >
              <Fingerprint className="w-3.5 h-3.5 mr-1" />
              Manage Biometrics
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{(t as any).realtime_present_count || 'Today Present'}</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-1">{summary.today_present}</p>
              <p className="text-xs text-stone-400 mt-1">Out of {summary.total_active} active employees</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">On Leave</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-1">{summary.on_leave}</p>
              <p className="text-xs text-stone-400 mt-1">Approved leave today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarOff className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Absent</p>
              <p className="text-3xl font-extrabold text-rose-700 mt-1">{summary.absent}</p>
              <p className="text-xs text-stone-400 mt-1">Unexcused / Not checked in</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Overtime Employees</p>
              <p className="text-3xl font-extrabold text-amber-700 mt-1">{summary.overtime_employees}</p>
              <p className="text-xs text-stone-400 mt-1">Logged OT hours today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Detailed Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Leave List Section */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-stone-900 flex items-center">
                  <CalendarOff className="w-4 h-4 text-blue-600 mr-2" />
                  Today's Leave List ({attendanceData.today_leave_list?.length || 0})
                </h4>
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">Approved</span>
              </div>

              {attendanceData.today_leave_list?.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">No employees on leave today.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 uppercase">
                        <th className="pb-2 font-semibold">Employee</th>
                        <th className="pb-2 font-semibold">Department</th>
                        <th className="pb-2 font-semibold">Leave Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(attendanceData.today_leave_list || []).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="py-2.5 font-medium text-stone-900">
                            {item.employee_name} <span className="text-stone-400">({item.employee_number})</span>
                          </td>
                          <td className="py-2.5 text-stone-600">{item.department}</td>
                          <td className="py-2.5">
                            <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium text-xs">
                              {item.leave_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Late Arrivals Section */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-stone-900 flex items-center">
                  <AlertCircle className="w-4 h-4 text-rose-600 mr-2" />
                  Late Arrivals ({attendanceData.late_arrivals?.length || 0})
                </h4>
                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                  After {attendanceData.work_start_time || '08:30'}
                </span>
              </div>

              {(!attendanceData.late_arrivals || attendanceData.late_arrivals.length === 0) ? (
                <div className="text-center py-8 text-stone-400 text-xs">No late arrivals recorded today. All on time!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 uppercase">
                        <th className="pb-2 font-semibold">Employee</th>
                        <th className="pb-2 font-semibold">Department</th>
                        <th className="pb-2 font-semibold">Check-In Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(attendanceData.late_arrivals || []).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="py-2.5 font-medium text-stone-900">
                            {item.employee_name} <span className="text-stone-400">({item.employee_number})</span>
                          </td>
                          <td className="py-2.5 text-stone-600">{item.department}</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold text-xs">
                              {item.check_in_time}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Live Biometric Punches Section */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-stone-900 flex items-center">
                  <Activity className="w-4 h-4 text-indigo-600 mr-2" />
                  Live Biometric Feeds ({attendanceData.recent_biometric_punches?.length || 0})
                </h4>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Hikvision LAN
                </span>
              </div>

              {(!attendanceData.recent_biometric_punches || attendanceData.recent_biometric_punches.length === 0) ? (
                <div className="text-center py-8 text-stone-400 text-xs">No recent biometric punches received.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 uppercase">
                        <th className="pb-2 font-semibold">Time</th>
                        <th className="pb-2 font-semibold">Employee</th>
                        <th className="pb-2 font-semibold">Verify</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(attendanceData.recent_biometric_punches || []).slice(0, 5).map((punch: any, idx: number) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="py-2.5 font-mono font-medium text-stone-900">
                            {punch.check_time ? new Date(punch.check_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                          </td>
                          <td className="py-2.5 text-stone-800 font-medium">
                            {punch.employee_name}
                          </td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded capitalize text-xs">
                              {punch.verify_mode}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <h3 className="text-lg font-bold text-stone-900 mb-6">{t.quick_actions}</h3>

      {/* The 4 Required Minimal Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Run Payroll */}
        <div
          onClick={() => onNavigate('run-payroll')}
          className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">{t.run_payroll}</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Calculate attendance, allowances, no-pay, overtime, incentives, and EPF/ETF for monthly payroll.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Proceed to Payroll</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Card 2: Add Employee */}
        <div
          onClick={() => onNavigate('employees')}
          className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserPlus className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">{t.add_employee}</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Register new employees with trilingual names (English, Tamil, Sinhala), NIC, bank details, and salary schemes.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Manage Employees</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Card 3: EPF/ETF/Balance */}
        <div
          onClick={() => onNavigate('epf-etf')}
          className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">{t.epf_etf_balance}</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              View statutory EPF (8% employee, 12% employer) and ETF (3% employer) contributions and monthly reports.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>View Statutory Reports</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Card 4: Configuration */}
        <div
          onClick={() => onNavigate('config')}
          className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">{t.configuration}</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Configure company profile, working hours, statutory rates, and parameters.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>System Configuration</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

      </div>

    </div>
  );
};

