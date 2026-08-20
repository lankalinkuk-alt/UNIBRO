// Universal Client-Side Storage & API Interceptor for UNIBRO SMART APPARELS
// Enables 100% full offline & static hosting (Netlify, Vercel, GitHub Pages) support

export interface LocalStorageDB {
  profiles: any[];
  salary_schemes: any[];
  employees: any[];
  attendance: any[];
  leave_records: any[];
  overtime_entries: any[];
  incentive_entries: any[];
  seasonal_incentive_rules: any[];
  special_ot_rules: any[];
  production_entries: any[];
  sales_entries: any[];
  daily_production_entries: any[];
  daily_sales_entries: any[];
  work_schedules: any[];
  employee_schedule_assignments: any[];
  payroll_runs: any[];
  payroll_items: any[];
  daily_attendance: any[];
  daily_overtime: any[];
  biometric_devices: any[];
  biometric_user_mappings: any[];
  biometric_attendance_logs: any[];
  epf_etf_payments: any[];
  audit_logs: any[];
  company_settings: any;
}

export const defaultSalarySchemes = [
  {
    id: "sch-1",
    name: "Executive Scheme (25,000 Basic)",
    scheme_name: "Executive Scheme (25,000 Basic)",
    basic_salary: 25000,
    fixed_allowance_25_days: 15000,
    deduct_day_1: 1000,
    deduct_day_2: 1500,
    deduct_day_3: 2000,
    deduct_day_4: 2500,
    deduct_additional_day: 3000,
    ot_normal_rate_per_hour: 250,
    ot_off_rate_per_hour: 350,
    ot_poya_rate_per_hour: 500,
    incentive_type: "Manufacturing",
    default_incentive_amount: 5000,
    epf_etf_applicable: true,
    budgetary_relief: 3500,
    bra_allowance: 2500,
    epf_applicable_allowances: 4000,
    ot_rate_type: "1.5",
    attendance_incentive_rule: "target_days",
    attendance_incentive_target_days: 25,
    attendance_incentive_amount: 5000,
    no_pay_deduction_rate: 0
  },
  {
    id: "sch-2",
    name: "Staff Scheme (40,000 Basic)",
    scheme_name: "Staff Scheme (40,000 Basic)",
    basic_salary: 40000,
    fixed_allowance_25_days: 20000,
    deduct_day_1: 1500,
    deduct_day_2: 2000,
    deduct_day_3: 2500,
    deduct_day_4: 3000,
    deduct_additional_day: 4000,
    ot_normal_rate_per_hour: 350,
    ot_off_rate_per_hour: 500,
    ot_poya_rate_per_hour: 750,
    incentive_type: "Sales",
    default_incentive_amount: 7500,
    epf_etf_applicable: true,
    budgetary_relief: 5000,
    bra_allowance: 3000,
    epf_applicable_allowances: 6000,
    ot_rate_type: "1.5",
    attendance_incentive_rule: "target_days",
    attendance_incentive_target_days: 25,
    attendance_incentive_amount: 7500,
    no_pay_deduction_rate: 0
  },
  {
    id: "sch-3",
    name: "Standard Garment Operator (35,000 Basic)",
    scheme_name: "Standard Garment Operator (35,000 Basic)",
    basic_salary: 35000,
    fixed_allowance_25_days: 15000,
    deduct_day_1: 1000,
    deduct_day_2: 1200,
    deduct_day_3: 1500,
    deduct_day_4: 2000,
    deduct_additional_day: 2500,
    ot_normal_rate_per_hour: 280,
    ot_off_rate_per_hour: 400,
    ot_poya_rate_per_hour: 600,
    incentive_type: "Manufacturing",
    default_incentive_amount: 5000,
    epf_etf_applicable: true,
    budgetary_relief: 3500,
    bra_allowance: 2500,
    epf_applicable_allowances: 4000,
    ot_rate_type: "1.5",
    attendance_incentive_rule: "target_days",
    attendance_incentive_target_days: 25,
    attendance_incentive_amount: 5000,
    no_pay_deduction_rate: 0
  }
];

