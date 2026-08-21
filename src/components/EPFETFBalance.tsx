import React, { useState, useEffect } from 'react';
import { PayrollRun, PayrollItem, Language, EPFETFPayment, DepartmentStatutorySummary } from '../types';
import { translations } from '../translations';
import {
  ShieldCheck,
  Calculator,
  Calendar,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  Receipt,
  Trash2,
  Printer,
  ArrowRight,
  Filter,
  DollarSign,
  TrendingDown,
  Layers,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface EPFETFBalanceProps {
  language: Language;
}

interface BalanceSummaryData {
  month: string;
  has_payroll: boolean;
  payroll_status: string;
  total_epf_base: number;
  total_employee_epf_8: number;
  total_employer_epf_12: number;
  total_epf_20: number;
  total_employer_etf_3: number;
  total_statutory_liability: number;
  total_paid: number;
  total_paid_epf: number;
  total_paid_etf: number;
  current_outstanding_balance: number;
  epf_outstanding_balance: number;
  etf_outstanding_balance: number;
  overall_status: string;
  department_breakdown: DepartmentStatutorySummary[];
  payments: EPFETFPayment[];
}

export const EPFETFBalance: React.FC<EPFETFBalanceProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummaryData | null>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'employees' | 'payments'>('departments');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState<string>('');
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    department: 'All',
    payment_type: 'COMBINED_ALL' as EPFETFPayment['payment_type'],
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'Bank Transfer' as EPFETFPayment['payment_method'],
    reference_number: '',
    paid_to: 'Central Bank of Sri Lanka (EPF Dept) & ETF Board',
    notes: '',
    created_by: 'Admin / Employer'
  });

  // Voucher Preview Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<EPFETFPayment | null>(null);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const fetchData = async (month: string) => {
    try {
      const [runRes, summaryRes] = await Promise.all([
        fetch(`/api/payroll-runs/${month}`),
        fetch(`/api/epf-etf-balance-summary/${month}`)
      ]);

      const runData = await runRes.json();
      setPayrollRun(runData.run);
      setPayrollItems(runData.items || []);

      const summaryData = await summaryRes.json();
      setBalanceSummary(summaryData);
    } catch (err) {
      console.error('Error fetching EPF/ETF data:', err);
    }
  };

  const openPaymentModal = (dept: string = 'All', defaultAmount?: number, defaultType: EPFETFPayment['payment_type'] = 'COMBINED_ALL') => {
    let targetAmount = '';
    if (defaultAmount !== undefined && defaultAmount > 0) {
      targetAmount = String(defaultAmount);
    } else if (dept === 'All') {
      targetAmount = String(balanceSummary?.current_outstanding_balance || '');
    } else {
      const deptData = balanceSummary?.department_breakdown.find(d => d.department === dept);
      targetAmount = String(deptData?.current_balance || '');
    }

    setPaymentFormData({
      department: dept,
      payment_type: defaultType,
      payment_date: new Date().toISOString().split('T')[0],
      amount: targetAmount,
      payment_method: 'Bank Transfer',
      reference_number: `SLIPS-${Date.now().toString().slice(-6)}`,
      paid_to: dept === 'All' 
        ? 'Central Bank of Sri Lanka (EPF Dept) & ETF Board'
        : `Central Bank EPF / ETF - ${dept} Dept Allocation`,
      notes: `Monthly statutory remittance for ${selectedMonth} - ${dept} department`,
      created_by: 'Admin / Employer'
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await fetch('/api/epf-etf-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          payment_date: paymentFormData.payment_date,
          department: paymentFormData.department,
          payment_type: paymentFormData.payment_type,
          amount: Number(paymentFormData.amount),
          payment_method: paymentFormData.payment_method,
          reference_number: paymentFormData.reference_number,
          paid_to: paymentFormData.paid_to,
          notes: paymentFormData.notes,
          created_by: paymentFormData.created_by
        })
      });

      if (res.ok) {
        setIsPaymentModalOpen(false);
        setPaymentSuccessMsg(`Payment of LKR ${Number(paymentFormData.amount).toLocaleString()} successfully recorded! That portion has been deducted from the current balance.`);
        setTimeout(() => setPaymentSuccessMsg(null), 6000);
        await fetchData(selectedMonth);
      } else {
        const err = await res.json();
        alert(`Failed to record payment: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while recording payment.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async (id: string, amount: number) => {
    if (!confirm(`Are you sure you want to delete this payment of LKR ${amount.toLocaleString()}? The deleted amount will be added back to the current outstanding balance.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/epf-etf-payments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPaymentSuccessMsg(`Payment removed. LKR ${amount.toLocaleString()} restored to current outstanding balance.`);
        setTimeout(() => setPaymentSuccessMsg(null), 5000);
        await fetchData(selectedMonth);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete payment record.');
    }
  };

  // Calculations
  const totalEmpEPF = balanceSummary?.total_employee_epf_8 || payrollItems.reduce((acc, i) => acc + i.employee_epf_8, 0);
  const totalEmployerEPF = balanceSummary?.total_employer_epf_12 || payrollItems.reduce((acc, i) => acc + i.employer_epf_12, 0);
  const grandTotalEPF = balanceSummary?.total_epf_20 || (totalEmpEPF + totalEmployerEPF);
  const totalEmployerETF = balanceSummary?.total_employer_etf_3 || payrollItems.reduce((acc, i) => acc + i.employer_etf_3, 0);
  const totalStatutoryPayable = balanceSummary?.total_statutory_liability || (grandTotalEPF + totalEmployerETF);
  const totalEpfBase = balanceSummary?.total_epf_base || payrollItems.reduce((acc, i) => acc + (i.basic_earned + i.fixed_allowance_earned), 0);
  const totalPaid = balanceSummary?.total_paid || 0;
  const currentBalance = balanceSummary?.current_outstanding_balance ?? Math.max(0, totalStatutoryPayable - totalPaid);
  const paidPct = totalStatutoryPayable > 0 ? Math.min(100, Math.round((totalPaid / totalStatutoryPayable) * 100)) : 0;

  // Filtered employees
  const filteredEmployees = payrollItems.filter(item => {
    const matchesDept = selectedDeptFilter === 'All' || item.department === selectedDeptFilter;
    const matchesQuery = searchEmployeeQuery === '' ||
      item.full_name_en.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      item.employee_number.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      item.nic.toLowerCase().includes(searchEmployeeQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  // Export Data Builder
  const getExportData = () => {
    if (activeTab === 'departments') {
      const headers = [
        'Department Name',
        'Staff Count',
        'EPF Base Earnings (LKR)',
        'Employee EPF 8% (LKR)',
        'Employer EPF 12% (LKR)',
        'Total EPF 20% (LKR)',
        'Employer ETF 3% (LKR)',
        'Total Assessed Due (LKR)',
        'Total Remitted / Paid (LKR)',
        'Current Balance (LKR)',
        'Settlement Status'
      ];

      const deptList = balanceSummary?.department_breakdown || [];
      const data = deptList.map(d => [
        d.department,
        d.employee_count,
        d.epf_base_total,
        d.epf_employee_8,
        d.epf_employer_12,
        d.epf_total_20,
        d.etf_employer_3,
        d.total_statutory_due,
        d.total_paid,
        d.current_balance,
        d.status
      ]);

      const summaryCards = [
        { label: 'Assessed Statutory Due', value: `LKR ${totalStatutoryPayable.toLocaleString()}` },
        { label: 'Total Remitted / Paid', value: `LKR ${totalPaid.toLocaleString()} (${paidPct}%)` },
        { label: 'Current Balance Remaining', value: `LKR ${currentBalance.toLocaleString()}` },
        { label: 'Overall Settlement', value: balanceSummary?.overall_status || 'Pending' }
      ];

      const summaryRows = [
        [
          'TOTALS',
          `${payrollItems.length} Staff`,
          totalEpfBase,
          totalEmpEPF,
          totalEmployerEPF,
          grandTotalEPF,
          totalEmployerETF,
          totalStatutoryPayable,
          totalPaid,
          currentBalance,
          currentBalance === 0 ? 'Fully Settled' : 'Outstanding'
        ]
      ];

      return { headers, data, summaryCards, summaryRows };
    } else {
      const headers = [
        'Emp #',
        'Employee Name',
        'NIC Number',
        'Department',
        'Designation',
        'EPF Base Earnings (LKR)',
        'Employee EPF 8% (LKR)',
        'Employer EPF 12% (LKR)',
        'Total EPF 20% (LKR)',
        'Employer ETF 3% (LKR)',
        'Total Statutory Due (LKR)'
      ];

      const data = payrollItems.map(item => {
        const epfBase = item.basic_earned + item.fixed_allowance_earned;
        const totalItemEPF = item.employee_epf_8 + item.employer_epf_12;
        const totalItemStat = totalItemEPF + item.employer_etf_3;
        return [
          item.employee_number,
          item.full_name_en,
          item.nic,
          item.department,
          item.designation,
          epfBase,
          item.employee_epf_8,
          item.employer_epf_12,
          totalItemEPF,
          item.employer_etf_3,
          totalItemStat
        ];
      });

      const summaryCards = [
        { label: 'Total Assessed Due', value: `LKR ${totalStatutoryPayable.toLocaleString()}` },
        { label: 'Total Paid / Remitted', value: `LKR ${totalPaid.toLocaleString()}` },
        { label: 'Current Balance Remaining', value: `LKR ${currentBalance.toLocaleString()}` }
      ];

      const summaryRows = [
        [
          'TOTALS',
          `${payrollItems.length} Employees`,
          '',
          '',
          '',
          totalEpfBase,
          totalEmpEPF,
          totalEmployerEPF,
          grandTotalEPF,
          totalEmployerETF,
          totalStatutoryPayable
        ]
      ];

      return { headers, data, summaryCards, summaryRows };
    }
  };

  const handleExportExcel = () => {
    const { headers, data, summaryRows } = getExportData();
    exportToExcel({
      filename: `EPF_ETF_Balance_Settlement_${selectedMonth}`,
      sheetName: activeTab === 'departments' ? 'Department Balances' : 'Form C Schedule',
      title: 'Sri Lanka Statutory EPF / ETF Remittance & Current Balance Reconciliation',
      subtitle: `Assessed Liability: LKR ${totalStatutoryPayable.toLocaleString()} | Total Remitted: LKR ${totalPaid.toLocaleString()} | Current Outstanding Balance: LKR ${currentBalance.toLocaleString()}`,
      periodOrDate: selectedMonth,
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPdf = () => {
    const { headers, data, summaryCards, summaryRows } = getExportData();
    const formattedData = data.map(row => 
      row.map((val) => (typeof val === 'number' ? val.toLocaleString() : val))
    );
    const formattedSummaryRows = summaryRows.map(row =>
      row.map((val) => (typeof val === 'number' ? val.toLocaleString() : val))
    );

    exportToPdf({
      title: 'EPF & ETF Statutory Monthly Remittance & Balance Reconciliation',
      subtitle: 'Departmental liability assessment, employer payments deducted, and current balance report',
      periodOrDate: selectedMonth,
      headers,
      data: formattedData,
      summaryRows: formattedSummaryRows,
      filename: `EPF_ETF_Balance_Report_${selectedMonth}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrint = () => {
    const { headers, data, summaryCards, summaryRows } = getExportData();
    const formattedData = data.map(row => 
      row.map((val) => (typeof val === 'number' ? `LKR ${val.toLocaleString()}` : val))
    );
    const formattedSummaryRows = summaryRows.map(row => 
      row.map((val) => (typeof val === 'number' ? `LKR ${val.toLocaleString()}` : val))
    );

    printReport({
      title: 'EPF & ETF Statutory Contribution & Remittance Reconciliation',
      subtitle: `Official Sri Lanka EPF & ETF Department Statement for ${selectedMonth} - Net Outstanding Balance: LKR ${currentBalance.toLocaleString()}`,
      periodOrDate: selectedMonth,
      headers,
      data: formattedData,
      summaryCards,
      summaryRows: formattedSummaryRows,
      footerNote: 'Certified true and correct statutory balance register. Paid amounts deducted directly upon payment verification.'
    });
  };

  const printSingleVoucher = (voucher: EPFETFPayment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print remittance vouchers.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remittance Voucher - ${voucher.reference_number}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1c1917; }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #047857; text-transform: uppercase; }
          .subtitle { font-size: 13px; color: #57534e; margin-top: 4px; }
          .voucher-box { border: 1px solid #d6d3d1; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .label { font-weight: 600; color: #44403c; width: 40%; }
          .val { width: 60%; color: #0c0a09; }
          .amount-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
          .amount-val { font-size: 24px; font-weight: bold; color: #065f46; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 10px; }
          .sig-box { text-align: center; width: 30%; border-top: 1px dashed #78716c; padding-top: 8px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">UNIBRO SMART APPARELS (PVT) LTD</div>
          <div class="subtitle">STATUTORY EPF / ETF PAYMENT & REMITTANCE VOUCHER</div>
        </div>
        <div class="voucher-box">
          <div class="row"><span class="label">Voucher / Receipt ID:</span><span class="val">${voucher.id}</span></div>
          <div class="row"><span class="label">Payment Date:</span><span class="val">${voucher.payment_date}</span></div>
          <div class="row"><span class="label">Statutory Payroll Period:</span><span class="val">${voucher.month}</span></div>
          <div class="row"><span class="label">Department / Scope:</span><span class="val">${voucher.department === 'All' ? 'All Plant Departments' : voucher.department}</span></div>
          <div class="row"><span class="label">Payment Purpose:</span><span class="val">${voucher.payment_type}</span></div>
          <div class="row"><span class="label">Payment Method:</span><span class="val">${voucher.payment_method}</span></div>
          <div class="row"><span class="label">Transaction / Cheque Ref:</span><span class="val">${voucher.reference_number}</span></div>
          <div class="row"><span class="label">Paid To / Authority:</span><span class="val">${voucher.paid_to}</span></div>
          <div class="row"><span class="label">Remarks / Description:</span><span class="val">${voucher.notes || 'N/A'}</span></div>
          <div class="row"><span class="label">Authorized By:</span><span class="val">${voucher.created_by || 'Finance Director'}</span></div>
        </div>
        <div class="amount-box">
          <div style="font-size: 12px; color: #047857; text-transform: uppercase; font-weight: 600;">Net Remittance Amount Paid</div>
          <div class="amount-val">LKR ${voucher.amount.toLocaleString()}</div>
        </div>
        <div class="signatures">
          <div class="sig-box">Prepared By (Accounts)</div>
          <div class="sig-box">Verified By (HR Dept)</div>
          <div class="sig-box">Approved By (Managing Director)</div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">EPF / ETF & Statutory Balances</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              currentBalance === 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : (totalPaid > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300')
            }`}>
              {currentBalance === 0 ? 'Fully Settled' : (totalPaid > 0 ? 'Partially Paid' : 'Pending Payment')}
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Departmental Provident Fund (8% + 12%) and Trust Fund (3%) contributions with live deduction on payment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-stone-300 rounded-xl shadow-2xs">
            <Calendar className="w-4 h-4 text-stone-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold text-stone-800 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => openPaymentModal('All')}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {t.record_payment || 'Record Employer Payment'}
          </button>

          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            disabled={payrollItems.length === 0}
          />
        </div>
      </div>

      {/* Success Notification Alert */}
      {paymentSuccessMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{paymentSuccessMsg}</span>
          </div>
          <button
            onClick={() => setPaymentSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Executive Statutory & Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Assessed Due */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Statutory Assessed</span>
            <Calculator className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">LKR {totalStatutoryPayable.toLocaleString()}</p>
          <div className="mt-2 text-xs text-stone-500 flex justify-between">
            <span>EPF (20%): LKR {grandTotalEPF.toLocaleString()}</span>
            <span>ETF (3%): LKR {totalEmployerETF.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Total Paid / Remitted */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.total_paid || 'Total Paid / Remitted'}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">LKR {totalPaid.toLocaleString()}</p>
          <div className="mt-2">
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500 mt-1">
              <span>{paidPct}% settled</span>
              <span>{balanceSummary?.payments.length || 0} vouchers paid</span>
            </div>
          </div>
        </div>

        {/* Card 3: Current Outstanding Balance (Deducted Portion) */}
        <div className={`p-5 rounded-xl border shadow-xs transition-colors ${
          currentBalance === 0
            ? 'bg-emerald-900 text-white border-emerald-800'
            : 'bg-amber-900 text-white border-amber-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
              {t.current_balance || 'Current Outstanding Balance'}
            </span>
            <TrendingDown className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-2xl font-bold tracking-tight">LKR {currentBalance.toLocaleString()}</p>
          <p className="text-xs text-amber-200/90 mt-2">
            {currentBalance === 0
              ? 'All department liabilities fully settled for this month.'
              : `Paid portions deducted. LKR ${currentBalance.toLocaleString()} remaining.`}
          </p>
        </div>

        {/* Card 4: EPF / ETF Fund Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Remaining by Fund</span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-600">EPF (8%+12%) Balance:</span>
              <span className="font-semibold text-stone-900">
                LKR {(balanceSummary?.epf_outstanding_balance ?? grandTotalEPF).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-600">ETF (3%) Balance:</span>
              <span className="font-semibold text-stone-900">
                LKR {(balanceSummary?.etf_outstanding_balance ?? totalEmployerETF).toLocaleString()}
              </span>
            </div>
            <div className="pt-1.5 border-t border-stone-100 flex justify-between text-xs font-bold">
              <span className="text-stone-800">Total Balance:</span>
              <span className={currentBalance === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                LKR {currentBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-stone-200 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'departments'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department Statutory Matrix & Current Balances
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {balanceSummary?.department_breakdown.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'employees'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Employee Statutory Schedule (Form C)
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {payrollItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
          }`}
        >
          <Receipt className="w-4 h-4" />
          {t.payment_history || 'Employer Payment History & Remittances'}
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {balanceSummary?.payments.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: Departmental Statutory Matrix & Balances */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Departmental Statutory Contributions & Settlement Status
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Breakdown of assessed EPF (20%) + ETF (3%) per department, employer payments remitted, and current outstanding balances.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openPaymentModal('All')}
                className="flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Pay Remaining Plant Balance
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Staff</th>
                  <th className="p-4">EPF Base</th>
                  <th className="p-4">Employee (8%)</th>
                  <th className="p-4">Employer (12%)</th>
                  <th className="p-4">Total EPF (20%)</th>
                  <th className="p-4">ETF (3%)</th>
                  <th className="p-4">Total Assessed</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Current Balance</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm">
                {(balanceSummary?.department_breakdown || []).map(dept => (
                  <tr key={dept.department} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-semibold text-stone-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-stone-400" />
                      {dept.department}
                    </td>
                    <td className="p-4 text-center text-stone-600">{dept.employee_count}</td>
                    <td className="p-4 text-stone-700">LKR {dept.epf_base_total.toLocaleString()}</td>
                    <td className="p-4 text-amber-700 font-medium">LKR {dept.epf_employee_8.toLocaleString()}</td>
                    <td className="p-4 text-purple-700 font-medium">LKR {dept.epf_employer_12.toLocaleString()}</td>
                    <td className="p-4 text-indigo-700 font-bold">LKR {dept.epf_total_20.toLocaleString()}</td>
                    <td className="p-4 text-blue-700 font-medium">LKR {dept.etf_employer_3.toLocaleString()}</td>
                    <td className="p-4 font-bold text-stone-900">LKR {dept.total_statutory_due.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-emerald-700">
                      LKR {dept.total_paid.toLocaleString()}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={dept.current_balance === 0 ? 'text-emerald-600' : 'text-amber-700 font-mono'}>
                        LKR {dept.current_balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        dept.status === 'Settled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (dept.status === 'Partially Paid'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800')
                      }`}>
                        {dept.status === 'Settled' ? 'Settled' : (dept.status === 'Partially Paid' ? 'Partial' : 'Unpaid')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {dept.current_balance > 0 ? (
                        <button
                          onClick={() => openPaymentModal(dept.department, dept.current_balance)}
                          className="inline-flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Balance
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!balanceSummary?.department_breakdown || balanceSummary.department_breakdown.length === 0) && (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-stone-400">
                      No payroll data calculated for {selectedMonth}. Run payroll first to assess statutory department liabilities.
                    </td>
                  </tr>
                )}
              </tbody>
              {Boolean(balanceSummary?.department_breakdown && balanceSummary.department_breakdown.length > 0) && (
                <tfoot>
                  <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300 text-sm">
                    <td className="p-4">GRAND TOTALS</td>
                    <td className="p-4 text-center">{payrollItems.length} Staff</td>
                    <td className="p-4">LKR {totalEpfBase.toLocaleString()}</td>
                    <td className="p-4 text-amber-800">LKR {totalEmpEPF.toLocaleString()}</td>
                    <td className="p-4 text-purple-800">LKR {totalEmployerEPF.toLocaleString()}</td>
                    <td className="p-4 text-indigo-800">LKR {grandTotalEPF.toLocaleString()}</td>
                    <td className="p-4 text-blue-800">LKR {totalEmployerETF.toLocaleString()}</td>
                    <td className="p-4 text-stone-900">LKR {totalStatutoryPayable.toLocaleString()}</td>
                    <td className="p-4 text-emerald-800">LKR {totalPaid.toLocaleString()}</td>
                    <td className={`p-4 font-mono font-bold ${currentBalance === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                      LKR {currentBalance.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${currentBalance === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                        {currentBalance === 0 ? 'Fully Settled' : 'Balance Due'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {currentBalance > 0 && (
                        <button
                          onClick={() => openPaymentModal('All', currentBalance)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          Settle All
                        </button>
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Individual Employee Statutory Schedule (Form C) */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Employee-Level EPF & ETF Schedule (Form C Format)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Official electronic return format for Central Bank EPF Department and ETF Board.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 border border-stone-300 rounded-lg text-xs">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search name, NIC, emp #..."
                  value={searchEmployeeQuery}
                  onChange={e => setSearchEmployeeQuery(e.target.value)}
                  className="bg-transparent border-none text-xs focus:outline-hidden w-40"
                />
              </div>

              <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 border border-stone-300 rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="bg-transparent border-none text-xs focus:outline-hidden font-medium"
                >
                  <option value="All">All Departments</option>
                  {(balanceSummary?.department_breakdown || []).map(d => (
                    <option key={d.department} value={d.department}>{d.department}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Emp #</th>
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">NIC</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">EPF Base Earnings</th>
                  <th className="p-4">Employee EPF (8%)</th>
                  <th className="p-4">Employer EPF (12%)</th>
                  <th className="p-4">Total EPF (20%)</th>
                  <th className="p-4">Employer ETF (3%)</th>
                  <th className="p-4">Total Statutory Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm">
                {filteredEmployees.map(item => {
                  const epfBase = item.basic_earned + item.fixed_allowance_earned;
                  const totalItemEPF = item.employee_epf_8 + item.employer_epf_12;
                  const totalDue = totalItemEPF + item.employer_etf_3;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-semibold text-emerald-700">{item.employee_number}</td>
                      <td className="p-4 font-medium text-stone-900">{item.full_name_en}</td>
                      <td className="p-4 text-stone-600 font-mono text-xs">{item.nic}</td>
                      <td className="p-4 text-stone-700">{item.department}</td>
                      <td className="p-4 text-stone-900">LKR {epfBase.toLocaleString()}</td>
                      <td className="p-4 text-amber-700 font-medium">LKR {item.employee_epf_8.toLocaleString()}</td>
                      <td className="p-4 text-purple-700 font-medium">LKR {item.employer_epf_12.toLocaleString()}</td>
                      <td className="p-4 text-indigo-700 font-bold">LKR {totalItemEPF.toLocaleString()}</td>
                      <td className="p-4 text-blue-700 font-medium">LKR {item.employer_etf_3.toLocaleString()}</td>
                      <td className="p-4 text-emerald-700 font-bold">LKR {totalDue.toLocaleString()}</td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-stone-400">
                      No matching employee statutory records found for {selectedMonth}.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredEmployees.length > 0 && (
                <tfoot>
                  <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300 text-sm">
                    <td className="p-4" colSpan={4}>SUBTOTAL ({filteredEmployees.length} Employees)</td>
                    <td className="p-4">
                      LKR {filteredEmployees.reduce((sum, i) => sum + (i.basic_earned + i.fixed_allowance_earned), 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-amber-800">
                      LKR {filteredEmployees.reduce((sum, i) => sum + i.employee_epf_8, 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-purple-800">
                      LKR {filteredEmployees.reduce((sum, i) => sum + i.employer_epf_12, 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-indigo-800">
                      LKR {filteredEmployees.reduce((sum, i) => sum + (i.employee_epf_8 + i.employer_epf_12), 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-blue-800">
                      LKR {filteredEmployees.reduce((sum, i) => sum + i.employer_etf_3, 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-emerald-800">
                      LKR {filteredEmployees.reduce((sum, i) => sum + (i.employee_epf_8 + i.employer_epf_12 + i.employer_etf_3), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Employer Payment History & Remittance Vouchers */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Employer Remittance Vouchers & Payment History ({selectedMonth})
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Official records of employer payments made to departments and statutory authorities. Each payment automatically deducts from the balance.
              </p>
            </div>
            <button
              onClick={() => openPaymentModal('All')}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Remittance Payment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Reference / Receipt #</th>
                  <th className="p-4">Department / Scope</th>
                  <th className="p-4">Fund Type</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Paid To / Authority</th>
                  <th className="p-4">Amount Paid (LKR)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm">
                {(balanceSummary?.payments || []).map(payment => (
                  <tr key={payment.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-semibold text-stone-900">{payment.payment_date}</td>
                    <td className="p-4 font-mono text-xs text-emerald-700 font-semibold">{payment.reference_number}</td>
                    <td className="p-4 font-medium text-stone-800">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-stone-400" />
                        {payment.department === 'All' ? 'All Departments' : payment.department}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                        {payment.payment_type}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">{payment.payment_method}</td>
                    <td className="p-4 text-stone-600 text-xs max-w-xs truncate">{payment.paid_to}</td>
                    <td className="p-4 font-bold text-emerald-700">LKR {payment.amount.toLocaleString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => printSingleVoucher(payment)}
                        title="Print Official Remittance Voucher"
                        className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Voucher
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id, payment.amount)}
                        title="Delete payment record (restores balance)"
                        className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!balanceSummary?.payments || balanceSummary.payments.length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      No remittance payments recorded yet for {selectedMonth}. Click "Record Employer Payment" above to deduct payments from the current balance.
                    </td>
                  </tr>
                )}
              </tbody>
              {Boolean(balanceSummary?.payments && balanceSummary.payments.length > 0) && (
                <tfoot>
                  <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300 text-sm">
                    <td className="p-4" colSpan={6}>TOTAL REMITTED / PAID PORTION</td>
                    <td className="p-4 font-bold text-emerald-800" colSpan={2}>
                      LKR {totalPaid.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* RECORD EMPLOYER PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Record Employer EPF / ETF Payment
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Paid portion will immediately deduct from the current outstanding balance.
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Month */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payroll Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    disabled
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-600 font-medium"
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentFormData.payment_date}
                    onChange={e => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Target Department *</label>
                  <select
                    value={paymentFormData.department}
                    onChange={e => {
                      const dept = e.target.value;
                      let amt = '';
                      if (dept === 'All') {
                        amt = String(balanceSummary?.current_outstanding_balance || '');
                      } else {
                        const d = balanceSummary?.department_breakdown.find(item => item.department === dept);
                        amt = String(d?.current_balance || '');
                      }
                      setPaymentFormData({
                        ...paymentFormData,
                        department: dept,
                        amount: amt
                      });
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="All">All Plant Departments (Proportional)</option>
                    {(balanceSummary?.department_breakdown || []).map(d => (
                      <option key={d.department} value={d.department}>
                        {d.department} (Bal: LKR {d.current_balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Component *</label>
                  <select
                    value={paymentFormData.payment_type}
                    onChange={e => setPaymentFormData({ ...paymentFormData, payment_type: e.target.value as any })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="COMBINED_ALL">Combined EPF (20%) + ETF (3%)</option>
                    <option value="EPF_20">Total EPF (20% - Emp 8% + Empr 12%)</option>
                    <option value="EPF_EMP_8">Employee EPF Portion Only (8%)</option>
                    <option value="EPF_EMPR_12">Employer EPF Portion Only (12%)</option>
                    <option value="ETF_3">Employer ETF Portion Only (3%)</option>
                  </select>
                </div>
              </div>

              {/* Amount to Pay */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-stone-700">Amount Paid (LKR) *</label>
                  <span className="text-xs text-stone-500">
                    Current Dept Balance: <strong className="text-amber-700">
                      LKR {paymentFormData.department === 'All'
                        ? currentBalance.toLocaleString()
                        : ((balanceSummary?.department_breakdown.find(d => d.department === paymentFormData.department)?.current_balance || 0).toLocaleString())}
                    </strong>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 font-semibold text-sm">LKR</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="Enter amount paid"
                    value={paymentFormData.amount}
                    onChange={e => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={paymentFormData.payment_method}
                    onChange={e => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value as any })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Bank Transfer">Bank Transfer / SLIPS</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Direct Debit">Direct Debit</option>
                    <option value="Online C-Form">Online C-Form Portal / e-Return</option>
                    <option value="Cash">Cash / Counter Payment</option>
                  </select>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Reference / Cheque # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBT-884920 or CHQ-10492"
                    value={paymentFormData.reference_number}
                    onChange={e => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Paid To Authority */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Paid To / Authority Account</label>
                <input
                  type="text"
                  value={paymentFormData.paid_to}
                  onChange={e => setPaymentFormData({ ...paymentFormData, paid_to: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Remarks / Audit Note</label>
                <textarea
                  rows={2}
                  placeholder="Optional payment narration or remittance notes"
                  value={paymentFormData.notes}
                  onChange={e => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingPayment ? (
                    'Recording...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Record & Deduct Balance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
