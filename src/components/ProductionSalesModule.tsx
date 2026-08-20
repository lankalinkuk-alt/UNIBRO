import React, { useState, useEffect } from 'react';
import { Language, Employee } from '../types';
import { translations } from '../translations';
import { BarChart3, TrendingUp, Save, Check, Calendar, FileText } from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface ProductionSalesModuleProps {
  language: Language;
}

export const ProductionSalesModule: React.FC<ProductionSalesModuleProps> = ({ language }) => {
  const t = translations[language];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mode, setMode] = useState<'monthly' | 'daily'>('monthly');
  const [month, setMonth] = useState('2026-08');
  const [selectedDate, setSelectedDate] = useState('2026-08-13');

  // Monthly state
  const [productionEntries, setProductionEntries] = useState<{ [empId: string]: number }>({});
  const [salesEntries, setSalesEntries] = useState<{ [empId: string]: number }>({});

  // Daily state
  const [dailyProdEntries, setDailyProdEntries] = useState<{ [empId: string]: number }>({});
  const [dailySalesEntries, setDailySalesEntries] = useState<{ [empId: string]: number }>({});

  // Aggregated totals for display in daily mode
  const [aggregatedMonthlyProd, setAggregatedMonthlyProd] = useState<{ [empId: string]: number }>({});
  const [aggregatedMonthlySales, setAggregatedMonthlySales] = useState<{ [empId: string]: number }>({});

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (mode === 'monthly') {
      fetchMonthlyData(month);
    } else {
      fetchDailyData(selectedDate);
      fetchMonthlyAggregates(selectedDate.slice(0, 7));
    }
  }, [mode, month, selectedDate]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonthlyData = async (m: string) => {
    try {
      const [prodRes, salesRes] = await Promise.all([
        fetch(`/api/production-entries?month=${m}`),
        fetch(`/api/sales-entries?month=${m}`)
      ]);
      const prodData = await prodRes.json();
      const salesData = await salesRes.json();

      const prodMap: { [id: string]: number } = {};
      prodData.forEach((p: any) => { prodMap[p.employee_id] = p.units_produced; });
      setProductionEntries(prodMap);

      const salesMap: { [id: string]: number } = {};
      salesData.forEach((s: any) => { salesMap[s.employee_id] = s.sales_amount; });
      setSalesEntries(salesMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDailyData = async (date: string) => {
    try {
      const [prodRes, salesRes] = await Promise.all([
        fetch(`/api/daily-production-entries?date=${date}`),
        fetch(`/api/daily-sales-entries?date=${date}`)
      ]);
      const prodData = await prodRes.json();
      const salesData = await salesRes.json();

      const prodMap: { [id: string]: number } = {};
      prodData.forEach((p: any) => { prodMap[p.employee_id] = p.units_produced; });
      setDailyProdEntries(prodMap);

      const salesMap: { [id: string]: number } = {};
      salesData.forEach((s: any) => { salesMap[s.employee_id] = s.sales_amount; });
      setDailySalesEntries(salesMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonthlyAggregates = async (m: string) => {
    try {
      const [prodRes, salesRes] = await Promise.all([
        fetch(`/api/daily-production-entries?month=${m}`),
        fetch(`/api/daily-sales-entries?month=${m}`)
      ]);
      const prodData = await prodRes.json();
      const salesData = await salesRes.json();

      const prodSums: { [id: string]: number } = {};
      prodData.forEach((p: any) => {
        prodSums[p.employee_id] = (prodSums[p.employee_id] || 0) + (p.units_produced || 0);
      });
      setAggregatedMonthlyProd(prodSums);

      const salesSums: { [id: string]: number } = {};
      salesData.forEach((s: any) => {
        salesSums[s.employee_id] = (salesSums[s.employee_id] || 0) + (s.sales_amount || 0);
      });
      setAggregatedMonthlySales(salesSums);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAll = async () => {
    try {
      if (mode === 'monthly') {
        const prodPromises = Object.entries(productionEntries).map(([employee_id, units_produced]) =>
          fetch('/api/production-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id, month, units_produced })
          })
        );

        const salesPromises = Object.entries(salesEntries).map(([employee_id, sales_amount]) =>
          fetch('/api/sales-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id, month, sales_amount })
          })
        );

        await Promise.all([...prodPromises, ...salesPromises]);
      } else {
        const prodPromises = Object.entries(dailyProdEntries).map(([employee_id, units_produced]) =>
          fetch('/api/daily-production-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id, date: selectedDate, units_produced })
          })
        );

        const salesPromises = Object.entries(dailySalesEntries).map(([employee_id, sales_amount]) =>
          fetch('/api/daily-sales-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id, date: selectedDate, sales_amount })
          })
        );

        await Promise.all([...prodPromises, ...salesPromises]);
        fetchMonthlyAggregates(selectedDate.slice(0, 7));
      }

      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving production & sales data');
    }
  };

  const activeEmployees = employees.filter(e => e.employment_status === 'Active' || e.employment_status === 'Probation');

  const getExportData = () => {
    const isMonthly = mode === 'monthly';
    const period = isMonthly ? month : selectedDate;

    const headers = isMonthly
      ? ['Emp #', 'Employee Name', 'Department', 'Designation', 'Production Units (Monthly)', 'Sales Amount (LKR)']
      : ['Emp #', 'Employee Name', 'Department', 'Designation', `Production Units (${selectedDate})`, `Sales Amount (${selectedDate}) (LKR)`, 'Month Cumulative Units', 'Month Cumulative Sales (LKR)'];

    const data = activeEmployees.map(emp => {
      if (isMonthly) {
        return [
          emp.employee_number,
          emp.full_name_en,
          emp.department,
          emp.designation,
          productionEntries[emp.id] || 0,
          salesEntries[emp.id] || 0
        ];
      } else {
        return [
          emp.employee_number,
          emp.full_name_en,
          emp.department,
          emp.designation,
          dailyProdEntries[emp.id] || 0,
          dailySalesEntries[emp.id] || 0,
          aggregatedMonthlyProd[emp.id] || 0,
          aggregatedMonthlySales[emp.id] || 0
        ];
      }
    });

    const totalProd = activeEmployees.reduce((sum, emp) => sum + (isMonthly ? (productionEntries[emp.id] || 0) : (dailyProdEntries[emp.id] || 0)), 0);
    const totalSales = activeEmployees.reduce((sum, emp) => sum + (isMonthly ? (salesEntries[emp.id] || 0) : (dailySalesEntries[emp.id] || 0)), 0);
    const totalAggMonthlyProd = activeEmployees.reduce((sum, emp) => sum + (aggregatedMonthlyProd[emp.id] || 0), 0);
    const totalAggMonthlySales = activeEmployees.reduce((sum, emp) => sum + (aggregatedMonthlySales[emp.id] || 0), 0);

    const summaryCards = [
      { label: 'Total Units Produced', value: `${totalProd.toLocaleString()} Units` },
      { label: 'Total Sales Achieved', value: `LKR ${totalSales.toLocaleString()}` },
      { label: 'Active Operators/Staff', value: `${activeEmployees.length} Staff` }
    ];

    const summaryRows = [
      isMonthly
        ? ['TOTALS', `${activeEmployees.length} Employees`, '', '', totalProd, totalSales]
        : ['TOTALS', `${activeEmployees.length} Employees`, '', '', totalProd, totalSales, `${totalAggMonthlyProd} units (Rs. ${totalAggMonthlySales.toLocaleString()})`]
    ];

    return { headers, data, summaryCards, summaryRows, period };
  };

  const handleExportExcel = () => {
    const { headers, data, summaryRows, period } = getExportData();
    exportToExcel({
      filename: `Production_Sales_Report_${period}`,
      sheetName: 'Production & Sales',
      title: 'Sri Lanka Apparel Production Units & Sales Achievement Record',
      subtitle: `Target achievements and incentive eligibility register (${mode === 'monthly' ? 'Monthly' : 'Daily'})`,
      periodOrDate: period,
      headers,
      data,
      summaryRows
    });
  };

  const handleExportPdf = () => {
    const { headers, data, summaryCards, summaryRows, period } = getExportData();
    exportToPdf({
      title: `Production & Sales Record - ${period}`,
      subtitle: `Factory floor production volume and commercial sales performance (${mode.toUpperCase()})`,
      periodOrDate: period,
      headers,
      data: data.map(row => row.map(cell => typeof cell === 'number' ? cell.toLocaleString() : String(cell))),
      summaryRows: summaryRows.map(row => row.map(cell => typeof cell === 'number' ? cell.toLocaleString() : String(cell))),
      filename: `Production_Sales_${period}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrint = () => {
    const { headers, data, summaryCards, summaryRows, period } = getExportData();
    printReport({
      title: 'Production & Sales Log Register',
      subtitle: `Official plant productivity and incentive basis document`,
      periodOrDate: period,
      headers,
      data: data.map(row => row.map(cell => typeof cell === 'number' ? cell.toLocaleString() : String(cell))),
      summaryCards,
      summaryRows: summaryRows.map(row => row.map(cell => typeof cell === 'number' ? cell.toLocaleString() : String(cell))),
      footerNote: 'Verified by Production Supervisor & Quality Assurance Lead.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Production & Sales Record Engine
          </h2>
          <p className="text-sm text-stone-500 mt-1">Record monthly totals or enter day-by-day production units and sales achievements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'monthly' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> Monthly Summary
            </button>
            <button
              onClick={() => setMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'daily' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Day-by-Day Record
            </button>
          </div>

          {mode === 'monthly' ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-600">Month:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-600">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            disabled={activeEmployees.length === 0}
            label="Export Report"
          />

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            {savedStatus ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedStatus ? 'Saved!' : mode === 'monthly' ? 'Save Monthly Records' : 'Save Daily Records'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-stone-900">Floor Output & Commercial Log</h3>
            <span className="text-xs text-stone-500">({activeEmployees.length} active staff)</span>
          </div>
          <ReportToolbar
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            size="sm"
            disabled={activeEmployees.length === 0}
            label="Export Records"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-600">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                {mode === 'monthly' ? (
                  <>
                    <th className="p-4">Production Units (Monthly)</th>
                    <th className="p-4">Sales Amount (LKR)</th>
                  </>
                ) : (
                  <>
                    <th className="p-4">Production Units ({selectedDate})</th>
                    <th className="p-4">Sales Amount ({selectedDate}) (LKR)</th>
                    <th className="p-4 bg-emerald-50/50 text-emerald-800">Monthly Total (Aggregated)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {activeEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-stone-800">{emp.full_name_en}</div>
                    <div className="text-xs text-stone-500">{emp.employee_number}</div>
                  </td>
                  <td className="p-4 text-stone-600 font-medium">{emp.department}</td>
                  <td className="p-4 text-stone-600">{emp.designation}</td>
                  
                  {mode === 'monthly' ? (
                    <>
                      <td className="p-4">
                        <input
                          type="number"
                          value={productionEntries[emp.id] || 0}
                          onChange={(e) => setProductionEntries({ ...productionEntries, [emp.id]: Number(e.target.value) })}
                          className="w-36 px-3 py-1.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={salesEntries[emp.id] || 0}
                          onChange={(e) => setSalesEntries({ ...salesEntries, [emp.id]: Number(e.target.value) })}
                          className="w-36 px-3 py-1.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4">
                        <input
                          type="number"
                          value={dailyProdEntries[emp.id] || 0}
                          onChange={(e) => setDailyProdEntries({ ...dailyProdEntries, [emp.id]: Number(e.target.value) })}
                          className="w-36 px-3 py-1.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          placeholder="Daily units"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={dailySalesEntries[emp.id] || 0}
                          onChange={(e) => setDailySalesEntries({ ...dailySalesEntries, [emp.id]: Number(e.target.value) })}
                          className="w-36 px-3 py-1.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          placeholder="Daily sales"
                        />
                      </td>
                      <td className="p-4 bg-emerald-50/30 text-emerald-900 font-semibold">
                        <div>{aggregatedMonthlyProd[emp.id] || 0} units</div>
                        <div className="text-xs text-stone-500">Rs. {(aggregatedMonthlySales[emp.id] || 0).toLocaleString()}</div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            {activeEmployees.length > 0 && (
              <tfoot>
                <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300 text-sm">
                  <td className="p-4" colSpan={3}>
                    TOTALS ({activeEmployees.length} Staff)
                  </td>
                  {mode === 'monthly' ? (
                    <>
                      <td className="p-4 text-emerald-800">
                        {activeEmployees.reduce((sum, emp) => sum + (productionEntries[emp.id] || 0), 0).toLocaleString()} Units
                      </td>
                      <td className="p-4 text-emerald-800">
                        LKR {activeEmployees.reduce((sum, emp) => sum + (salesEntries[emp.id] || 0), 0).toLocaleString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-emerald-800">
                        {activeEmployees.reduce((sum, emp) => sum + (dailyProdEntries[emp.id] || 0), 0).toLocaleString()} Units
                      </td>
                      <td className="p-4 text-emerald-800">
                        LKR {activeEmployees.reduce((sum, emp) => sum + (dailySalesEntries[emp.id] || 0), 0).toLocaleString()}
                      </td>
                      <td className="p-4 bg-emerald-100/50 text-emerald-950">
                        <div>{activeEmployees.reduce((sum, emp) => sum + (aggregatedMonthlyProd[emp.id] || 0), 0).toLocaleString()} Units</div>
                        <div className="text-xs text-emerald-800 font-medium">LKR {activeEmployees.reduce((sum, emp) => sum + (aggregatedMonthlySales[emp.id] || 0), 0).toLocaleString()}</div>
                      </td>
                    </>
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

