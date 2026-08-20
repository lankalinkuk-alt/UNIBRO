import React, { useState, useEffect } from 'react';
import { Employee, SalaryScheme, Language } from '../types';
import { translations } from '../translations';
import { UserPlus, Search, Edit2, Trash2, X, Check, Building, CreditCard, Users } from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface EmployeeModuleProps {
  language: Language;
}

export const EmployeeModule: React.FC<EmployeeModuleProps> = ({ language }) => {
  const t = translations[language];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schemes, setSchemes] = useState<SalaryScheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    employee_number: 'NL-',
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
    salary_scheme_id: '',
    bank_name: 'Commercial Bank',
    bank_branch: 'Colombo 03',
    bank_account_number: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchSchemes();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/salary-schemes');
      const data = await res.json();
      setSchemes(data);
      if (data.length > 0 && !formData.salary_scheme_id) {
        setFormData(prev => ({ ...prev, salary_scheme_id: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingEmp(null);
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingEmp(null);
    setFormData({
      employee_number: `NL-00${employees.length + 1}`,
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
      salary_scheme_id: schemes[0]?.id || '',
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
        scheme ? scheme.scheme_name : 'Standard',
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
                    value={formData.salary_scheme_id || ''}
                    onChange={e => setFormData({ ...formData, salary_scheme_id: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Basic: LKR {s.basic_salary})</option>
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-xs cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
