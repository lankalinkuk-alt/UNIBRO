import React, { useState, useEffect } from 'react';
import { Language, SpecialOTRule } from '../types';
import { translations } from '../translations';
import { Plus, Edit, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface SpecialOTModuleProps {
  language: Language;
}

export const SpecialOTModule: React.FC<SpecialOTModuleProps> = ({ language }) => {
  const t = translations[language];
  const [rules, setRules] = useState<SpecialOTRule[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<SpecialOTRule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:59');
  const [otMultiplier, setOtMultiplier] = useState<number>(1.5);
  const [otType, setOtType] = useState<any>('all');
  const [department, setDepartment] = useState('All');
  const [employeeGroup, setEmployeeGroup] = useState('All');
  const [priority, setPriority] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/special-ot-rules');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setName('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setFromTime('00:00');
    setToTime('23:59');
    setOtMultiplier(1.75);
    setOtType('all');
    setDepartment('All');
    setEmployeeGroup('All');
    setPriority(1);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (rule: SpecialOTRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setStartDate(rule.start_date);
    setEndDate(rule.end_date);
    setFromTime(rule.from_time);
    setToTime(rule.to_time);
    setOtMultiplier(rule.ot_multiplier);
    setOtType(rule.ot_type);
    setDepartment(rule.department);
    setEmployeeGroup(rule.employee_group);
    setPriority(rule.priority);
    setIsActive(rule.is_active);
    setShowModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      start_date: startDate,
      end_date: endDate,
      from_time: fromTime,
      to_time: toTime,
      ot_multiplier: Number(otMultiplier),
      ot_type: otType,
      department,
      employee_group: employeeGroup,
      priority: Number(priority),
      is_active: isActive
    };

    try {
      if (editingRule) {
        await fetch(`/api/special-ot-rules/${editingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/special-ot-rules', {
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
    if (!confirm('Are you sure you want to delete this Special OT rule?')) return;
    try {
      await fetch(`/api/special-ot-rules/${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const getExportData = () => {
    const headers = [
      'Rule Name',
      'Multiplier (x)',
      'OT Scope',
      'Department',
      'Employee Group',
      'Start Date',
      'End Date',
      'Active Time Window',
      'Status',
      'Priority'
    ];

    const data = rules.map(r => [
      r.name,
      `${r.ot_multiplier}x`,
      r.ot_type.toUpperCase(),
      r.department,
      r.employee_group,
      r.start_date,
      r.end_date,
      `${r.from_time} - ${r.to_time}`,
      r.is_active ? 'Active' : 'Inactive',
      r.priority
    ]);

    const activeRules = rules.filter(r => r.is_active).length;
    const avgMultiplier = rules.length > 0 ? (rules.reduce((sum, r) => sum + r.ot_multiplier, 0) / rules.length).toFixed(2) : '1.50';
    const maxMultiplier = rules.length > 0 ? Math.max(...rules.map(r => r.ot_multiplier)) : 1.5;

    const summaryCards = [
      { label: 'Total Special OT Rules', value: `${rules.length} Policies` },
      { label: 'Active Peak Rules', value: `${activeRules}` },
      { label: 'Average Multiplier', value: `${avgMultiplier}x` },
      { label: 'Max Multiplier', value: `${maxMultiplier}x` }
    ];

    const summaryRows = [
      [
        'TOTALS',
        `${rules.length} Rules`,
        `Avg ${avgMultiplier}x`,
        '',
        '',
        '',
        '',
        '',
        `${activeRules} Active`,
        ''
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportExcel = () => {
    const { headers, data, summaryRows } = getExportData();
    exportToExcel({
      filename: `Special_OT_Rates_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Special OT Rules',
      title: 'Sri Lanka Apparel Special Overtime & Peak Period Rate Schedule',
      subtitle: 'Premium OT multipliers and peak campaign configurations',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPdf = () => {
    const { headers, data, summaryCards, summaryRows } = getExportData();
    exportToPdf({
      title: 'Special Overtime Rate Schedule',
      subtitle: 'Official authorization for enhanced plant overtime multipliers',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows,
      filename: `Special_OT_Schedule_${new Date().toISOString().split('T')[0]}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrint = () => {
    const { headers, data, summaryCards, summaryRows } = getExportData();
    printReport({
      title: 'Special Overtime & Surge Rate Register',
      subtitle: 'Apparel Factory Overtime Schedule Authorization',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryCards,
      summaryRows,
      footerNote: 'Approved by Operations Manager and Financial Controller.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Special Overtime Rule Engine
          </h2>
          <p className="text-sm text-stone-500 mt-1">Configure peak period overtime multipliers, night shift premiums, and holiday campaign OT rates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            disabled={rules.length === 0}
            label="Export OT Rules"
          />
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Special OT Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">
                  {rule.ot_multiplier}x Multiplier
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${rule.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {rule.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">{rule.name}</h3>
              <p className="text-xs text-slate-500 mb-4">Dept: <strong className="text-slate-700">{rule.department}</strong> | Group: <strong className="text-slate-700">{rule.employee_group}</strong></p>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                <div className="flex justify-between"><span>OT Type:</span> <strong className="text-slate-800 uppercase">{rule.ot_type}</strong></div>
                <div className="flex justify-between"><span>Time Window:</span> <strong className="text-slate-800">{rule.from_time} - {rule.to_time}</strong></div>
                <div className="flex justify-between"><span>Date Range:</span> <strong className="text-slate-800">{rule.start_date} to {rule.end_date}</strong></div>
              </div>
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
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingRule ? 'Edit Special OT Rule' : 'Add Special OT Rule'}</h3>
            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. December Peak Holiday OT"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OT Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={otMultiplier}
                    onChange={(e) => setOtMultiplier(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OT Category</label>
                  <select
                    value={otType}
                    onChange={(e) => setOtType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">All OT Hours</option>
                    <option value="normal">Normal OT Only</option>
                    <option value="off">Off Day OT Only</option>
                    <option value="poya">Poya Day OT Only</option>
                    <option value="night">Night Shift Premium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Time</label>
                  <input
                    type="time"
                    required
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Time</label>
                  <input
                    type="time"
                    required
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveOT"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="isActiveOT" className="text-xs font-semibold text-slate-700">Rule is Active</label>
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
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
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
