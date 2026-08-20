import React from 'react';
import { PayrollItem } from '../types';
import { X, Printer, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface PayslipModalProps {
  item: PayrollItem;
  month: string;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ item, month, onClose }) => {
  const handleExportPdf = () => {
    const headers = ['Description', 'Earnings (LKR)', 'Deductions (LKR)'];
    const data = [
      [`Basic Earned (${item.days_attended}/25 days)`, item.basic_earned.toLocaleString(), ''],
      ['Fixed Allowance Earned', item.fixed_allowance_earned.toLocaleString(), ''],
      ['Overtime (OT)', item.ot_amount.toLocaleString(), ''],
      ...(item.special_ot_bonus ? [['Special OT Bonus', item.special_ot_bonus.toLocaleString(), '']] : []),
      ['Base Incentive', item.incentive_amount.toLocaleString(), ''],
      ...(item.production_incentive ? [['Production Incentive', item.production_incentive.toLocaleString(), '']] : []),
      ...(item.sales_incentive ? [['Sales Incentive', item.sales_incentive.toLocaleString(), '']] : []),
      ...(item.seasonal_incentive ? [['Seasonal Incentive', item.seasonal_incentive.toLocaleString(), '']] : []),
      ...(item.attendance_incentive ? [['Attendance Bonus', item.attendance_incentive.toLocaleString(), '']] : []),
      ['EPF Employee (8%)', '', item.employee_epf_8.toLocaleString()],
      ['No-Pay Leave Deduction', '', item.no_pay_deduction.toLocaleString()],
      ...(item.allowance_deduction ? [['Allowance Shortfall', '', item.allowance_deduction.toLocaleString()]] : []),
      ['TOTALS', item.gross_earnings.toLocaleString(), item.total_deductions.toLocaleString()],
      ['NET SALARY PAYABLE', `LKR ${item.net_salary.toLocaleString()}`, '']
    ];

    const summaryCards = [
      { label: 'Employee', value: `${item.employee_number} - ${item.full_name_en}` },
      { label: 'NIC Number', value: item.nic },
      { label: 'Department', value: item.department },
      { label: 'Attendance', value: `${item.days_attended}/25 Days` },
      { label: 'Gross Pay', value: `LKR ${item.gross_earnings.toLocaleString()}` },
      { label: 'Net Payable', value: `LKR ${item.net_salary.toLocaleString()}` }
    ];

    exportToPdf({
      title: `Employee Payslip - ${month}`,
      subtitle: `${item.employee_number} - ${item.full_name_en} (${item.designation}, ${item.department})`,
      periodOrDate: month,
      headers,
      data,
      filename: `Payslip_${item.employee_number}_${month}`,
      orientation: 'portrait',
      summaryCards,
      footerNote: `Employer Contributions: EPF (12%): LKR ${item.employer_epf_12.toLocaleString()} | ETF (3%): LKR ${item.employer_etf_3.toLocaleString()}`
    });
  };

  const handleExportExcel = () => {
    const headers = ['Category', 'Item Description', 'Amount (LKR)'];
    const data = [
      ['Employee Information', 'Employee Number', item.employee_number],
      ['Employee Information', 'Full Name (English)', item.full_name_en],
      ['Employee Information', 'Full Name (Tamil/Sinhala)', `${item.full_name_ta} / ${item.full_name_si}`],
      ['Employee Information', 'NIC Number', item.nic],
      ['Employee Information', 'Department', item.department],
      ['Employee Information', 'Designation', item.designation],
      ['Employee Information', 'Bank Account', item.bank_details || 'N/A'],
      ['Employee Information', 'Days Attended', `${item.days_attended} / 25`],
      ['Earnings', 'Basic Salary Earned', item.basic_earned],
      ['Earnings', 'Fixed Allowance Earned', item.fixed_allowance_earned],
      ['Earnings', 'Overtime (OT)', item.ot_amount],
      ['Earnings', 'Special OT Bonus', item.special_ot_bonus || 0],
      ['Earnings', 'Incentives', item.incentive_amount],
      ['Earnings', 'Production Incentive', item.production_incentive || 0],
      ['Earnings', 'Sales Incentive', item.sales_incentive || 0],
      ['Earnings', 'Seasonal Incentive', item.seasonal_incentive || 0],
      ['Earnings', 'Attendance Bonus', item.attendance_incentive || 0],
      ['Summary', 'Gross Earnings', item.gross_earnings],
      ['Deductions', 'EPF Employee (8%)', item.employee_epf_8],
      ['Deductions', 'No-Pay Leave Deduction', item.no_pay_deduction],
      ['Deductions', 'Allowance Shortfall', item.allowance_deduction],
      ['Summary', 'Total Deductions', item.total_deductions],
      ['Disbursement', 'Net Salary Payable', item.net_salary],
      ['Statutory Employer', 'Employer EPF (12%)', item.employer_epf_12],
      ['Statutory Employer', 'Employer ETF (3%)', item.employer_etf_3]
    ];

    exportToExcel({
      filename: `Payslip_${item.employee_number}_${month}`,
      sheetName: 'Payslip',
      title: `Official Employee Payslip - ${month}`,
      subtitle: `${item.employee_number} - ${item.full_name_en}`,
      periodOrDate: month,
      headers,
      data
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6 print:hidden flex-wrap gap-3">
          <h3 className="text-xl font-bold text-stone-900">Payslip - {item.employee_number}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold inline-flex items-center cursor-pointer transition shadow-xs"
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-700" /> Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold inline-flex items-center cursor-pointer transition shadow-xs"
              title="Download official PDF document"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-rose-700" /> PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold inline-flex items-center cursor-pointer transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Document */}
        <div className="bg-white p-6 border border-stone-200 rounded-xl text-stone-800 text-sm shadow-xs">
          <div className="text-center border-b border-stone-300 pb-4 mb-4">
            <h2 className="text-xl font-bold text-emerald-900">UNIBRO SMART APPARELS (PVT) LTD</h2>
            <p className="text-xs text-stone-500">No. 45, Galle Road, Colombo 03, Sri Lanka</p>
            <p className="text-sm font-semibold text-stone-700 mt-2">PAY SLIP FOR THE MONTH OF {month}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <p className="mb-1"><b>Employee No:</b> {item.employee_number}</p>
              <p className="mb-1"><b>Employee Name:</b> {item.full_name_en}</p>
              <p className="mb-1"><b>Trilingual:</b> {item.full_name_ta} / {item.full_name_si}</p>
              <p><b>NIC:</b> {item.nic}</p>
            </div>
            <div>
              <p className="mb-1"><b>Department:</b> {item.department}</p>
              <p className="mb-1"><b>Designation:</b> {item.designation}</p>
              <p className="mb-1"><b>Bank Details:</b> {item.bank_details}</p>
              <p><b>Attendance:</b> {item.days_attended}/25 Days (No-pay: {item.no_pay_leave_days})</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 border-b pb-1">Earnings</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Basic Earned:</span> <span>LKR {item.basic_earned.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Fixed Allowance:</span> <span>LKR {item.fixed_allowance_earned.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Overtime (OT):</span> <span>LKR {item.ot_amount.toLocaleString()}</span></div>
                {item.special_ot_bonus > 0 && <div className="flex justify-between text-indigo-700"><span>Special OT Bonus:</span> <span>LKR {item.special_ot_bonus.toLocaleString()}</span></div>}
                <div className="flex justify-between"><span>Base Incentive:</span> <span>LKR {item.incentive_amount.toLocaleString()}</span></div>
                {item.production_incentive > 0 && <div className="flex justify-between text-emerald-700"><span>Production Incentive:</span> <span>LKR {item.production_incentive.toLocaleString()}</span></div>}
                {item.sales_incentive > 0 && <div className="flex justify-between text-amber-700"><span>Sales Incentive:</span> <span>LKR {item.sales_incentive.toLocaleString()}</span></div>}
                {item.seasonal_incentive > 0 && <div className="flex justify-between text-purple-700"><span>Seasonal Incentive:</span> <span>LKR {item.seasonal_incentive.toLocaleString()}</span></div>}
                {item.attendance_incentive > 0 && <div className="flex justify-between text-blue-700"><span>Attendance Bonus:</span> <span>LKR {item.attendance_incentive.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold border-t pt-1.5 text-stone-900">
                  <span>Gross Earnings:</span>
                  <span>LKR {item.gross_earnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 border-b pb-1">Deductions</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>EPF Employee (8%):</span> <span>LKR {item.employee_epf_8.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>No-Pay Deduction:</span> <span>LKR {item.no_pay_deduction.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Allowance Shortfall:</span> <span>LKR {item.allowance_deduction.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold border-t pt-1.5 text-stone-900">
                  <span>Total Deductions:</span>
                  <span>LKR {item.total_deductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center mb-6">
            <span className="font-bold text-emerald-900 text-base">Net Salary Payable:</span>
            <span className="font-extrabold text-emerald-900 text-xl">LKR {item.net_salary.toLocaleString()}</span>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-[11px] mb-8 flex justify-between">
            <div><b>Employer EPF (12%):</b> LKR {item.employer_epf_12.toLocaleString()}</div>
            <div><b>Employer ETF (3%):</b> LKR {item.employer_etf_3.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-stone-300 text-xs">
            <div className="text-center">
              <div className="h-12 border-b border-dashed border-stone-400 mb-1"></div>
              <p className="text-stone-500">Employee Signature</p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b border-dashed border-stone-400 mb-1"></div>
              <p className="text-stone-500">Authorized Signature & Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

