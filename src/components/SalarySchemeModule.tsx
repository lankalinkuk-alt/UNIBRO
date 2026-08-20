import React, { useState, useEffect } from 'react';
import { SalaryScheme, Language } from '../types';
import { translations } from '../translations';
import { Calculator, Plus, Edit2, Shield, DollarSign, Clock } from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface SalarySchemeModuleProps {
  language: Language;
}

export const SalarySchemeModule: React.FC<SalarySchemeModuleProps> = ({ language }) => {
  const t = translations[language];
  const [schemes, setSchemes] = useState<SalaryScheme[]>([]);
  const [editingScheme, setEditingScheme] = useState<SalaryScheme | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/salary-schemes');
      const data = await res.json();
      setSchemes(data);
      if (data.length > 0 && !editingScheme) {
        setEditingScheme(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;
    try {
      const res = await fetch(`/api/salary-schemes/${editingScheme.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingScheme)
      });
      if (res.ok) {
        alert(t.success_saved);
        fetchSchemes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getExportData = () => {
    const headers = [
      'Scheme Name',
      'Basic Salary (25 Days)',
      'Fixed Allowance (25 Days)',
      'Total Base Pay (LKR)',
      'Basic OT Rate (LKR/Hr)',
      'Double OT Rate (LKR/Hr)',
      'EPF Employee (8%)',
      'EPF Employer (12%)',
      'ETF Employer (3%)'
    ];

    const data = schemes.map(sch => {
      const totalBase = (sch.basic_salary || 0) + (sch.fixed_allowance_25_days || 0);
      const epfEmp = (sch.basic_salary || 0) * 0.08;
      const epfEmpr = (sch.basic_salary || 0) * 0.12;
      const etfEmpr = (sch.basic_salary || 0) * 0.03;
      return [
        sch.name,
        sch.basic_salary || 0,
        sch.fixed_allowance_25_days || 0,
        totalBase,
        sch.ot_rate_normal || 0,
        sch.ot_rate_double || 0,
        epfEmp,
        epfEmpr,
        etfEmpr
      ];
    });

    const totalBasic = schemes.reduce((sum, s) => sum + (s.basic_salary || 0), 0);
    const totalAllowance = schemes.reduce((sum, s) => sum + (s.fixed_allowance_25_days || 0), 0);
    const totalBase = totalBasic + totalAllowance;
    const totalEpfEmp = schemes.reduce((sum, s) => sum + (s.basic_salary || 0) * 0.08, 0);
    const totalEpfEmpr = schemes.reduce((sum, s) => sum + (s.basic_salary || 0) * 0.12, 0);
    const totalEtfEmpr = schemes.reduce((sum, s) => sum + (s.basic_salary || 0) * 0.03, 0);

    const summaryCards = [
      { label: 'Configured Schemes', value: `${schemes.length} Grades` },
      { label: 'Avg Basic Pay', value: `LKR ${schemes.length > 0 ? Math.round(totalBasic / schemes.length).toLocaleString() : '0'}` },
      { label: 'Statutory EPF/ETF', value: '8% / 12% / 3%' },
      { label: 'Baseline Basis', value: '25 Working Days' }
    ];

    const summaryRows = [
      [
        'TOTALS',
        totalBasic,
        totalAllowance,
        totalBase,
        '',
        '',
        totalEpfEmp,
        totalEpfEmpr,
        totalEtfEmpr
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportExcel = () => {
    const { headers, data, summaryRows } = getExportData();
    exportToExcel({
      filename: `Salary_Grade_Schemes_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Salary Schemes',
      title: 'Sri Lanka Apparel Master Salary Schemes & Statutory Matrix',
      subtitle: '25-day standard allowance baselines and statutory EPF/ETF contributions',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPdf = () => {
    const { summaryCards, summaryRows } = getExportData();
    const pdfHeaders = ['Scheme Name', 'Basic (25d)', 'Allowance (25d)', 'Base Total', 'OT Normal', 'OT Double', 'EPF 8%'];
    const pdfData = schemes.map(sch => [
      sch.name,
      `Rs. ${(sch.basic_salary || 0).toLocaleString()}`,
      `Rs. ${(sch.fixed_allowance_25_days || 0).toLocaleString()}`,
      `Rs. ${((sch.basic_salary || 0) + (sch.fixed_allowance_25_days || 0)).toLocaleString()}`,
      `Rs. ${sch.ot_rate_normal || 0}/hr`,
      `Rs. ${sch.ot_rate_double || 0}/hr`,
      `Rs. ${((sch.basic_salary || 0) * 0.08).toLocaleString()}`
    ]);

    const totalBasic = schemes.reduce((sum, s) => sum + (s.basic_salary || 0), 0);
    const totalAllowance = schemes.reduce((sum, s) => sum + (s.fixed_allowance_25_days || 0), 0);
    const totalBase = totalBasic + totalAllowance;
    const totalEpfEmp = schemes.reduce((sum, s) => sum + (s.basic_salary || 0) * 0.08, 0);

    const pdfSummaryRows = [
      [
        'TOTALS',
        `Rs. ${totalBasic.toLocaleString()}`,
        `Rs. ${totalAllowance.toLocaleString()}`,
        `Rs. ${totalBase.toLocaleString()}`,
        '',
        '',
        `Rs. ${totalEpfEmp.toLocaleString()}`
      ]
    ];

    exportToPdf({
      title: 'Master Salary Structure Matrix',
      subtitle: 'Official salary grade schedules, allowances, and statutory EPF rates',
      periodOrDate: new Date().toLocaleDateString(),
      headers: pdfHeaders,
      data: pdfData,
      summaryRows: pdfSummaryRows,
      filename: `Salary_Schemes_Structure_${new Date().toISOString().split('T')[0]}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrint = () => {
    const { summaryCards, summaryRows } = getExportData();
    const printHeaders = ['Scheme Name', 'Basic Salary (25d)', 'Fixed Allowance (25d)', 'Total Base', 'OT Rate (Normal)', 'OT Rate (Double)'];
    const printData = schemes.map(sch => [
      sch.name,
      `LKR ${(sch.basic_salary || 0).toLocaleString()}`,
      `LKR ${(sch.fixed_allowance_25_days || 0).toLocaleString()}`,
      `LKR ${((sch.basic_salary || 0) + (sch.fixed_allowance_25_days || 0)).toLocaleString()}`,
      `LKR ${sch.ot_rate_normal || 0} / hr`,
      `LKR ${sch.ot_rate_double || 0} / hr`
    ]);

    const totalBasic = schemes.reduce((sum, s) => sum + (s.basic_salary || 0), 0);
    const totalAllowance = schemes.reduce((sum, s) => sum + (s.fixed_allowance_25_days || 0), 0);
    const totalBase = totalBasic + totalAllowance;

    const printSummaryRows = [
      [
        'TOTALS',
        `LKR ${totalBasic.toLocaleString()}`,
        `LKR ${totalAllowance.toLocaleString()}`,
        `LKR ${totalBase.toLocaleString()}`,
        '',
        ''
      ]
    ];

    printReport({
      title: 'Salary Grade & Remuneration Structure',
      subtitle: 'Apparel Factory Remuneration & Allowance Schedule',
      periodOrDate: new Date().toLocaleDateString(),
      headers: printHeaders,
      data: printData,
      summaryCards,
      summaryRows: printSummaryRows,
      footerNote: 'Certified true schedule of UNIBRO SMART APPARELS Compensation Policy.'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{t.salary_schemes}</h2>
          <p className="text-sm text-stone-500">Configure Sri Lankan 25-working-day baselines, allowance deduction schedules, and OT rates.</p>
        </div>
        <ReportToolbar
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          disabled={schemes.length === 0}
          label="Export Schemes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scheme Selector List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Available Schemes</h3>
          <div className="space-y-3">
            {schemes.map(sch => (
              <div
                key={sch.id}
                onClick={() => setEditingScheme(sch)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  editingScheme?.id === sch.id
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="font-bold text-stone-900">{sch.name}</div>
                <div className="text-xs text-stone-500 mt-1">Basic: LKR {sch.basic_salary.toLocaleString()}</div>
                <div className="text-xs text-stone-500">Allowance: LKR {sch.fixed_allowance_25_days.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheme Editor Form */}
        {editingScheme && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center">
              <Calculator className="w-5 h-5 text-emerald-600 mr-2" />
              Editing: {editingScheme.name}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Scheme Name</label>
                  <input
                    type="text"
                    value={editingScheme.name}
                    onChange={e => setEditingScheme({ ...editingScheme, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Basic Salary (25 Days)</label>
                  <input
                    type="number"
                    value={editingScheme.basic_salary}
                    onChange={e => setEditingScheme({ ...editingScheme, basic_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Fixed Allowance for 25 Days Attendance</label>
                <input
                  type="number"
                  value={editingScheme.fixed_allowance_25_days}
                  onChange={e => setEditingScheme({ ...editingScheme, fixed_allowance_25_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">{t.no_pay_deduction_rate || "No Pay Leave Deduction Rate / Day (LKR)"}</label>
                <input
                  type="number"
                  value={editingScheme.no_pay_deduction_rate || 0}
                  onChange={e => setEditingScheme({ ...editingScheme, no_pay_deduction_rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  placeholder="Leave 0 for automatic (Basic Salary / 25)"
                />
                <p className="text-[11px] text-stone-500 mt-1">If set to 0, No Pay deduction per day automatically defaults to Basic Salary ÷ 25.</p>
              </div>

              {/* Sri Lankan Allowance Deduction Schedule */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                  Attendance Shortfall Allowance Deductions (Sri Lankan Rule)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Day 1 Short</label>
                    <input
                      type="number"
                      value={editingScheme.deduct_day_1}
                      onChange={e => setEditingScheme({ ...editingScheme, deduct_day_1: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Day 2 Short</label>
                    <input
                      type="number"
                      value={editingScheme.deduct_day_2}
                      onChange={e => setEditingScheme({ ...editingScheme, deduct_day_2: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Day 3 Short</label>
                    <input
                      type="number"
                      value={editingScheme.deduct_day_3}
                      onChange={e => setEditingScheme({ ...editingScheme, deduct_day_3: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Day 4 Short</label>
                    <input
                      type="number"
                      value={editingScheme.deduct_day_4}
                      onChange={e => setEditingScheme({ ...editingScheme, deduct_day_4: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Addl. Days</label>
                    <input
                      type="number"
                      value={editingScheme.deduct_additional_day}
                      onChange={e => setEditingScheme({ ...editingScheme, deduct_additional_day: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Overtime Rates */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">Overtime Hourly Rates (LKR)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Normal Day OT / hr</label>
                    <input
                      type="number"
                      value={editingScheme.ot_normal_rate_per_hour}
                      onChange={e => setEditingScheme({ ...editingScheme, ot_normal_rate_per_hour: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Weekly Off Day OT / hr</label>
                    <input
                      type="number"
                      value={editingScheme.ot_off_rate_per_hour}
                      onChange={e => setEditingScheme({ ...editingScheme, ot_off_rate_per_hour: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Poya / Holiday OT / hr</label>
                    <input
                      type="number"
                      value={editingScheme.ot_poya_rate_per_hour}
                      onChange={e => setEditingScheme({ ...editingScheme, ot_poya_rate_per_hour: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-xs cursor-pointer"
                >
                  {t.save} Scheme Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
