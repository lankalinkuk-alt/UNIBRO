import React, { useState, useEffect } from 'react';
import { Language, WorkSchedule, EmployeeScheduleAssignment, Employee } from '../types';
import { translations } from '../translations';
import { Clock, Plus, Edit, Trash2, Calendar, CheckCircle2, Moon, Sunrise, Sunset, Users, Briefcase, Sliders, Check, ShieldCheck } from 'lucide-react';
import { ReportToolbar } from './ReportToolbar';
import { exportToExcel, exportToPdf, printReport } from '../utils/exportUtils';

interface WorkingTimeModuleProps {
  language: Language;
}

export const WorkingTimeModule: React.FC<WorkingTimeModuleProps> = ({ language }) => {
  const t = translations[language];
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [assignments, setAssignments] = useState<EmployeeScheduleAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'schedules' | 'assignments' | 'calculator'>('schedules');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignScheduleId, setAssignScheduleId] = useState<string>('');
  const [assignTargetType, setAssignTargetType] = useState<'department' | 'employee'>('department');
  const [assignTargetId, setAssignTargetId] = useState<string>('Production');
  const [assignEffectiveFrom, setAssignEffectiveFrom] = useState<string>(new Date().toISOString().slice(0, 10));

  // Simulator state
  const [simEmployeeId, setSimEmployeeId] = useState<string>('');
  const [simDate, setSimDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [simCheckIn, setSimCheckIn] = useState<string>('08:15');
  const [simCheckOut, setSimCheckOut] = useState<string>('17:30');
  const [simResult, setSimResult] = useState<any>(null);

  // Form state for schedule
  const [name, setName] = useState('');
  const [shiftType, setShiftType] = useState<any>('Day');
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [totalWorkingHours, setTotalWorkingHours] = useState<number>(8);
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('13:00');
  const [breakPaid, setBreakPaid] = useState<boolean>(true);
  const [crossesMidnight, setCrossesMidnight] = useState<boolean>(false);

  // Late config
  const [gracePeriodMins, setGracePeriodMins] = useState<number>(15);
  const [markLateAfterGrace, setMarkLateAfterGrace] = useState<boolean>(true);
  const [deductForLate, setDeductForLate] = useState<boolean>(false);
  const [lateDeductionMethod, setLateDeductionMethod] = useState<any>('per_minute');
  const [lateDeductionAmount, setLateDeductionAmount] = useState<number>(100);

  // Half-day rules
  const [halfDayMinHours, setHalfDayMinHours] = useState<number>(4);
  const [absentMinHours, setAbsentMinHours] = useState<number>(2);

  // Overtime rules
  const [otStartAfterEnd, setOtStartAfterEnd] = useState<boolean>(true);
  const [minOtMins, setMinOtMins] = useState<number>(30);
  const [otRoundingMins, setOtRoundingMins] = useState<number>(15);
  const [normalOtRate, setNormalOtRate] = useState<number>(350);
  const [offDayOtRate, setOffDayOtRate] = useState<number>(500);
  const [holidayOtRate, setHolidayOtRate] = useState<number>(750);
  const [nightOtRate, setNightOtRate] = useState<number>(600);

  // Flexible
  const [earliestCheckin, setEarliestCheckin] = useState('07:30');
  const [latestCheckin, setLatestCheckin] = useState('09:30');
  const [requiredFlexibleHours, setRequiredFlexibleHours] = useState<number>(8);

  useEffect(() => {
    fetchSchedules();
    fetchAssignments();
    fetchEmployees();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/work-schedules');
      const data = await res.json();
      setSchedules(data);
      if (data.length > 0 && !assignScheduleId) setAssignScheduleId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/employee-schedule-assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
      if (data.length > 0) setSimEmployeeId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setName('');
    setShiftType('Day');
    setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setStartTime('08:00');
    setEndTime('17:00');
    setTotalWorkingHours(8);
    setBreakStart('12:00');
    setBreakEnd('13:00');
    setBreakPaid(true);
    setCrossesMidnight(false);
    setGracePeriodMins(15);
    setMarkLateAfterGrace(true);
    setDeductForLate(false);
    setLateDeductionMethod('per_minute');
    setLateDeductionAmount(100);
    setHalfDayMinHours(4);
    setAbsentMinHours(2);
    setOtStartAfterEnd(true);
    setMinOtMins(30);
    setOtRoundingMins(15);
    setNormalOtRate(350);
    setOffDayOtRate(500);
    setHolidayOtRate(750);
    setNightOtRate(600);
    setShowModal(true);
  };

  const openEditModal = (sch: WorkSchedule) => {
    setEditingSchedule(sch);
    setName(sch.name);
    setShiftType(sch.shift_type);
    setWorkingDays(sch.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setStartTime(sch.start_time);
    setEndTime(sch.end_time);
    setTotalWorkingHours(sch.total_working_hours);
    setBreakStart(sch.break_start);
    setBreakEnd(sch.break_end);
    setBreakPaid(sch.break_paid);
    setCrossesMidnight(sch.crosses_midnight);
    setGracePeriodMins(sch.grace_period_mins);
    setMarkLateAfterGrace(sch.mark_late_after_grace);
    setDeductForLate(sch.deduct_for_late);
    setLateDeductionMethod(sch.late_deduction_method);
    setLateDeductionAmount(sch.late_deduction_amount);
    setHalfDayMinHours(sch.half_day_min_hours);
    setAbsentMinHours(sch.absent_min_hours);
    setOtStartAfterEnd(sch.ot_start_after_end);
    setMinOtMins(sch.min_ot_mins);
    setOtRoundingMins(sch.ot_rounding_mins);
    setNormalOtRate(sch.normal_ot_rate);
    setOffDayOtRate(sch.off_day_ot_rate);
    setHolidayOtRate(sch.holiday_ot_rate);
    setNightOtRate(sch.night_ot_rate);
    setEarliestCheckin(sch.earliest_checkin || '07:30');
    setLatestCheckin(sch.latest_checkin || '09:30');
    setRequiredFlexibleHours(sch.required_flexible_hours || 8);
    setShowModal(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      shift_type: shiftType,
      working_days: workingDays,
      start_time: startTime,
      end_time: endTime,
      total_working_hours: Number(totalWorkingHours),
      break_start: breakStart,
      break_end: breakEnd,
      break_paid: breakPaid,
      crosses_midnight: crossesMidnight,
      grace_period_mins: Number(gracePeriodMins),
      mark_late_after_grace: markLateAfterGrace,
      deduct_for_late: deductForLate,
      late_deduction_method: lateDeductionMethod,
      late_deduction_amount: Number(lateDeductionAmount),
      half_day_min_hours: Number(halfDayMinHours),
      absent_min_hours: Number(absentMinHours),
      ot_start_after_end: otStartAfterEnd,
      min_ot_mins: Number(minOtMins),
      ot_rounding_mins: Number(otRoundingMins),
      normal_ot_rate: Number(normalOtRate),
      off_day_ot_rate: Number(offDayOtRate),
      holiday_ot_rate: Number(holidayOtRate),
      night_ot_rate: Number(nightOtRate),
      earliest_checkin: earliestCheckin,
      latest_checkin: latestCheckin,
      required_flexible_hours: Number(requiredFlexibleHours)
    };

    try {
      if (editingSchedule) {
        await fetch(`/api/work-schedules/${editingSchedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/work-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await fetch(`/api/work-schedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/employee-schedule-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: assignScheduleId,
          target_type: assignTargetType,
          target_id: assignTargetId,
          effective_from: assignEffectiveFrom
        })
      });
      setShowAssignModal(false);
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await fetch(`/api/employee-schedule-assignments/${id}`, { method: 'DELETE' });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSimulator = async () => {
    try {
      const res = await fetch('/api/attendance-calculate-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: simEmployeeId,
          date: simDate,
          check_in_time: simCheckIn,
          check_out_time: simCheckOut
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error(err);
      alert('Error calculating simulation');
    }
  };

  const toggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const getSchedulesExportData = () => {
    const headers = [
      'Schedule Name',
      'Shift Type',
      'Working Hours',
      'Start Time',
      'End Time',
      'Working Days',
      'Break Period',
      'Grace Period (Mins)',
      'Half-Day Min (Hrs)',
      'Absent Min (Hrs)',
      'Normal OT (LKR/Hr)',
      'Off-Day OT (LKR/Hr)',
      'Holiday OT (LKR/Hr)'
    ];

    const data = schedules.map(sch => [
      sch.name,
      sch.shift_type,
      `${sch.total_working_hours} hrs`,
      sch.start_time,
      sch.end_time,
      (sch.working_days || []).join(', '),
      `${sch.break_start} - ${sch.break_end} (${sch.break_paid ? 'Paid' : 'Unpaid'})`,
      sch.grace_period_mins,
      sch.half_day_min_hours,
      sch.absent_min_hours,
      sch.normal_ot_rate,
      sch.off_day_ot_rate,
      sch.holiday_ot_rate
    ]);

    const summaryCards = [
      { label: 'Configured Schedules', value: `${schedules.length} Shifts` },
      { label: 'Shift Varieties', value: 'Day / Evening / Night / Flex' },
      { label: 'Standard Shift Length', value: '8.0 Working Hours' }
    ];

    const avgOt = schedules.length > 0 ? Math.round(schedules.reduce((sum, s) => sum + s.normal_ot_rate, 0) / schedules.length) : 350;
    const summaryRows = [
      [
        'TOTALS',
        `${schedules.length} Schedules`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        `Avg Rs. ${avgOt}/hr`,
        '',
        ''
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportSchedulesExcel = () => {
    const { headers, data, summaryRows } = getSchedulesExportData();
    exportToExcel({
      filename: `Work_Schedules_Roster_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Shift Schedules',
      title: 'Sri Lanka Apparel Master Work Schedules & Shift Rules',
      subtitle: 'Official roster guidelines, grace thresholds, and shift specifications',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows
    });
  };

  const handleExportSchedulesPdf = () => {
    const { summaryCards, summaryRows } = getSchedulesExportData();
    const pdfHeaders = ['Schedule', 'Shift Type', 'Hours', 'Time Window', 'Days', 'Grace', 'OT Rate'];
    const pdfData = schedules.map(sch => [
      sch.name,
      sch.shift_type,
      `${sch.total_working_hours}h`,
      `${sch.start_time} - ${sch.end_time}`,
      (sch.working_days || []).join(', '),
      `${sch.grace_period_mins}m`,
      `Rs. ${sch.normal_ot_rate}/hr`
    ]);

    const avgOt = schedules.length > 0 ? Math.round(schedules.reduce((sum, s) => sum + s.normal_ot_rate, 0) / schedules.length) : 350;
    const pdfSummaryRows = [
      [
        'TOTALS',
        `${schedules.length} Shifts`,
        '',
        '',
        '',
        '',
        `Avg Rs. ${avgOt}/hr`
      ]
    ];

    exportToPdf({
      title: 'Master Working Schedules & Shift Types',
      subtitle: 'Plant operating hours, break intervals, and statutory overtime rules',
      periodOrDate: new Date().toLocaleDateString(),
      headers: pdfHeaders,
      data: pdfData,
      summaryRows: pdfSummaryRows,
      filename: `Work_Schedules_${new Date().toISOString().split('T')[0]}`,
      orientation: 'landscape',
      summaryCards
    });
  };

  const handlePrintSchedules = () => {
    const { summaryCards, summaryRows } = getSchedulesExportData();
    const printHeaders = ['Schedule Name', 'Shift', 'Standard Hours', 'Window', 'Working Days', 'Late Grace', 'Normal OT'];
    const printData = schedules.map(sch => [
      sch.name,
      sch.shift_type,
      `${sch.total_working_hours} hrs`,
      `${sch.start_time} - ${sch.end_time}`,
      (sch.working_days || []).join(', '),
      `${sch.grace_period_mins} mins`,
      `LKR ${sch.normal_ot_rate} / hr`
    ]);

    const avgOt = schedules.length > 0 ? Math.round(schedules.reduce((sum, s) => sum + s.normal_ot_rate, 0) / schedules.length) : 350;
    const printSummaryRows = [
      [
        'TOTALS',
        `${schedules.length} Shifts`,
        '',
        '',
        '',
        '',
        `Avg LKR ${avgOt} / hr`
      ]
    ];

    printReport({
      title: 'Apparel Factory Working Schedule Master',
      subtitle: 'Operational shift roster and grace period terms',
      periodOrDate: new Date().toLocaleDateString(),
      headers: printHeaders,
      data: printData,
      summaryCards,
      summaryRows: printSummaryRows,
      footerNote: 'Approved by Plant General Manager & Human Resources Director.'
    });
  };

  const getAssignmentsExportData = () => {
    const headers = ['Schedule Name', 'Assignment Scope', 'Department / Employee Target', 'Effective From Date'];
    const data = assignments.map(asg => {
      const sch = schedules.find(s => s.id === asg.schedule_id);
      const emp = asg.target_type === 'employee' ? employees.find(e => e.id === asg.target_id) : null;
      return [
        sch ? sch.name : 'Unknown Schedule',
        asg.target_type.toUpperCase(),
        asg.target_type === 'department' ? asg.target_id : (emp ? `${emp.full_name_en} (${emp.employee_number})` : asg.target_id),
        asg.effective_from
      ];
    });

    const deptCount = assignments.filter(a => a.target_type === 'department').length;
    const empCount = assignments.filter(a => a.target_type === 'employee').length;

    const summaryCards = [
      { label: 'Total Allocations', value: `${assignments.length} Mappings` },
      { label: 'Dept Policies', value: `${deptCount} Depts` },
      { label: 'Individual Overrides', value: `${empCount} Staff` }
    ];

    const summaryRows = [
      [
        'TOTALS',
        `${assignments.length} Allocations`,
        `${deptCount} Dept Policies / ${empCount} Staff Overrides`,
        ''
      ]
    ];

    return { headers, data, summaryCards, summaryRows };
  };

  const handleExportAssignmentsExcel = () => {
    const { headers, data, summaryRows } = getAssignmentsExportData();
    exportToExcel({
      filename: `Shift_Assignments_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Shift Assignments',
      title: 'Sri Lanka Apparel Department & Employee Shift Assignment Register',
      subtitle: 'Schedule allocation mappings and effective operational dates',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows
    });
  };

  const handleExportAssignmentsPdf = () => {
    const { headers, data, summaryCards, summaryRows } = getAssignmentsExportData();
    exportToPdf({
      title: 'Employee & Department Shift Allocations',
      subtitle: 'Active schedule assignments across factory operations',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryRows,
      filename: `Shift_Assignments_${new Date().toISOString().split('T')[0]}`,
      orientation: 'portrait',
      summaryCards
    });
  };

  const handlePrintAssignments = () => {
    const { headers, data, summaryCards, summaryRows } = getAssignmentsExportData();
    printReport({
      title: 'Shift Assignment & Roster Allocation Register',
      subtitle: 'Official deployment schedule for plant personnel',
      periodOrDate: new Date().toLocaleDateString(),
      headers,
      data,
      summaryCards,
      summaryRows,
      footerNote: 'Human Resources & Floor Operations Coordination.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Working Time, Shifts, Late & Overtime Configuration
          </h2>
          <p className="text-sm text-stone-500 mt-1">Configure company working schedules, shift types, grace periods, late deductions, half-day thresholds, and overtime rules.</p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'schedules' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Schedules & Shifts ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'assignments' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Assignments ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'calculator' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Attendance & OT Simulator
          </button>
        </div>
      </div>

      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <ReportToolbar
              onExportExcel={handleExportSchedulesExcel}
              onExportPdf={handleExportSchedulesPdf}
              onPrint={handlePrintSchedules}
              disabled={schedules.length === 0}
              label="Export Schedules"
            />
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Working Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((sch) => (
              <div key={sch.id} className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
                      sch.shift_type === 'Day' ? 'bg-amber-50 text-amber-700' :
                      sch.shift_type === 'Night' ? 'bg-indigo-50 text-indigo-700' :
                      sch.shift_type === 'Flexible' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {sch.shift_type === 'Night' ? <Moon className="w-3.5 h-3.5" /> : <Sunrise className="w-3.5 h-3.5" />}
                      {sch.shift_type} Shift
                    </span>
                    <span className="text-xs font-bold text-stone-600">{sch.total_working_hours} hrs / day</span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-1">{sch.name}</h3>
                  <p className="text-xs text-stone-500 mb-4 font-medium">Time: <strong className="text-stone-700">{sch.start_time} - {sch.end_time}</strong> {sch.crosses_midnight && '(Crosses Midnight)'}</p>

                  <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl mb-4">
                    <div className="flex justify-between"><span>Working Days:</span> <strong className="text-stone-800">{(sch.working_days || []).join(', ')}</strong></div>
                    <div className="flex justify-between"><span>Break:</span> <strong className="text-stone-800">{sch.break_start} - {sch.break_end} ({sch.break_paid ? 'Paid' : 'Unpaid'})</strong></div>
                    <div className="flex justify-between"><span>Grace Period:</span> <strong className="text-stone-800">{sch.grace_period_mins} mins</strong></div>
                    <div className="flex justify-between"><span>Late Deduction:</span> <strong className="text-stone-800">{sch.deduct_for_late ? `${sch.late_deduction_method} (Rs. ${sch.late_deduction_amount})` : 'Disabled'}</strong></div>
                    <div className="flex justify-between"><span>Half-Day / Absent:</span> <strong className="text-stone-800">&lt;{sch.half_day_min_hours}h / &lt;{sch.absent_min_hours}h</strong></div>
                    <div className="flex justify-between"><span>Normal OT Rate:</span> <strong className="text-emerald-700 font-bold">Rs. {sch.normal_ot_rate}/hr</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => openEditModal(sch)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-200 transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(sch.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <ReportToolbar
              onExportExcel={handleExportAssignmentsExcel}
              onExportPdf={handleExportAssignmentsPdf}
              onPrint={handlePrintAssignments}
              disabled={assignments.length === 0}
              label="Export Assignments"
            />
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Assign Schedule
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="p-4">Schedule Name</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Target Name / Department</th>
                  <th className="p-4">Effective From</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {assignments.map((asg) => {
                  const sch = schedules.find(s => s.id === asg.schedule_id);
                  const emp = asg.target_type === 'employee' ? employees.find(e => e.id === asg.target_id) : null;
                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{sch ? sch.name : 'Unknown Schedule'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${asg.target_type === 'department' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                          {asg.target_type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {asg.target_type === 'department' ? asg.target_id : (emp ? `${emp.full_name_en} (${emp.employee_number})` : asg.target_id)}
                      </td>
                      <td className="p-4 text-slate-600">{asg.effective_from}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteAssignment(asg.id)}
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Attendance & Overtime Calculator Simulator
            </h3>
            <p className="text-xs text-slate-500">Test how check-in/out times compute late deductions, half-day status, normal hours, and overtime against the employee's assigned schedule.</p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={simEmployeeId}
                  onChange={(e) => setSimEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name_en} ({emp.department} - {emp.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-In Time</label>
                  <input
                    type="time"
                    value={simCheckIn}
                    onChange={(e) => setSimCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={simCheckOut}
                    onChange={(e) => setSimCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleRunSimulator}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Run Calculation Engine
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Calculation Results & Breakdown
              </h3>

              {simResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-600">Attendance Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      simResult.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                      simResult.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                      simResult.status === 'Half-day' ? 'bg-purple-50 text-purple-700' : 'bg-rose-50 text-rose-700'
                    }`}>{simResult.status}</span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl">
                    <div className="flex justify-between"><span>Assigned Schedule:</span> <strong className="text-slate-800">{simResult.schedule_name}</strong></div>
                    <div className="flex justify-between"><span>Worked Hours:</span> <strong className="text-slate-800">{simResult.worked_hours} hours</strong></div>
                    <div className="flex justify-between"><span>Normal Hours:</span> <strong className="text-slate-800">{simResult.normal_hours} hours</strong></div>
                    <div className="flex justify-between"><span>Overtime (OT) Hours:</span> <strong className="text-emerald-700 font-bold">{simResult.ot_hours} hours</strong></div>
                    <div className="flex justify-between"><span>Late Deduction:</span> <strong className="text-rose-600">Rs. {simResult.late_deduction.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>Half-Day Deduction:</span> <strong className="text-rose-600">Rs. {simResult.half_day_deduction.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>Special OT Bonus:</span> <strong className="text-indigo-700 font-bold">Rs. {simResult.special_ot_bonus.toLocaleString()}</strong></div>
                  </div>
                  {simResult.remarks && (
                    <p className="text-xs text-slate-500 italic bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <strong>Note:</strong> {simResult.remarks}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-sm">
                  Run simulation to view computed hours, late deductions, and overtime breakdowns.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingSchedule ? 'Edit Working Schedule' : 'Add Working Schedule'}</h3>
            <form onSubmit={handleSaveSchedule} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Standard Day Shift (8:00 - 17:00)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Type</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Evening">Evening Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="Rotating">Rotating Shift</option>
                    <option value="Flexible">Flexible Shift</option>
                  </select>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleWorkingDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        workingDays.includes(day) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={totalWorkingHours}
                    onChange={(e) => setTotalWorkingHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grace Period (Mins)</label>
                  <input
                    type="number"
                    value={gracePeriodMins}
                    onChange={(e) => setGracePeriodMins(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Break Start</label>
                  <input
                    type="time"
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Break End</label>
                  <input
                    type="time"
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="breakPaid"
                    checked={breakPaid}
                    onChange={(e) => setBreakPaid(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <label htmlFor="breakPaid" className="text-xs font-semibold text-slate-700">Break is Paid</label>
                </div>
              </div>

              {/* Late & Half Day Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Late & Half-Day Rules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="deductForLate"
                      checked={deductForLate}
                      onChange={(e) => setDeductForLate(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <label htmlFor="deductForLate" className="text-xs font-semibold text-slate-700">Deduct for Late Arrival</label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Late Deduction Method</label>
                    <select
                      value={lateDeductionMethod}
                      onChange={(e) => setLateDeductionMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="per_minute">Per Minute</option>
                      <option value="per_hour">Per Hour</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Deduction Rate (LKR)</label>
                    <input
                      type="number"
                      value={lateDeductionAmount}
                      onChange={(e) => setLateDeductionAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Half-Day if Worked Less Than (Hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={halfDayMinHours}
                      onChange={(e) => setHalfDayMinHours(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Absent if Worked Less Than (Hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={absentMinHours}
                      onChange={(e) => setAbsentMinHours(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Overtime Rates Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Overtime & Rate Configuration</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Normal OT Rate (/hr)</label>
                    <input
                      type="number"
                      value={normalOtRate}
                      onChange={(e) => setNormalOtRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Off-Day OT Rate (/hr)</label>
                    <input
                      type="number"
                      value={offDayOtRate}
                      onChange={(e) => setOffDayOtRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday OT Rate (/hr)</label>
                    <input
                      type="number"
                      value={holidayOtRate}
                      onChange={(e) => setHolidayOtRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Night OT Rate (/hr)</label>
                    <input
                      type="number"
                      value={nightOtRate}
                      onChange={(e) => setNightOtRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="crossesMidnight"
                    checked={crossesMidnight}
                    onChange={(e) => setCrossesMidnight(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <label htmlFor="crossesMidnight" className="text-xs font-semibold text-slate-700">Shift Crosses Midnight (Night Shift Support)</label>
                </div>
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Assign Working Schedule</h3>
            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Working Schedule</label>
                <select
                  value={assignScheduleId}
                  onChange={(e) => setAssignScheduleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  {schedules.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Type</label>
                <select
                  value={assignTargetType}
                  onChange={(e) => setAssignTargetType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="department">By Department</option>
                  <option value="employee">By Individual Employee</option>
                </select>
              </div>

              {assignTargetType === 'department' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="All">All Departments</option>
                    <option value="Production">Production</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Sales & Admin">Sales & Admin</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee</label>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name_en} ({emp.employee_number})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Effective From Date</label>
                <input
                  type="date"
                  required
                  value={assignEffectiveFrom}
                  onChange={(e) => setAssignEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
