import React, { useState, useEffect } from 'react';
import { Employee, SalaryScheme, Language } from '../types';
import { translations } from '../translations';
import { 
  UserPlus, Search, Edit2, Trash2, X, Check, Building, CreditCard, 
  Users, AlertCircle, Cloud, CloudOff, RefreshCw, Database, 
  Code, Copy, CheckCircle2, AlertTriangle, ArrowDownToLine, ArrowUpToLine
} from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';
import { defaultSalarySchemes } from '../utils/clientDb';
import { 
  saveEmployeeToSupabase, 
  deleteEmployeeFromSupabase, 
  fetchEmployeesFromSupabase, 
  syncAllDataToSupabase, 
  getSupabaseConfig, 
  testSupabaseConnection,
  SUPABASE_MIGRATION_SQL
} from '../utils/supabaseClient';

interface EmployeeModuleProps {
  language: Language;
}

export const EmployeeModule: React.FC<EmployeeModuleProps> = ({ language }) => {
  const t = translations[language];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schemes, setSchemes] = useState<SalaryScheme[]>(defaultSalarySchemes as any);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [supabaseWarning, setSupabaseWarning] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean; connected?: boolean; message?: string }>({ configured: false });
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    employee_number: 'NL-001',
    full_name_en: '',
    full_name_ta: '',
    full_name_si: '',
    nic: '',
    department: 'Production',
    designation: 'Operator',
    join_date: new Date().toISOString().split('T')[0],
    employment_status: 'Active',
    epf_enabled: true,
    etf_enabled: true,
    ot_eligible: true,
    salary_scheme_id: defaultSalarySchemes[0].id,
    bank_name: 'Commercial Bank',
    bank_branch: 'Colombo 03',
    bank_account_number: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchSchemes();
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    const cfg = getSupabaseConfig();
    if (!cfg.configured) {
      setSupabaseStatus({ configured: false, message: 'Offline / Local storage mode' });
      return;
    }
    setSupabaseStatus({ configured: true, message: 'Checking Supabase...' });
    const res = await testSupabaseConnection();
    setSupabaseStatus({
      configured: true,
      connected: res.connected,
      message: res.message
    });
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/salary-schemes');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data);
        if (!formData.salary_scheme_id) {
          setFormData(prev => ({ ...prev, salary_scheme_id: data[0].id }));
        }
      } else {
        setSchemes(defaultSalarySchemes as any);
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
      setSchemes(defaultSalarySchemes as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSupabaseWarning(null);

    try {
      const activeSchemes = schemes.length > 0 ? schemes : defaultSalarySchemes;
      const finalSchemeId = formData.salary_scheme_id || activeSchemes[0]?.id || 'sch-1';
      const payload: Partial<Employee> = {
        ...formData,
        salary_scheme_id: finalSchemeId
      };

      // 1. Save to local/backend endpoint
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let savedEmp = payload as Employee;
      if (res.ok) {
        try {
          const resData = await res.json();
          if (resData && resData.id) {
            savedEmp = resData;
          }
        } catch {
          // ignore json parse error
        }
      }

      // 2. Explicitly persist to Supabase if configured
      const cfg = getSupabaseConfig();
      let supabaseMessage = '';

      if (cfg.configured) {
        const empToSync: Employee = {
          id: savedEmp.id || editingEmp?.id || `emp-${Date.now()}`,
          employee_number: payload.employee_number || `NL-${String(employees.length + 1).padStart(3, '0')}`,
          full_name_en: payload.full_name_en || '',
          full_name_ta: payload.full_name_ta || '',
          full_name_si: payload.full_name_si || '',
          nic: payload.nic || '',
          department: payload.department || 'Production',
          designation: payload.designation || 'Operator',
          join_date: payload.join_date || new Date().toISOString().split('T')[0],
          employment_status: payload.employment_status || 'Active',
          epf_enabled: payload.epf_enabled ?? true,
          etf_enabled: payload.etf_enabled ?? true,
          ot_eligible: payload.ot_eligible ?? true,
          salary_scheme_id: finalSchemeId,
          bank_name: payload.bank_name || 'Commercial Bank',
          bank_branch: payload.bank_branch || 'Colombo 03',
          bank_account_number: payload.bank_account_number || '',
          created_at: editingEmp?.created_at || new Date().toISOString()
        };

        const supResult = await saveEmployeeToSupabase(empToSync);
        if (supResult.success) {
          supabaseMessage = ' & synchronized with Supabase Cloud Database!';
          setSupabaseWarning(null);
        } else {
          setSupabaseWarning(
            `Saved locally, but Supabase Cloud sync returned: ${supResult.error || 'Check SQL schema & RLS policies.'}`
          );
        }
      }

      setSaveStatus(
        (editingEmp ? 'Employee updated successfully!' : 'Employee registered successfully!') + supabaseMessage
      );
      setTimeout(() => setSaveStatus(null), 5000);
      setIsModalOpen(false);
      setEditingEmp(null);
      await fetchEmployees();
      checkSupabaseStatus();
    } catch (err: any) {
      console.error("Error saving employee:", err);
      alert(`Error saving employee: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const cfg = getSupabaseConfig();
      if (cfg.configured) {
        await deleteEmployeeFromSupabase(id);
      }
      fetchEmployees();
      setSaveStatus('Employee removed successfully.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Delete employee error:", err);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllDataToSupabase();
      if (res.success) {
        setSaveStatus(`All ${res.employeesSynced} employees and ${res.schemesSynced} schemes synchronized to Supabase!`);
        setSupabaseWarning(null);
      } else {
        setSupabaseWarning(`Supabase sync notice: ${res.error || 'Check database permissions.'}`);
      }
      checkSupabaseStatus();
    } catch (err: any) {
      setSupabaseWarning(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchEmployeesFromSupabase();
      if (res.success && res.data && res.data.length > 0) {
        // Save to local backend / state
        for (const emp of res.data) {
          await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp)
          });
        }
        await fetchEmployees();
        setSaveStatus(`Loaded ${res.data.length} employees from Supabase Cloud!`);
      } else {
        setSaveStatus('No employees found in Supabase or Supabase is empty.');
      }
    } catch (err: any) {
      setSupabaseWarning(`Could not pull from Supabase: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const openAddModal = () => {
    setEditingEmp(null);
    const activeSchemes = schemes.length > 0 ? schemes : defaultSalarySchemes;
    const defaultSchemeId = activeSchemes[0]?.id || 'sch-1';
    setFormData({
      employee_number: `NL-${String(employees.length + 1).padStart(3, '0')}`,
      full_name_en: '',
      full_name_ta: '',
      full_name_si: '',
      nic: '',
      department: 'Production',
      designation: 'Operator',
      join_date: new Date().toISOString().split('T')[0],
      employment_status: 'Active',
      epf_enabled: true,
      etf_enabled: true,
      ot_eligible: true,
      salary_scheme_id: defaultSchemeId,
      bank_name: 'Commercial Bank',
      bank_branch: 'Colombo 03',
      bank_account_number: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData(emp);
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter(e =>
    e.full_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExportData = () => {
    const headers = [
      'Emp #',
      'Full Name (EN)',
      'Full Name (Tamil)',
      'Full Name (Sinhala)',
      'NIC #',
      'Department',
      'Designation',
      'Join Date',
      'Status',
      'EPF 8%',
      'ETF 3%',
      'OT Eligible',
      'Salary Scheme',
      'Bank Name',
      'Account #'
    ];

    const data = filteredEmployees.map(emp => {
      const scheme = schemes.find(s => s.id === emp.salary_scheme_id);
      return [
        emp.employee_number,
        emp.full_name_en,
        emp.full_name_ta || '-',
        emp.full_name_si || '-',
        emp.nic,
        emp.department,
        emp.designation,
        emp.join_date,
        emp.employment_status,
        emp.epf_enabled ? 'Yes (8%)' : 'No',
        emp.etf_enabled ? 'Yes (3%)' : 'No',
        emp.ot_eligible ? 'Yes' : 'No',
        scheme ? (scheme.name || scheme.scheme_name || 'Standard') : 'Standard',
        emp.bank_name || '-',
        emp.bank_account_number || '-'
      ];
    });

    const activeCount = filteredEmployees.filter(e => e.employment_status === 'Active').length;
    const epfCount = filteredEmployees.filter(e => e.epf_enabled).length;
    const otCount = filteredEmployees.filter(e => e.ot_eligible).length;

    const summaryCards = [
      { label: 'Total Employees', value: `${filteredEmployees.length} Staff` },
      { label: 'Active Personnel', value: `${activeCount}` },
      { label: 'EPF/ETF Covered', value: `${epfCount} Members` },
      { label: 'OT Eligible', value: `${otCount} Operators` }
    ];

    const summaryRows = [
      [
        'TOTALS',
        `${filteredEmployees.length} Total Employees`,
        '',
        '',
        '',
        '',
        '',
        '',
        `${activeCount} Active`,
        `${epfCount} EPF`,
        `${filteredEmployees.filter(e => e.etf_enabled).length} ETF`,
        `${otCount} OT`,
        '',
        '',
        ''
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportExcel = () => {
    const { headers, data, summaryRows } = getExportData();
    exportToExcel({
      filename: `Employee_Master_Register_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Staff Directory',
      title: 'Sri Lanka Apparel Workforce Master Employee Directory',
      subtitle: 'Trilingual profiles, NIC statutory identifiers, and banking details',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPdf = () => {
    const { summaryCards, summaryRows } = getExportData();
    const pdfHeaders = ['Emp #', 'Employee Name', 'NIC', 'Department', 'Designation', 'Joined', 'Status', 'EPF', 'OT'];
    const pdfData = filteredEmployees.map(emp => [
      emp.employee_number,
      emp.full_name_en,
      emp.nic,
      emp.department,
      emp.designation,
      emp.join_date,
      emp.employment_status,
      emp.epf_enabled ? 'Yes' : 'No',
      emp.ot_eligible ? 'Yes' : 'No'
    ]);

    const pdfSummaryRows = [
      [
        'TOTALS',
        `${filteredEmployees.length} Employees`,
        '',
        '',
        '',
        '',
        `${filteredEmployees.filter(e => e.employment_status === 'Active').length} Active`,
        `${filteredEmployees.filter(e => e.epf_enabled).length} EPF`,
        `${filteredEmployees.filter(e => e.ot_eligible).length} OT`
      ]
    ];

    exportToPdf({
      title: 'Master Employee Registry',
      subtitle: 'Official workforce roster with statutory registration status',
      periodOrDate: new Date().toLocaleDateString(),
      headers: pdfHeaders,
      data: pdfData,
      summaryRows: pdfSummaryRows,
      filename: `Master_Employee_Registry_${new Date().toISOString().split('T')[0]}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrint = () => {
    const { summaryCards } = getExportData();
    const printHeaders = ['Emp #', 'Full Name (EN)', 'NIC #', 'Department', 'Designation', 'Join Date', 'Status', 'Bank & Account'];
    const printData = filteredEmployees.map(emp => [
      emp.employee_number,
      emp.full_name_en,
      emp.nic,
      emp.department,
      emp.designation,
      emp.join_date,
      emp.employment_status,
      `${emp.bank_name || ''} - ${emp.bank_account_number || ''}`
    ]);

    const printSummaryRows = [
      [
        'TOTALS',
        `${filteredEmployees.length} Employees`,
        '',
        '',
        '',
        '',
        `${filteredEmployees.filter(e => e.employment_status === 'Active').length} Active`,
        ''
      ]
    ];

    printReport({
      title: 'Workforce Master Registry',
      subtitle: 'Official employee record and bank disbursement authorization sheet',
      periodOrDate: new Date().toLocaleDateString(),
      headers: printHeaders,
      data: printData,
      summaryCards,
      summaryRows: printSummaryRows,
      footerNote: 'Certified true copy of UNIBRO SMART APPARELS Personnel Register.'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{t.employees}</h2>
          <p className="text-sm text-stone-500">Manage personnel records, trilingual naming, banking, and salary assignments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Supabase Status & Sync Toolbar */}
          <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium text-stone-700">
              {supabaseStatus.configured ? (
                supabaseStatus.connected ? (
                  <span className="flex items-center text-emerald-700">
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                    Supabase Cloud Active
                  </span>
                ) : (
                  <span className="flex items-center text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    Supabase Configured
                  </span>
                )
              ) : (
                <span className="flex items-center text-stone-500">
                  <CloudOff className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
                  Local Storage
                </span>
              )}
            </div>

            {supabaseStatus.configured && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  title="Push all local employees and schemes to Supabase"
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-stone-200 rounded-lg font-semibold flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                >
                  <ArrowUpToLine className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>Sync to Cloud</span>
                </button>
                <button
                  type="button"
                  onClick={handlePullFromSupabase}
                  disabled={isSyncing}
                  title="Pull cloud employees into local database"
                  className="px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-lg font-semibold flex items-center space-x-1 transition shadow-2xs cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-stone-500" />
                  <span>Pull</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowSqlHelp(true)}
              title="View Supabase PostgreSQL Schema & RLS Fix"
              className="p-1 text-stone-500 hover:text-emerald-700 hover:bg-stone-200 rounded-lg transition"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            disabled={filteredEmployees.length === 0}
            label="Directory Reports"
          />
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t.add_employee}
          </button>
        </div>
      </div>

      {/* Supabase Diagnostic / Warning Toast */}
      {supabaseWarning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between shadow-xs">
          <div className="flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Supabase Cloud Sync Notice</p>
              <p className="mt-0.5 text-amber-800">{supabaseWarning}</p>
              <div className="mt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSqlHelp(true)}
                  className="font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
                >
                  Click to View & Copy Supabase SQL Schema / RLS Fix
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={handleSyncAll}
                  className="font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
                >
                  Retry Sync Now
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setSupabaseWarning(null)} className="text-amber-700 hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Status Toast */}
      {saveStatus && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2 font-medium">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center space-x-3">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, employee number, NIC, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-stone-900 focus:outline-hidden"
          />
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Staff</span>
          </div>
          <span className="text-xl font-bold text-emerald-900">{filteredEmployees.length}</span>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-stone-900">Personnel Records</h3>
            <span className="text-xs text-stone-500">({filteredEmployees.length} of {employees.length} total)</span>
          </div>
          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            size="sm"
            disabled={filteredEmployees.length === 0}
            label="Export Table"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Emp #</th>
                <th className="p-4">Full Name (EN / TA / SI)</th>
                <th className="p-4">{t.nic}</th>
                <th className="p-4">{t.department}</th>
                <th className="p-4">{t.designation}</th>
                <th className="p-4">{t.status}</th>
                <th className="p-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-semibold text-emerald-600">{emp.employee_number}</td>
                  <td className="p-4">
                    <div className="font-medium text-stone-900">{emp.full_name_en}</div>
                    <div className="text-xs text-stone-500">{emp.full_name_ta} | {emp.full_name_si}</div>
                  </td>
                  <td className="p-4 text-stone-600 font-mono text-xs">{emp.nic}</td>
                  <td className="p-4 text-stone-600">{emp.department}</td>
                  <td className="p-4 text-stone-600">{emp.designation}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      emp.employment_status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {emp.employment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(emp)} className="p-1.5 text-stone-500 hover:text-emerald-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer" title="Edit Employee">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-stone-500 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer" title="Delete Employee">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">No employees found.</td>
                </tr>
              )}
            </tbody>
            {filteredEmployees.length > 0 && (
              <tfoot>
                <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300 text-sm">
                  <td className="p-4" colSpan={3}>
                    TOTAL EMPLOYEES: {filteredEmployees.length} ({filteredEmployees.filter(e => e.employment_status === 'Active').length} Active)
                  </td>
                  <td className="p-4 text-xs text-stone-600 font-medium">
                    {Array.from(new Set(filteredEmployees.map(e => e.department))).length} Departments
                  </td>
                  <td className="p-4 text-xs text-stone-600 font-medium">
                    {filteredEmployees.filter(e => e.epf_enabled).length} EPF Covered
                  </td>
                  <td className="p-4 text-emerald-800">
                    {filteredEmployees.filter(e => e.ot_eligible).length} OT Eligible
                  </td>
                  <td className="p-4 text-right text-xs text-stone-500 font-normal">
                    Directory Total
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
              <h3 className="text-xl font-bold text-stone-900">
                {editingEmp ? 'Edit Employee' : 'Register New Employee'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Employee Number</label>
                  <input
                    type="text"
                    required
                    value={formData.employee_number || ''}
                    onChange={e => setFormData({ ...formData, employee_number: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">National ID (NIC)</label>
                  <input
                    type="text"
                    required
                    value={formData.nic || ''}
                    onChange={e => setFormData({ ...formData, nic: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Full Name (English)</label>
                <input
                  type="text"
                  required
                  value={formData.full_name_en || ''}
                  onChange={e => setFormData({ ...formData, full_name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Full Name (Tamil - தமிழ்)</label>
                  <input
                    type="text"
                    value={formData.full_name_ta || ''}
                    onChange={e => setFormData({ ...formData, full_name_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Full Name (Sinhala - සිංහල)</label>
                  <input
                    type="text"
                    value={formData.full_name_si || ''}
                    onChange={e => setFormData({ ...formData, full_name_si: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department || ''}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation || ''}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Join Date</label>
                  <input
                    type="date"
                    required
                    value={formData.join_date || ''}
                    onChange={e => setFormData({ ...formData, join_date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Salary Scheme</label>
                  <select
                    value={formData.salary_scheme_id || (schemes[0]?.id || defaultSalarySchemes[0].id)}
                    onChange={e => setFormData({ ...formData, salary_scheme_id: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {(schemes.length > 0 ? schemes : (defaultSalarySchemes as any)).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name || s.scheme_name} (Basic: LKR {(s.basic_salary || 0).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Employment Status</label>
                  <select
                    value={formData.employment_status || 'Active'}
                    onChange={e => setFormData({ ...formData, employment_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mt-4">
                <h4 className="text-sm font-bold text-stone-800 mb-3">Bank Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name || ''}
                      onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Branch</label>
                    <input
                      type="text"
                      value={formData.bank_branch || ''}
                      onChange={e => setFormData({ ...formData, bank_branch: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.bank_account_number || ''}
                      onChange={e => setFormData({ ...formData, bank_account_number: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mt-4 flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.epf_enabled ?? true}
                    onChange={e => setFormData({ ...formData, epf_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">EPF Enabled (8%)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.etf_enabled ?? true}
                    onChange={e => setFormData({ ...formData, etf_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">ETF Enabled (3%)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ot_eligible ?? true}
                    onChange={e => setFormData({ ...formData, ot_eligible: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">OT Eligible</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-xs cursor-pointer flex items-center space-x-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase SQL DDL / Quick Fix Modal */}
      {showSqlHelp && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 text-stone-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Supabase PostgreSQL Quick Migration & Fix</h3>
              </div>
              <button
                onClick={() => setShowSqlHelp(false)}
                className="text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300">
              If Supabase returns <code className="text-emerald-400 font-mono">column ... does not exist</code> or <code className="text-emerald-400 font-mono">42501 (permission denied)</code>, copy and run this non-destructive SQL script in your Supabase SQL Editor:
            </p>

            <div className="relative">
              <pre className="bg-stone-950 p-4 rounded-xl font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-64 border border-stone-800 whitespace-pre">
{SUPABASE_MIGRATION_SQL}
              </pre>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3000);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-stone-700 transition cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSqlHelp(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
