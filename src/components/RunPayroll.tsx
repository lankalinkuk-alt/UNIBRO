import React, { useState, useEffect } from 'react';
import { PayrollRun, PayrollItem, Language } from '../types';
import { translations } from '../translations';
import { PlayCircle, Lock, Unlock, FileText, Printer, CheckCircle, AlertCircle, Calculator, FileSpreadsheet } from 'lucide-react';
import { PayslipModal } from './PayslipModal';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface RunPayrollProps {
  language: Language;
}

export const RunPayroll: React.FC<RunPayrollProps> = ({ language }) => {
  const t = translations[language];
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslipItem, setSelectedPayslipItem] = useState<PayrollItem | null>(null);
  const [showBulkPayslips, setShowBulkPayslips] = useState(false);

  useEffect(() => {
    loadPayrollData(selectedMonth);
  }, [selectedMonth]);

  const loadPayrollData = async (month: string) => {
    try {
      const res = await fetch(`/api/payroll-runs/${month}`);
      const data = await res.json();
      setPayrollRun(data.run);
      setPayrollItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll-runs/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth })
      });
      const data = await res.json();
      if (res.ok) {
        setPayrollRun(data.run);
        setPayrollItems(data.items || []);
      } else {
        alert(data.error || t.error_occurred);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = async () => {
    if (!payrollRun) return;
    const action = payrollRun.status === 'Locked' ? 'unlock' : 'lock';
    try {
      const res = await fetch(`/api/payroll-runs/${selectedMonth}/${action}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setPayrollRun(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPayrollExportData = () => {
    const headers = [
      'Emp #',
      'Employee Name',
      'Department',
      'Designation',
      'Attended Days',
      'No-Pay Days',
      'Basic Earned (LKR)',
      'Fixed Allowance (LKR)',
      'Overtime Amount (LKR)',
      'Special OT Bonus (LKR)',
      'Incentives Total (LKR)',
      'Gross Earnings (LKR)',
      'Employee EPF 8% (LKR)',
      'No-Pay Deduction (LKR)',
      'Total Deductions (LKR)',
      'Net Salary Payable (LKR)',
      'Employer EPF 12% (LKR)',
      'Employer ETF 3% (LKR)',
      'Bank Account'
    ];

    const data = payrollItems.map(item => [
      item.employee_number,
      item.full_name_en,
      item.department,
      item.designation,
      item.days_attended,
      item.no_pay_leave_days,
      item.basic_earned,
      item.fixed_allowance_earned,
      item.ot_amount,
      item.special_ot_bonus || 0,
      item.incentive_amount + (item.production_incentive || 0) + (item.sales_incentive || 0) + (item.seasonal_incentive || 0),
      item.gross_earnings,
      item.employee_epf_8,
      item.no_pay_deduction,
      item.total_deductions,
      item.net_salary,
      item.employer_epf_12,
      item.employer_etf_3,
      item.bank_details || ''
    ]);

    const totalBasic = payrollItems.reduce((acc, i) => acc + i.basic_earned, 0);
    const totalAllowances = payrollItems.reduce((acc, i) => acc + i.fixed_allowance_earned, 0);
    const totalOT = payrollItems.reduce((acc, i) => acc + i.ot_amount, 0);
    const totalSpecialOT = payrollItems.reduce((acc, i) => acc + (i.special_ot_bonus || 0), 0);
    const totalIncentives = payrollItems.reduce((acc, i) => acc + i.incentive_amount + (i.production_incentive || 0) + (i.sales_incentive || 0) + (i.seasonal_incentive || 0), 0);
    const totalGross = payrollItems.reduce((acc, i) => acc + i.gross_earnings, 0);
    const totalEpf8 = payrollItems.reduce((acc, i) => acc + i.employee_epf_8, 0);
    const totalNoPay = payrollItems.reduce((acc, i) => acc + i.no_pay_deduction, 0);
    const totalDeductions = payrollItems.reduce((acc, i) => acc + i.total_deductions, 0);
    const totalNet = payrollItems.reduce((acc, i) => acc + i.net_salary, 0);
    const totalEpf12 = payrollItems.reduce((acc, i) => acc + i.employer_epf_12, 0);
    const totalEtf3 = payrollItems.reduce((acc, i) => acc + i.employer_etf_3, 0);

    const summaryCards = [
      { label: 'Total Basic', value: `LKR ${totalBasic.toLocaleString()}` },
      { label: 'Allowances & OT', value: `LKR ${(totalAllowances + totalOT + totalSpecialOT + totalIncentives).toLocaleString()}` },
      { label: 'EPF Employee (8%)', value: `LKR ${totalEpf8.toLocaleString()}` },
      { label: 'Net Payable', value: `LKR ${totalNet.toLocaleString()}` },
      { label: 'Employer EPF/ETF', value: `LKR ${(totalEpf12 + totalEtf3).toLocaleString()}` }
    ];

    const summaryRows = [
      [
        'TOTALS',
        `${payrollItems.length} Staff`,
        '',
        '',
        '',
        '',
        totalBasic,
        totalAllowances,
        totalOT,
        totalSpecialOT,
        totalIncentives,
        totalGross,
        totalEpf8,
        totalNoPay,
        totalDeductions,
        totalNet,
        totalEpf12,
        totalEtf3,
        ''
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportPayrollExcel = () => {
    const { headers, data, summaryRows } = getPayrollExportData();
    exportToExcel({
      filename: `Master_Payroll_Register_${selectedMonth}`,
      sheetName: 'Salary Register',
      title: 'Sri Lanka Monthly Master Payroll Register & Salary Sheet',
      subtitle: 'Complete breakdown of attendance, earnings, statutory deductions (EPF 8%/12%, ETF 3%), and net disbursements',
      periodOrDate: selectedMonth,
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPayrollPdf = () => {
    const { headers, data, summaryCards } = getPayrollExportData();
    // Simplified columns for high-density PDF readability
    const pdfHeaders = [
      'Emp #',
      'Name',
      'Dept',
      'Days',
      'Basic (LKR)',
      'Allow (LKR)',
      'OT/Bonus (LKR)',
      'Gross (LKR)',
      'EPF 8% (LKR)',
      'NoPay (LKR)',
      'Net Pay (LKR)'
    ];

    const pdfData = payrollItems.map(item => [
      item.employee_number,
      item.full_name_en,
      item.department,
      `${item.days_attended}/25`,
      item.basic_earned.toLocaleString(),
      item.fixed_allowance_earned.toLocaleString(),
      (item.ot_amount + (item.special_ot_bonus || 0) + item.incentive_amount).toLocaleString(),
      item.gross_earnings.toLocaleString(),
      item.employee_epf_8.toLocaleString(),
      item.no_pay_deduction.toLocaleString(),
      item.net_salary.toLocaleString()
    ]);

    const totalBasic = payrollItems.reduce((acc, i) => acc + i.basic_earned, 0);
    const totalAllowances = payrollItems.reduce((acc, i) => acc + i.fixed_allowance_earned, 0);
    const totalOT = payrollItems.reduce((acc, i) => acc + i.ot_amount, 0);
    const totalSpecialOT = payrollItems.reduce((acc, i) => acc + (i.special_ot_bonus || 0), 0);
    const totalIncentives = payrollItems.reduce((acc, i) => acc + i.incentive_amount, 0);
    const totalGross = payrollItems.reduce((acc, i) => acc + i.gross_earnings, 0);
    const totalEpf8 = payrollItems.reduce((acc, i) => acc + i.employee_epf_8, 0);
    const totalNoPay = payrollItems.reduce((acc, i) => acc + i.no_pay_deduction, 0);
    const totalNet = payrollItems.reduce((acc, i) => acc + i.net_salary, 0);

    const pdfSummaryRows = [
      [
        'TOTALS',
        `${payrollItems.length} Staff`,
        '',
        '',
        totalBasic.toLocaleString(),
        totalAllowances.toLocaleString(),
        (totalOT + totalSpecialOT + totalIncentives).toLocaleString(),
        totalGross.toLocaleString(),
        totalEpf8.toLocaleString(),
        totalNoPay.toLocaleString(),
        totalNet.toLocaleString()
      ]
    ];

    exportToPdf({
      title: `Master Payroll Sheet - ${selectedMonth}`,
      subtitle: 'Official monthly wage sheet and statutory contribution schedule',
      periodOrDate: selectedMonth,
      headers: pdfHeaders,
      data: pdfData,
      summaryRows: pdfSummaryRows,
      filename: `Master_Payroll_Sheet_${selectedMonth}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrintPayroll = () => {
    const { summaryCards } = getPayrollExportData();
    const printHeaders = [
      'Emp #',
      'Employee Name',
      'Department',
      'Attendance',
      'Basic Earned',
      'Allowances',
      'OT & Bonus',
      'Gross Pay',
      'EPF 8%',
      'Net Salary',
      'Bank Account'
    ];

    const printData = payrollItems.map(item => [
      item.employee_number,
      item.full_name_en,
      item.department,
      `${item.days_attended}/25`,
      `LKR ${item.basic_earned.toLocaleString()}`,
      `LKR ${item.fixed_allowance_earned.toLocaleString()}`,
      `LKR ${(item.ot_amount + (item.special_ot_bonus || 0) + item.incentive_amount).toLocaleString()}`,
      `LKR ${item.gross_earnings.toLocaleString()}`,
      `LKR ${item.employee_epf_8.toLocaleString()}`,
      `LKR ${item.net_salary.toLocaleString()}`,
      item.bank_details || '-'
    ]);

    const totalBasic = payrollItems.reduce((acc, i) => acc + i.basic_earned, 0);
    const totalAllowances = payrollItems.reduce((acc, i) => acc + i.fixed_allowance_earned, 0);
    const totalOT = payrollItems.reduce((acc, i) => acc + i.ot_amount, 0);
    const totalSpecialOT = payrollItems.reduce((acc, i) => acc + (i.special_ot_bonus || 0), 0);
    const totalIncentives = payrollItems.reduce((acc, i) => acc + i.incentive_amount, 0);
    const totalGross = payrollItems.reduce((acc, i) => acc + i.gross_earnings, 0);
    const totalEpf8 = payrollItems.reduce((acc, i) => acc + i.employee_epf_8, 0);
    const totalNet = payrollItems.reduce((acc, i) => acc + i.net_salary, 0);

    const summaryRows = [
      [
        'GRAND TOTAL',
        `${payrollItems.length} Employees`,
        '',
        '',
        `LKR ${totalBasic.toLocaleString()}`,
        `LKR ${totalAllowances.toLocaleString()}`,
        `LKR ${(totalOT + totalSpecialOT + totalIncentives).toLocaleString()}`,
        `LKR ${totalGross.toLocaleString()}`,
        `LKR ${totalEpf8.toLocaleString()}`,
        `LKR ${totalNet.toLocaleString()}`,
        ''
      ]
    ];

    printReport({
      title: 'Master Monthly Salary Register',
      subtitle: 'Official payroll disbursement and authorization document',
      periodOrDate: selectedMonth,
      headers: printHeaders,
      data: printData,
      summaryCards,
      summaryRows,
      footerNote: 'All statutory deductions comply with Sri Lanka Department of Labour regulations.'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{t.run_payroll}</h2>
          <p className="text-sm text-stone-500">Calculate 25-day basic earnings, attendance shortfalls, OT, EPF (8%/12%), and ETF (3%).</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-medium"
          />
          <button
            onClick={handleCalculate}
            disabled={loading || payrollRun?.status === 'Locked'}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm shadow-xs cursor-pointer transition-colors"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {loading ? 'Calculating...' : t.calculate}
          </button>

          <ReportToolbar
            onExportExcel={handleExportPayrollExcel}
            onExportPdf={handleExportPayrollPdf}
            onPrint={handlePrintPayroll}
            disabled={payrollItems.length === 0}
            label="Payroll Register"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      {payrollRun && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Basic</span>
            <p className="text-xl font-bold text-stone-900 mt-1">LKR {payrollRun.total_basic.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Allowances & OT</span>
            <p className="text-xl font-bold text-stone-900 mt-1">LKR {(payrollRun.total_allowances + payrollRun.total_ot + payrollRun.total_incentives).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">EPF Employee (8%)</span>
            <p className="text-xl font-bold text-amber-600 mt-1">LKR {payrollRun.total_epf_employee.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Employer EPF/ETF</span>
            <p className="text-xl font-bold text-purple-600 mt-1">LKR {(payrollRun.total_epf_employer + payrollRun.total_etf_employer).toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">{t.net_salary} Total</span>
            <p className="text-2xl font-bold text-emerald-900 mt-1">LKR {payrollRun.total_net.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Lock Status Bar & Quick Actions */}
      {payrollRun && (
        <div className="bg-white p-4 rounded-xl border border-stone-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            {payrollRun.status === 'Locked' ? (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Payroll Locked & Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                <Unlock className="w-3.5 h-3.5 mr-1.5" /> Draft Mode (Editable)
              </span>
            )}
            <span className="text-xs text-stone-500">Last updated: {new Date(payrollRun.updated_at || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBulkPayslips(true)}
              className="inline-flex items-center px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer transition"
            >
              <Printer className="w-4 h-4 mr-1.5 text-stone-600" />
              {t.print_payslip} (A4 Batch)
            </button>
            <button
              onClick={handleLockToggle}
              className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer shadow-xs transition ${
                payrollRun.status === 'Locked' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {payrollRun.status === 'Locked' ? t.unlock_payroll : t.lock_payroll}
            </button>
          </div>
        </div>
      )}

      {/* Payroll Items Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">Salary Sheet Details</h3>
            <span className="text-xs text-stone-500">({payrollItems.length} Records)</span>
          </div>
          <ReportToolbar
            onExportExcel={handleExportPayrollExcel}
            onExportPdf={handleExportPayrollPdf}
            onPrint={handlePrintPayroll}
            size="sm"
            disabled={payrollItems.length === 0}
            label="Export Table"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Emp #</th>
                <th className="p-4">Employee Name</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Basic Earned</th>
                <th className="p-4">Allowances</th>
                <th className="p-4">OT & Incentives</th>
                <th className="p-4">EPF (8%)</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {payrollItems.map(item => (
                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-semibold text-emerald-600">{item.employee_number}</td>
                  <td className="p-4">
                    <div className="font-medium text-stone-900">{item.full_name_en}</div>
                    <div className="text-xs text-stone-500">{item.department}</div>
                  </td>
                  <td className="p-4 text-stone-600">{item.days_attended}/25 (No-pay: {item.no_pay_leave_days})</td>
                  <td className="p-4 text-stone-900">LKR {item.basic_earned.toLocaleString()}</td>
                  <td className="p-4 text-stone-900">LKR {item.fixed_allowance_earned.toLocaleString()}</td>
                  <td className="p-4 text-stone-900">LKR {(item.ot_amount + (item.special_ot_bonus || 0) + item.incentive_amount).toLocaleString()}</td>
                  <td className="p-4 text-amber-600">LKR {item.employee_epf_8.toLocaleString()}</td>
                  <td className="p-4 font-bold text-emerald-700">LKR {item.net_salary.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedPayslipItem(item)}
                      className="p-1.5 text-stone-500 hover:text-emerald-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                      title="View & Download Individual Payslip"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {payrollItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400">
                    No payroll calculated for {selectedMonth}. Click 'Calculate Payroll' above.
                  </td>
                </tr>
              )}
            </tbody>
            {payrollItems.length > 0 && (
              <tfoot>
                <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300 text-sm">
                  <td className="p-4" colSpan={3}>
                    TOTALS ({payrollItems.length} Staff)
                  </td>
                  <td className="p-4">
                    LKR {payrollItems.reduce((sum, i) => sum + i.basic_earned, 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    LKR {payrollItems.reduce((sum, i) => sum + i.fixed_allowance_earned, 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    LKR {payrollItems.reduce((sum, i) => sum + (i.ot_amount + (i.special_ot_bonus || 0) + i.incentive_amount), 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-amber-700">
                    LKR {payrollItems.reduce((sum, i) => sum + i.employee_epf_8, 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-emerald-800 font-extrabold">
                    LKR {payrollItems.reduce((sum, i) => sum + i.net_salary, 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-xs text-stone-500 font-normal">
                    {payrollItems.length} Slips
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Single Payslip Modal */}
      {selectedPayslipItem && (
        <PayslipModal
          item={selectedPayslipItem}
          month={selectedMonth}
          onClose={() => setSelectedPayslipItem(null)}
        />
      )}

      {/* Bulk Payslips 4-on-A4 Print View */}
      {showBulkPayslips && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Batch Payslips (4 per A4 Page)</h3>
                <p className="text-xs text-stone-500">Ready for batch printing on standard A4 perforated paper.</p>
              </div>
              <div className="space-x-3 flex items-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium inline-flex items-center cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print A4 Batch
                </button>
                <button
                  onClick={() => setShowBulkPayslips(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-50 rounded-xl text-sm font-medium text-stone-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Payslip grid: 4 per page in print */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
              {payrollItems.map((item) => (
                <div key={item.id} className="border border-stone-300 p-4 rounded-xl bg-white text-xs print:border-stone-400 print:break-inside-avoid">
                  <div className="flex justify-between items-start border-b border-stone-200 pb-2 mb-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">UNIBRO SMART APPARELS (PVT) LTD</h4>
                      <p className="text-[10px] text-stone-500">Pay Slip for {selectedMonth}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-700">{item.employee_number}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
                    <div><b>Name:</b> {item.full_name_en}</div>
                    <div><b>NIC:</b> {item.nic}</div>
                    <div><b>Dept:</b> {item.department}</div>
                    <div><b>Bank:</b> {item.bank_details}</div>
                  </div>

                  <table className="w-full mb-3 border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-[10px] text-stone-600">
                        <th className="p-1 text-left">Earnings</th>
                        <th className="p-1 text-right">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr><td className="p-1">Basic Earned ({item.days_attended}/25 days)</td><td className="p-1 text-right">{item.basic_earned.toLocaleString()}</td></tr>
                      <tr><td className="p-1">Fixed Allowance</td><td className="p-1 text-right">{item.fixed_allowance_earned.toLocaleString()}</td></tr>
                      <tr><td className="p-1">Overtime & Incentives</td><td className="p-1 text-right">{(item.ot_amount + (item.special_ot_bonus || 0) + item.incentive_amount).toLocaleString()}</td></tr>
                      <tr className="font-semibold bg-stone-50"><td className="p-1">Gross Earnings</td><td className="p-1 text-right">{item.gross_earnings.toLocaleString()}</td></tr>
                    </tbody>
                  </table>

                  <table className="w-full mb-3 border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-[10px] text-stone-600">
                        <th className="p-1 text-left">Deductions & Statutory</th>
                        <th className="p-1 text-right">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr><td className="p-1">EPF Employee (8%)</td><td className="p-1 text-right">{item.employee_epf_8.toLocaleString()}</td></tr>
                      <tr><td className="p-1">No-Pay Leave Deduction</td><td className="p-1 text-right">{item.no_pay_deduction.toLocaleString()}</td></tr>
                      <tr className="font-semibold bg-stone-50"><td className="p-1">Total Deductions</td><td className="p-1 text-right">{item.total_deductions.toLocaleString()}</td></tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg font-bold text-emerald-900 text-sm mb-3">
                    <span>Net Salary Payable:</span>
                    <span>LKR {item.net_salary.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between pt-4 mt-2 border-t border-dashed border-stone-300 text-[10px] text-stone-500">
                    <div>Employer EPF (12%): LKR {item.employer_epf_12.toLocaleString()}</div>
                    <div>Employer ETF (3%): LKR {item.employer_etf_3.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
