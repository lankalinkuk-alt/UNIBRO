import React, { useState, useEffect } from 'react';
import { Language, SeasonalIncentiveRule, SeasonalIncentiveSlab } from '../types';
import { translations } from '../translations';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Award, Layers } from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface SeasonalIncentiveModuleProps {
  language: Language;
}

export const SeasonalIncentiveModule: React.FC<SeasonalIncentiveModuleProps> = ({ language }) => {
  const t = translations[language];
  const [rules, setRules] = useState<SeasonalIncentiveRule[]>([]);
  const [collisionMode, setCollisionMode] = useState<string>('highest_only');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<SeasonalIncentiveRule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [incentiveType, setIncentiveType] = useState<any>('Production');
  const [department, setDepartment] = useState('All');
  const [employeeGroup, setEmployeeGroup] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fixedBonus, setFixedBonus] = useState<number>(0);
  const [attendanceReq, setAttendanceReq] = useState<number>(0);
  const [minWorkingDays, setMinWorkingDays] = useState<number>(0);
  const [minProduction, setMinProduction] = useState<number>(0);
  const [minSales, setMinSales] = useState<number>(0);
  const [priority, setPriority] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [slabs, setSlabs] = useState<SeasonalIncentiveSlab[]>([]);

  useEffect(() => {
    fetchRules();
    fetchSettings();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/seasonal-incentive-rules');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.seasonal_incentive_collision_mode) {
        setCollisionMode(data.seasonal_incentive_collision_mode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCollisionMode = async (mode: string) => {
    setCollisionMode(mode);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonal_incentive_collision_mode: mode })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setName('');
    setIncentiveType('Production');
    setDepartment('All');
    setEmployeeGroup('All');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setFixedBonus(1000);
    setAttendanceReq(20);
    setMinWorkingDays(20);
    setMinProduction(10000);
    setMinSales(0);
    setPriority(1);
    setIsActive(true);
    setSlabs([
      { id: 'slb-' + Date.now() + '-1', min_val: 10000, max_val: 11999, bonus_val: 2000, bonus_type: 'fixed' },
      { id: 'slb-' + Date.now() + '-2', min_val: 12000, max_val: 14999, bonus_val: 4000, bonus_type: 'fixed' },
      { id: 'slb-' + Date.now() + '-3', min_val: 15000, max_val: 999999, bonus_val: 6000, bonus_type: 'fixed' }
    ]);
    setShowModal(true);
  };

  const openEditModal = (rule: SeasonalIncentiveRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setIncentiveType(rule.incentive_type);
    setDepartment(rule.department);
    setEmployeeGroup(rule.employee_group);
    setStartDate(rule.start_date);
    setEndDate(rule.end_date);
    setFixedBonus(rule.fixed_bonus);
    setAttendanceReq(rule.attendance_requirement);
    setMinWorkingDays(rule.min_working_days);
    setMinProduction(rule.min_production);
    setMinSales(rule.min_sales);
    setPriority(rule.priority);
    setIsActive(rule.is_active);
    setSlabs(rule.slabs || []);
    setShowModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      incentive_type: incentiveType,
      department,
      employee_group: employeeGroup,
      start_date: startDate,
      end_date: endDate,
      fixed_bonus: Number(fixedBonus),
      attendance_requirement: Number(attendanceReq),
      min_working_days: Number(minWorkingDays),
      min_production: Number(minProduction),
      min_sales: Number(minSales),
      priority: Number(priority),
      is_active: isActive,
      slabs
    };

    try {
      if (editingRule) {
        await fetch(`/api/seasonal-incentive-rules/${editingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/seasonal-incentive-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seasonal incentive rule?')) return;
    try {
      await fetch(`/api/seasonal-incentive-rules/${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const addSlab = () => {
    setSlabs([...slabs, { id: 'slb-' + Date.now(), min_val: 0, max_val: 0, bonus_val: 0, bonus_type: 'fixed' }]);
  };

  const updateSlab = (index: number, field: string, val: any) => {
    const updated = [...slabs];
    updated[index] = { ...updated[index], [field]: val };
    setSlabs(updated);
  };

  const removeSlab = (index: number) => {
    setSlabs(slabs.filter((_, i) => i !== index));
  };

  const getExportData = () => {
    const headers = [
      'Rule Name',
      'Incentive Type',
      'Department',
      'Employee Group',
      'Start Date',
      'End Date',
      'Fixed Bonus (LKR)',
      'Min Attendance (Days)',
      'Min Production (Units)',
      'Min Sales (LKR)',
      'Slabs Count',
      'Status',
      'Priority'
    ];

    const data = rules.map(r => [
      r.name,
      r.incentive_type,
      r.department,
      r.employee_group,
      r.start_date,
      r.end_date,
      r.fixed_bonus,
      r.attendance_requirement || 0,
      r.min_production || 0,
      r.min_sales || 0,
      (r.slabs || []).length,
      r.is_active ? 'Active' : 'Inactive',
      r.priority
    ]);

    const activeRulesCount = rules.filter(r => r.is_active).length;
    const totalFixedBonus = rules.reduce((acc, r) => acc + (r.fixed_bonus || 0), 0);
    const totalSlabsCount = rules.reduce((acc, r) => acc + (r.slabs?.length || 0), 0);

    const summaryCards = [
      { label: 'Configured Schemes', value: `${rules.length} Policies` },
      { label: 'Active Seasonal Rules', value: `${activeRulesCount}` },
      { label: 'Total Base Incentive Pool', value: `LKR ${totalFixedBonus.toLocaleString()}` },
      { label: 'Collision Resolution', value: collisionMode.replace('_', ' ').toUpperCase() }
    ];

    const summaryRows = [
      [
        'TOTALS',
        `${rules.length} Policies (${activeRulesCount} Active)`,
        '',
        '',
        '',
        '',
        totalFixedBonus,
        '',
        '',
        '',
        totalSlabsCount,
        `${activeRulesCount} Active`,
        ''
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportExcel = () => {
    const { headers, data, summaryRows } = getExportData();
    exportToExcel({
      filename: `Seasonal_Incentives_Register_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Incentive Rules',
      title: 'Sri Lanka Apparel Seasonal Incentive & Bonus Rules Register',
      subtitle: 'Festive, Peak Production, and Attendance Incentive Configuration',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPdf = () => {
    const { summaryCards, summaryRows } = getExportData();
    const pdfHeaders = ['Rule Name', 'Type', 'Dept / Group', 'Period', 'Fixed Bonus', 'Min Req', 'Status'];
    const pdfData = rules.map(r => [
      r.name,
      r.incentive_type,
      `${r.department} / ${r.employee_group}`,
      `${r.start_date} ~ ${r.end_date}`,
      `Rs. ${r.fixed_bonus.toLocaleString()}`,
      r.min_production > 0 ? `${r.min_production} units` : r.min_sales > 0 ? `Rs. ${r.min_sales}` : `${r.attendance_requirement} days`,
      r.is_active ? 'Active' : 'Inactive'
    ]);

    const pdfSummaryRows = [
      [
        'TOTALS',
        `${rules.length} Policies`,
        '',
        '',
        `Rs. ${rules.reduce((acc, r) => acc + (r.fixed_bonus || 0), 0).toLocaleString()}`,
        '',
        `${rules.filter(r => r.is_active).length} Active`
      ]
    ];

    exportToPdf({
      title: 'Seasonal Incentive Rules Schedule',
      subtitle: 'Official policy breakdown for seasonal and production incentive disbursements',
      periodOrDate: new Date().toLocaleDateString(),
      headers: pdfHeaders,
      data: pdfData,
      summaryRows: pdfSummaryRows,
      filename: `Seasonal_Incentive_Rules_${new Date().toISOString().split('T')[0]}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrint = () => {
    const { summaryCards, summaryRows } = getExportData();
    const printHeaders = ['Rule Name', 'Type', 'Target Group', 'Valid Window', 'Base Incentive', 'Criteria', 'Status'];
    const printData = rules.map(r => [
      r.name,
      r.incentive_type,
      `${r.department} - ${r.employee_group}`,
      `${r.start_date} to ${r.end_date}`,
      `LKR ${r.fixed_bonus.toLocaleString()}`,
      r.min_production > 0 ? `Min ${r.min_production} Units` : `${r.attendance_requirement || 0} Att. Days`,
      r.is_active ? 'Active' : 'Inactive'
    ]);

    const printSummaryRows = [
      [
        'TOTALS',
        `${rules.length} Policies`,
        '',
        '',
        `LKR ${rules.reduce((acc, r) => acc + (r.fixed_bonus || 0), 0).toLocaleString()}`,
        '',
        `${rules.filter(r => r.is_active).length} Active`
      ]
    ];

    printReport({
      title: 'Seasonal & Peak Production Incentive Schemes',
      subtitle: 'Apparel Factory Incentive Authorization Table',
      periodOrDate: new Date().toLocaleDateString(),
      headers: printHeaders,
      data: printData,
      summaryCards,
      summaryRows: printSummaryRows,
      footerNote: 'Authorized by Management & Head of HR.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" />
            Seasonal Incentive & Special Target Engine
          </h2>
          <p className="text-sm text-stone-500 mt-1">Configure production, sales, attendance, and time-based seasonal incentive slabs and collision rules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
            <span className="text-xs font-medium text-stone-600">Collision Mode:</span>
            <select
              value={collisionMode}
              onChange={(e) => handleUpdateCollisionMode(e.target.value)}
              className="text-xs font-semibold text-stone-800 bg-transparent outline-hidden cursor-pointer"
            >
              <option value="highest_only">Highest Only (Max Rule)</option>
              <option value="add_all">Add All Matched Rules</option>
              <option value="add_highest_two">Sum Top 2 Highest Rules</option>
              <option value="custom_priority">Custom Priority Order</option>
            </select>
          </div>
          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            disabled={rules.length === 0}
            label="Export Rules"
          />
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Seasonal Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  rule.incentive_type === 'Production' ? 'bg-indigo-50 text-indigo-700' :
                  rule.incentive_type === 'Sales' ? 'bg-amber-50 text-amber-700' :
                  rule.incentive_type === 'Attendance' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                }`}>
                  {rule.incentive_type}
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${rule.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {rule.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">{rule.name}</h3>
              <p className="text-xs text-slate-500 mb-4">Dept: <strong className="text-slate-700">{rule.department}</strong> | Group: <strong className="text-slate-700">{rule.employee_group}</strong></p>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                <div className="flex justify-between"><span>Fixed Bonus:</span> <strong className="text-slate-800">Rs. {rule.fixed_bonus.toLocaleString()}</strong></div>
                {rule.min_production > 0 && <div className="flex justify-between"><span>Min Production:</span> <strong className="text-slate-800">{rule.min_production.toLocaleString()} units</strong></div>}
                {rule.min_sales > 0 && <div className="flex justify-between"><span>Min Sales:</span> <strong className="text-slate-800">Rs. {rule.min_sales.toLocaleString()}</strong></div>}
                {rule.attendance_requirement > 0 && <div className="flex justify-between"><span>Min Attendance:</span> <strong className="text-slate-800">{rule.attendance_requirement} days</strong></div>}
                <div className="flex justify-between"><span>Date Range:</span> <strong className="text-slate-800">{rule.start_date} to {rule.end_date}</strong></div>
              </div>

              {rule.slabs && rule.slabs.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Slabs ({rule.slabs.length}):
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {rule.slabs.map((slab, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                        <span>{slab.min_val.toLocaleString()} - {slab.max_val === 999999 ? 'Max+' : slab.max_val.toLocaleString()}</span>
                        <span className="font-bold text-emerald-700">+Rs. {slab.bonus_val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => openEditModal(rule)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingRule ? 'Edit Seasonal Incentive Rule' : 'Add Seasonal Incentive Rule'}</h3>
            <form onSubmit={handleSaveRule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. New Year Production Peak"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Incentive Type</label>
                  <select
                    value={incentiveType}
                    onChange={(e) => setIncentiveType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Production">Production Target</option>
                    <option value="Sales">Sales Target</option>
                    <option value="Attendance">Attendance Bonus</option>
                    <option value="Time-based">Time-based Seasonal</option>
                    <option value="Overtime campaign">Overtime Campaign</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="All">All Departments</option>
                    <option value="Production">Production</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Sales & Admin">Sales & Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Group</label>
                  <input
                    type="text"
                    value={employeeGroup}
                    onChange={(e) => setEmployeeGroup(e.target.value)}
                    placeholder="All or Designation"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority (1 = Highest)</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Bonus (LKR)</label>
                  <input
                    type="number"
                    value={fixedBonus}
                    onChange={(e) => setFixedBonus(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Attendance (Days)</label>
                  <input
                    type="number"
                    value={attendanceReq}
                    onChange={(e) => setAttendanceReq(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Production (Units)</label>
                  <input
                    type="number"
                    value={minProduction}
                    onChange={(e) => setMinProduction(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Sales (LKR)</label>
                  <input
                    type="number"
                    value={minSales}
                    onChange={(e) => setMinSales(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Dynamic Incentive Slabs / Tiers</h4>
                  <button
                    type="button"
                    onClick={addSlab}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    + Add Slab
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {slabs.map((slab, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Min Target</label>
                        <input
                          type="number"
                          value={slab.min_val}
                          onChange={(e) => updateSlab(idx, 'min_val', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Max Target</label>
                        <input
                          type="number"
                          value={slab.max_val}
                          onChange={(e) => updateSlab(idx, 'max_val', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Bonus (LKR)</label>
                        <input
                          type="number"
                          value={slab.bonus_val}
                          onChange={(e) => updateSlab(idx, 'bonus_val', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSlab(idx)}
                        className="mt-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">Rule is Active</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