export const defaultInitialDB: LocalStorageDB = {
  profiles: [
    {
      id: "u1",
      email: "admin@unibro.lk",
      name: "System Admin",
      role: "admin",
      status: "active",
      permissions: [
        "manage_users",
        "edit_employee",
        "delete_employee",
        "manage_schemes",
        "calculate_payroll",
        "lock_payroll",
        "epf_etf_vouchers",
        "manage_biometric",
        "system_config",
        "export_reports",
        "view_audit_logs"
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "u2",
      email: "hr@unibro.lk",
      name: "HR Manager",
      role: "hr",
      status: "active",
      permissions: [
        "edit_employee",
        "manage_biometric",
        "export_reports"
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "u3",
      email: "payroll@unibro.lk",
      name: "Payroll Accountant",
      role: "payroll",
      status: "active",
      permissions: [
        "calculate_payroll",
        "epf_etf_vouchers",
        "export_reports"
      ],
      created_at: new Date().toISOString()
    }
  ],
  salary_schemes: defaultSalarySchemes,
  employees: [],
  attendance: [],
  leave_records: [],
  overtime_entries: [],
  incentive_entries: [],
  seasonal_incentive_rules: [],
  special_ot_rules: [],
  production_entries: [],
  sales_entries: [],
  daily_production_entries: [],
  daily_sales_entries: [],
  work_schedules: [
    {
      id: "sch-day",
      name: "Standard Day Shift (08:00 - 17:00)",
      shift_type: "Day",
      working_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      start_time: "08:00",
      end_time: "17:00",
      total_working_hours: 8,
      break_start: "12:00",
      break_end: "13:00",
      break_paid: true,
      crosses_midnight: false,
      grace_period_mins: 15,
      mark_late_after_grace: true,
      deduct_for_late: true,
      late_deduction_method: "per_minute",
      late_deduction_amount: 100,
      half_day_min_hours: 4,
      absent_min_hours: 2,
      ot_start_after_end: true,
      min_ot_mins: 30,
      ot_rounding_mins: 15,
      normal_ot_rate: 350,
      off_day_ot_rate: 500,
      holiday_ot_rate: 750,
      night_ot_rate: 600
    },
    {
      id: "sch-night",
      name: "Night Production Shift (20:00 - 05:00)",
      shift_type: "Night",
      working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      start_time: "20:00",
      end_time: "05:00",
      total_working_hours: 8,
      break_start: "00:00",
      break_end: "01:00",
      break_paid: true,
      crosses_midnight: true,
      grace_period_mins: 15,
      mark_late_after_grace: true,
      deduct_for_late: true,
      late_deduction_method: "per_minute",
      late_deduction_amount: 120,
      half_day_min_hours: 4,
      absent_min_hours: 2,
      ot_start_after_end: true,
      min_ot_mins: 30,
      ot_rounding_mins: 15,
      normal_ot_rate: 450,
      off_day_ot_rate: 600,
      holiday_ot_rate: 900,
      night_ot_rate: 750
    }
  ],
  employee_schedule_assignments: [],
  payroll_runs: [],
  payroll_items: [],
  daily_attendance: [],
  daily_overtime: [],
  biometric_devices: [],
  biometric_user_mappings: [],
  biometric_attendance_logs: [],
  epf_etf_payments: [],
  audit_logs: [],
  company_settings: {
    company_name: "UNIBRO SMART APPARELS (PVT) LTD",
    company_address: "No. 45, Galle Road, Colombo 03, Sri Lanka",
    epf_employer_rate: 12,
    epf_employee_rate: 8,
    etf_employer_rate: 3,
    standard_working_days: 25,
    work_start_time: "08:30",
    supabase_url: "",
    supabase_anon_key: "",
    seasonal_incentive_collision_mode: "highest_only"
  }
};

const STORAGE_KEY = 'unibro_hrm_db';

export const getClientDB = (): LocalStorageDB => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialDB));
      return defaultInitialDB;
    }
    const parsed = JSON.parse(raw);
    // Ensure all mandatory arrays exist and salary_schemes has default schemes if empty
    if (!parsed.salary_schemes || parsed.salary_schemes.length === 0) {
      parsed.salary_schemes = defaultSalarySchemes;
    }
    if (!parsed.profiles || parsed.profiles.length === 0) {
      parsed.profiles = defaultInitialDB.profiles;
    }
    if (!parsed.employees) parsed.employees = [];
    if (!parsed.attendance) parsed.attendance = [];
    if (!parsed.payroll_runs) parsed.payroll_runs = [];
    if (!parsed.company_settings) parsed.company_settings = defaultInitialDB.company_settings;
    if (!parsed.work_schedules || parsed.work_schedules.length === 0) parsed.work_schedules = defaultInitialDB.work_schedules;
    if (!parsed.employee_schedule_assignments) parsed.employee_schedule_assignments = [];
    if (!parsed.special_ot_rules) parsed.special_ot_rules = [];
    if (!parsed.seasonal_incentive_rules) parsed.seasonal_incentive_rules = [];
    if (!parsed.epf_etf_payments) parsed.epf_etf_payments = [];
    if (!parsed.biometric_devices) parsed.biometric_devices = [];
    if (!parsed.biometric_user_mappings) parsed.biometric_user_mappings = [];
    if (!parsed.biometric_attendance_logs) parsed.biometric_attendance_logs = [];
    if (!parsed.audit_logs) parsed.audit_logs = [];
    return parsed;
  } catch (e) {
    console.error("Error reading client DB from localStorage:", e);
    return defaultInitialDB;
  }
};

export const saveClientDB = (db: LocalStorageDB) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Error saving client DB to localStorage:", e);
  }
};

// Creates a synthetic Response object that mimics window.fetch Response
const createJsonResponse = (data: any, status = 200, statusText = 'OK'): Response => {
  const body = JSON.stringify(data);
  return new Response(body, {
    status,
    statusText,
    headers: {
      'Content-Type': 'application/json',
      'X-Served-By': 'UNIBRO-Client-DB'
    }
  });
};

export const handleClientApiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const method = (options.method || 'GET').toUpperCase();
  const db = getClientDB();
  
  // Clean URL path
  const parsedUrl = new URL(url, window.location.origin);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  let bodyData: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      bodyData = JSON.parse(options.body);
    } catch {
      bodyData = {};
    }
  }

  // 1. EMPLOYEES
  if (pathname === '/api/employees') {
    if (method === 'GET') {
      return createJsonResponse(db.employees || []);
    }
    if (method === 'POST') {
      const newEmp = {
        id: `emp-${Date.now()}`,
        employee_number: bodyData.employee_number || `NL-${String(db.employees.length + 1).padStart(3, '0')}`,
        full_name_en: bodyData.full_name_en || '',
        full_name_ta: bodyData.full_name_ta || '',
        full_name_si: bodyData.full_name_si || '',
        nic: bodyData.nic || '',
        department: bodyData.department || 'Production',
        designation: bodyData.designation || 'Operator',
        join_date: bodyData.join_date || new Date().toISOString().split('T')[0],
        employment_status: bodyData.employment_status || 'Active',
        epf_enabled: bodyData.epf_enabled ?? true,
        etf_enabled: bodyData.etf_enabled ?? true,
        ot_eligible: bodyData.ot_eligible ?? true,
        salary_scheme_id: bodyData.salary_scheme_id || (db.salary_schemes[0]?.id || 'sch-1'),
        bank_name: bodyData.bank_name || 'Commercial Bank',
        bank_branch: bodyData.bank_branch || 'Colombo 03',
        bank_account_number: bodyData.bank_account_number || '',
        created_at: new Date().toISOString()
      };
      db.employees.push(newEmp);
      db.audit_logs.unshift({
        id: `audit-${Date.now()}`,
        action: 'EMPLOYEE_CREATE',
        timestamp: new Date().toISOString(),
        user: 'admin@unibro.lk',
        details: `Registered employee ${newEmp.full_name_en} (${newEmp.employee_number})`
      });
      saveClientDB(db);
      return createJsonResponse(newEmp, 201);
    }
  }

  const empIdMatch = pathname.match(/^\/api\/employees\/([^/]+)$/);
  if (empIdMatch) {
    const id = empIdMatch[1];
    if (method === 'PUT') {
      const index = db.employees.findIndex(e => e.id === id);
      if (index !== -1) {
        db.employees[index] = { ...db.employees[index], ...bodyData };
        db.audit_logs.unshift({
          id: `audit-${Date.now()}`,
          action: 'EMPLOYEE_UPDATE',
          timestamp: new Date().toISOString(),
          user: 'admin@unibro.lk',
          details: `Updated employee ${db.employees[index].full_name_en} (${db.employees[index].employee_number})`
        });
        saveClientDB(db);
        return createJsonResponse(db.employees[index]);
      }
      return createJsonResponse({ error: 'Employee not found' }, 404);
    }
    if (method === 'DELETE') {
      const index = db.employees.findIndex(e => e.id === id);
      if (index !== -1) {
        const deleted = db.employees.splice(index, 1)[0];
        db.audit_logs.unshift({
          id: `audit-${Date.now()}`,
          action: 'EMPLOYEE_DELETE',
          timestamp: new Date().toISOString(),
          user: 'admin@unibro.lk',
          details: `Deleted employee ${deleted.full_name_en} (${deleted.employee_number})`
        });
        saveClientDB(db);
        return createJsonResponse({ message: 'Deleted successfully' });
      }
      return createJsonResponse({ error: 'Employee not found' }, 404);
    }
  }

  // 2. SALARY SCHEMES
  if (pathname === '/api/salary-schemes') {
    if (method === 'GET') {
      if (!db.salary_schemes || db.salary_schemes.length === 0) {
        db.salary_schemes = defaultSalarySchemes;
        saveClientDB(db);
      }
      return createJsonResponse(db.salary_schemes);
    }
    if (method === 'POST') {
      const newScheme = {
        id: `sch-${Date.now()}`,
        ...bodyData
      };
      db.salary_schemes.push(newScheme);
      saveClientDB(db);
      return createJsonResponse(newScheme, 201);
    }
  }

  const schemeIdMatch = pathname.match(/^\/api\/salary-schemes\/([^/]+)$/);
  if (schemeIdMatch) {
    const id = schemeIdMatch[1];
    if (method === 'PUT') {
      const index = db.salary_schemes.findIndex(s => s.id === id);
      if (index !== -1) {
        db.salary_schemes[index] = { ...db.salary_schemes[index], ...bodyData };
        saveClientDB(db);
        return createJsonResponse(db.salary_schemes[index]);
      }
      return createJsonResponse({ error: 'Scheme not found' }, 404);
    }
  }

  // 3. PROFILES & USERS
  if (pathname === '/api/profiles') {
    if (method === 'GET') {
      return createJsonResponse(db.profiles || defaultInitialDB.profiles);
    }
    if (method === 'POST') {
      const newProfile = {
        id: `u-${Date.now()}`,
        email: bodyData.email,
        name: bodyData.name,
        role: bodyData.role || 'viewer',
        status: 'active',
        permissions: bodyData.permissions || [],
        created_at: new Date().toISOString()
      };
      db.profiles.push(newProfile);
      saveClientDB(db);
      return createJsonResponse(newProfile, 201);
    }
  }

  const profileIdMatch = pathname.match(/^\/api\/profiles\/([^/]+)$/);
  if (profileIdMatch) {
    const id = profileIdMatch[1];
    if (method === 'PUT') {
      const idx = db.profiles.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.profiles[idx] = { ...db.profiles[idx], ...bodyData };
        saveClientDB(db);
        return createJsonResponse(db.profiles[idx]);
      }
      return createJsonResponse({ error: 'User not found' }, 404);
    }
    if (method === 'DELETE') {
      db.profiles = db.profiles.filter(p => p.id !== id);
      saveClientDB(db);
      return createJsonResponse({ message: 'User deleted' });
    }
  }

  const profileToggleMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/toggle-status$/);
  if (profileToggleMatch) {
    const id = profileToggleMatch[1];
    const user = db.profiles.find(p => p.id === id);
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
      saveClientDB(db);
      return createJsonResponse(user);
    }
  }

  // 4. SETTINGS
  if (pathname === '/api/settings') {
    if (method === 'GET') {
      return createJsonResponse(db.company_settings || defaultInitialDB.company_settings);
    }
    if (method === 'POST') {
      db.company_settings = { ...db.company_settings, ...bodyData };
      saveClientDB(db);
      return createJsonResponse(db.company_settings);
    }
  }

  // 5. AUDIT LOGS
  if (pathname === '/api/audit-logs') {
    return createJsonResponse(db.audit_logs || []);
  }

  // 6. DASHBOARD METRICS
  if (pathname === '/api/dashboard/realtime-attendance') {
    const activeEmployees = db.employees.filter(e => e.employment_status === 'Active');
    return createJsonResponse({
      date: new Date().toISOString().split('T')[0],
      total_employees: db.employees.length,
      active_employees: activeEmployees.length,
      present_count: activeEmployees.length,
      late_count: 0,
      leaves_count: 0,
      absent_count: 0,
      on_floor_now: activeEmployees.length,
      recent_punches: [],
      devices_online: db.biometric_devices.filter(d => d.status === 'online').length,
      devices_total: db.biometric_devices.length
    });
  }

  // 7. WORK SCHEDULES
  if (pathname === '/api/work-schedules') {
    if (method === 'GET') return createJsonResponse(db.work_schedules || defaultInitialDB.work_schedules);
    if (method === 'POST') {
      const newSch = { id: `sch-${Date.now()}`, ...bodyData };
      db.work_schedules.push(newSch);
      saveClientDB(db);
      return createJsonResponse(newSch, 201);
    }
  }

  // 8. SCHEDULE ASSIGNMENTS
  if (pathname === '/api/employee-schedule-assignments') {
    if (method === 'GET') return createJsonResponse(db.employee_schedule_assignments || []);
    if (method === 'POST') {
      const newAsg = { id: `asg-${Date.now()}`, ...bodyData };
      db.employee_schedule_assignments.push(newAsg);
      saveClientDB(db);
      return createJsonResponse(newAsg, 201);
    }
  }

  // 9. SPECIAL OT & SEASONAL RULES
  if (pathname === '/api/special-ot-rules') {
    if (method === 'GET') return createJsonResponse(db.special_ot_rules || []);
    if (method === 'POST') {
      const newRule = { id: `sot-${Date.now()}`, ...bodyData };
      db.special_ot_rules.push(newRule);
      saveClientDB(db);
      return createJsonResponse(newRule, 201);
    }
  }

  if (pathname === '/api/seasonal-incentive-rules') {
    if (method === 'GET') return createJsonResponse(db.seasonal_incentive_rules || []);
    if (method === 'POST') {
      const newRule = { id: `sir-${Date.now()}`, ...bodyData };
      db.seasonal_incentive_rules.push(newRule);
      saveClientDB(db);
      return createJsonResponse(newRule, 201);
    }
  }

  // 10. PAYROLL RUNS
  const payrollMonthMatch = pathname.match(/^\/api\/payroll-runs\/([^/]+)$/);
  if (payrollMonthMatch) {
    const month = payrollMonthMatch[1];
    const run = (db.payroll_runs || []).find(r => r.month === month);
    return createJsonResponse(run || null);
  }

  if (pathname === '/api/payroll-runs/calculate') {
    const month = bodyData.month || new Date().toISOString().slice(0, 7);
    const employees = db.employees.filter(e => e.employment_status === 'Active');
    const items = employees.map(emp => {
      const scheme = db.salary_schemes.find(s => s.id === emp.salary_scheme_id) || db.salary_schemes[0] || defaultSalarySchemes[0];
      const basic = scheme.basic_salary || 35000;
      const bra = scheme.bra_allowance || 2500;
      const budgetRelief = scheme.budgetary_relief || 3500;
      const epfGross = basic + bra + budgetRelief;
      const epfEmp = epfGross * 0.08;
      const epfEmplr = epfGross * 0.12;
      const etfEmplr = epfGross * 0.03;
      const otAmount = 0;
      const fixedAllowance = scheme.fixed_allowance_25_days || 15000;
      const grossEarnings = epfGross + fixedAllowance + otAmount;
      const totalDeductions = epfEmp;
      const netSalary = grossEarnings - totalDeductions;
      
      return {
        id: `pitem-${emp.id}-${month}`,
        employee_id: emp.id,
        employee_number: emp.employee_number,
        full_name_en: emp.full_name_en,
        department: emp.department,
        designation: emp.designation,
        basic_salary: basic,
        budgetary_relief: budgetRelief,
        bra_allowance: bra,
        epf_applicable_allowances: 0,
        gross_salary_for_epf: epfGross,
        fixed_allowance_25_days: fixedAllowance,
        ot_hours: 0,
        ot_amount: otAmount,
        attendance_incentive: 5000,
        gross_earnings: grossEarnings,
        epf_employee: epfEmp,
        salary_advance: 0,
        loan_deduction: 0,
        stamp_duty: 0,
        no_pay_deduction: 0,
        other_deductions: 0,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        epf_employer: epfEmplr,
        etf_employer: etfEmplr,
        total_statutory_liability: epfEmplr + etfEmplr,
        days_attended: 25,
        payment_method: 'bank',
        bank_name: emp.bank_name || 'Commercial Bank',
        bank_account_number: emp.bank_account_number || ''
      };
    });

    const newRun = {
      id: `prun-${month}`,
      month,
      status: 'Draft',
      is_locked: false,
      calculated_at: new Date().toISOString(),
      employee_count: items.length,
      total_gross_pay: items.reduce((sum, i) => sum + i.gross_earnings, 0),
      total_net_pay: items.reduce((sum, i) => sum + i.net_salary, 0),
      total_epf_employee: items.reduce((sum, i) => sum + i.epf_employee, 0),
      total_epf_employer: items.reduce((sum, i) => sum + i.epf_employer, 0),
      total_etf_employer: items.reduce((sum, i) => sum + i.etf_employer, 0),
      items
    };

    const existingIndex = (db.payroll_runs || []).findIndex(r => r.month === month);
    if (existingIndex >= 0) {
      db.payroll_runs[existingIndex] = newRun;
    } else {
      if (!db.payroll_runs) db.payroll_runs = [];
      db.payroll_runs.push(newRun);
    }
    saveClientDB(db);
    return createJsonResponse(newRun);
  }

  // 11. EPF/ETF PAYMENTS
  if (pathname === '/api/epf-etf-payments') {
    if (method === 'GET') return createJsonResponse(db.epf_etf_payments || []);
    if (method === 'POST') {
      const newPmt = { id: `epf-pmt-${Date.now()}`, ...bodyData, created_at: new Date().toISOString() };
      if (!db.epf_etf_payments) db.epf_etf_payments = [];
      db.epf_etf_payments.push(newPmt);
      saveClientDB(db);
      return createJsonResponse(newPmt, 201);
    }
  }

  // 12. BIOMETRICS
  if (pathname === '/api/biometric/devices') {
    if (method === 'GET') return createJsonResponse(db.biometric_devices || []);
    if (method === 'POST') {
      const newDev = { id: `bio-${Date.now()}`, status: 'online', ...bodyData };
      if (!db.biometric_devices) db.biometric_devices = [];
      db.biometric_devices.push(newDev);
      saveClientDB(db);
      return createJsonResponse(newDev, 201);
    }
  }

  if (pathname === '/api/biometric/mappings') {
    if (method === 'GET') return createJsonResponse(db.biometric_user_mappings || []);
    if (method === 'POST') {
      const newMap = { id: `map-${Date.now()}`, ...bodyData };
      if (!db.biometric_user_mappings) db.biometric_user_mappings = [];
      db.biometric_user_mappings.push(newMap);
      saveClientDB(db);
      return createJsonResponse(newMap, 201);
    }
  }

  if (pathname === '/api/biometric/logs') {
    return createJsonResponse(db.biometric_attendance_logs || []);
  }

  // 13. BACKUP & RESTORE
  if (pathname === '/api/backup') {
    const backupJson = JSON.stringify(db, null, 2);
    return new Response(backupJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="HRM-Backup-${new Date().toISOString().slice(0, 10)}.json"`
      }
    });
  }

  if (pathname === '/api/restore' && method === 'POST') {
    try {
      const restoredData = bodyData;
      if (restoredData && typeof restoredData === 'object') {
        saveClientDB({ ...db, ...restoredData });
        return createJsonResponse({ message: 'Backup restored successfully' });
      }
      return createJsonResponse({ error: 'Invalid backup file format' }, 400);
    } catch {
      return createJsonResponse({ error: 'Failed to restore backup' }, 500);
    }
  }

  if (pathname === '/api/reset-data' && method === 'POST') {
    const cleanDB: LocalStorageDB = {
      ...defaultInitialDB,
      profiles: db.profiles && db.profiles.length > 0 ? db.profiles : defaultInitialDB.profiles,
      salary_schemes: db.salary_schemes && db.salary_schemes.length > 0 ? db.salary_schemes : defaultInitialDB.salary_schemes,
      company_settings: db.company_settings || defaultInitialDB.company_settings,
      employees: [],
      attendance: [],
      leave_records: [],
      overtime_entries: [],
      incentive_entries: [],
      seasonal_incentive_rules: [],
      special_ot_rules: [],
      production_entries: [],
      sales_entries: [],
      daily_production_entries: [],
      daily_sales_entries: [],
      work_schedules: db.work_schedules && db.work_schedules.length > 0 ? db.work_schedules : defaultInitialDB.work_schedules,
      employee_schedule_assignments: [],
      payroll_runs: [],
      payroll_items: [],
      daily_attendance: [],
      daily_overtime: [],
      biometric_devices: [],
      biometric_user_mappings: [],
      biometric_attendance_logs: [],
      epf_etf_payments: [],
      audit_logs: [
        {
          id: `audit-${Date.now()}`,
          action: 'DATA_RESET',
          timestamp: new Date().toISOString(),
          user: 'admin@unibro.lk',
          details: 'Cleared all mock/demo transaction records and employees'
        }
      ]
    };
    saveClientDB(cleanDB);
    return createJsonResponse({ success: true, message: 'All demo data cleared successfully' });
  }

  // Default fallback for any other GET/POST/PUT/DELETE
  return createJsonResponse({ success: true, message: 'Handled in client DB', timestamp: new Date().toISOString() });
};

// Global Fetch Interceptor Setup
export const setupClientApiInterceptor = () => {
  if (typeof window === 'undefined') return;

  // Initialize DB immediately
  getClientDB();

  const originalFetch = window.fetch ? window.fetch.bind(window) : fetch.bind(globalThis);

  const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let urlStr = '';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else if (input instanceof Request) {
      urlStr = input.url;
    }

    // Only intercept /api/* routes
    if (urlStr.startsWith('/api/') || urlStr.includes('/api/')) {
      try {
        const response = await originalFetch(input, init);
        
        // If response is valid JSON from an actual Express server, return it!
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          return response;
        }
        
        // If response is HTML (e.g. Netlify _redirects serving index.html) or 404/500, fallback to client DB!
        if (contentType.includes('text/html') || !response.ok) {
          return await handleClientApiRequest(urlStr, init);
        }

        return response;
      } catch {
        // When server is offline or Netlify static host has no backend
        return await handleClientApiRequest(urlStr, init);
      }
    }

    return originalFetch(input, init);
  };

  try {
    // Try standard assignment first
    window.fetch = customFetch;
  } catch {
    try {
      // If window.fetch has only a getter or is non-writable, override via defineProperty
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.warn("Could not patch window.fetch directly:", e);
    }
  }
};
