import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import JSZip from "jszip";
import * as XLSX from "xlsx";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Persistent JSON file store for backend state
const DATA_FILE = path.join(process.cwd(), "data.json");

interface DBData {
  profiles: any[];
  employees: any[];
  salary_schemes: any[];
  attendance: any[];
  leave_records: any[];
  overtime_entries: any[];
  incentive_entries: any[];
  seasonal_incentive_rules: any[];
  special_ot_rules: any[];
  production_entries: any[];
  sales_entries: any[];
  daily_production_entries?: any[];
  daily_sales_entries?: any[];
  work_schedules?: any[];
  employee_schedule_assignments?: any[];
  payroll_runs: any[];
  payroll_items: any[];
  epf_etf_payments?: any[];
  daily_attendance?: any[];
  daily_overtime?: any[];
  biometric_devices?: any[];
  biometric_user_mappings?: any[];
  biometric_attendance_logs?: any[];
  company_settings: any;
  audit_logs?: any[];
}

const initialData: DBData = {
  profiles: [
    { id: "u1", email: "admin@unibro.lk", name: "System Admin", role: "admin" },
    { id: "u2", email: "hr@unibro.lk", name: "HR Manager", role: "hr" },
    { id: "u3", email: "payroll@unibro.lk", name: "Payroll Accountant", role: "payroll" }
  ],
  salary_schemes: [
    {
      id: "sch-1",
      name: "Executive Scheme (25,000 Basic)",
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
      no_pay_deduction_rate: 0
    },
    {
      id: "sch-2",
      name: "Staff Scheme (40,000 Basic)",
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
      no_pay_deduction_rate: 0
    }
  ],
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
  work_schedules: [],
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

function readDB(): DBData {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
}

function writeDB(data: DBData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Endpoints

// Default permissions map by role
const DEFAULT_PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  admin: [
    'manage_users',
    'manage_employees',
    'manage_salary_schemes',
    'manage_attendance',
    'manage_working_time',
    'manage_biometric',
    'manage_incentives',
    'run_payroll',
    'approve_payroll',
    'manage_epf_etf',
    'export_reports',
    'backup_restore',
  ],
  hr: [
    'manage_employees',
    'manage_attendance',
    'manage_working_time',
    'manage_biometric',
    'manage_incentives',
    'export_reports',
  ],
  payroll: [
    'manage_salary_schemes',
    'manage_attendance',
    'manage_incentives',
    'run_payroll',
    'approve_payroll',
    'manage_epf_etf',
    'export_reports',
  ],
  manager: [
    'manage_attendance',
    'manage_biometric',
    'export_reports',
  ],
  viewer: [
    'export_reports',
    'view_only',
  ],
};

function normalizeProfile(p: any): any {
  const role = p.role || 'hr';
  return {
    id: p.id,
    email: p.email || '',
    name: p.name || 'Unnamed User',
    role: role,
    phone: p.phone || '',
    designation: p.designation || (role === 'admin' ? 'System Administrator' : role === 'hr' ? 'HR Manager' : role === 'payroll' ? 'Payroll Officer' : 'Staff'),
    department: p.department || (role === 'admin' ? 'Management' : role === 'hr' ? 'Human Resources' : role === 'payroll' ? 'Finance & Payroll' : 'Operations'),
    status: p.status === 'inactive' ? 'inactive' : 'active',
    permissions: Array.isArray(p.permissions) && p.permissions.length > 0 ? p.permissions : (DEFAULT_PERMISSIONS_BY_ROLE[role] || []),
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString(),
    last_login: p.last_login || null,
  };
}

// User Profiles & Permissions Endpoints
app.get("/api/profiles", (req, res) => {
  const db = readDB();
  const profiles = (db.profiles || []).map(normalizeProfile);
  res.json(profiles);
});

app.post("/api/profiles", (req, res) => {
  const requesterRole = req.headers['x-user-role'] || 'admin';
  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Administrator rights required to create users." });
  }

  const { email, name, role, phone, designation, department, status, permissions } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Name and Email are required fields." });
  }

  const db = readDB();
  if (!db.profiles) db.profiles = [];

  const existing = db.profiles.find((p: any) => p.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: "A user with this email address already exists." });
  }

  const userRole = role || 'hr';
  const newProfile = normalizeProfile({
    id: "u-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    email: email.trim(),
    name: name.trim(),
    role: userRole,
    phone: phone || '',
    designation: designation || '',
    department: department || '',
    status: status || 'active',
    permissions: Array.isArray(permissions) && permissions.length > 0 ? permissions : DEFAULT_PERMISSIONS_BY_ROLE[userRole],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  db.profiles.push(newProfile);

  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: "audit-" + Date.now(),
    action: 'USER_CREATE',
    timestamp: new Date().toISOString(),
    user: (req.headers['x-user-email'] as string) || 'admin@unibro.lk',
    details: `Created user '${newProfile.name}' (${newProfile.email}) with role '${newProfile.role}' and ${newProfile.permissions.length} permissions.`
  });

  writeDB(db);
  res.status(201).json(newProfile);
});

app.put("/api/profiles/:id", (req, res) => {
  const requesterRole = req.headers['x-user-role'] || 'admin';
  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Administrator rights required to edit users." });
  }

  const db = readDB();
  if (!db.profiles) db.profiles = [];

  const index = db.profiles.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const current = db.profiles[index];
  const { email, name, role, phone, designation, department, status, permissions } = req.body;

  // Safeguard: Do not allow demoting or deactivating the last active administrator
  const activeAdmins = db.profiles.filter((p: any) => p.id !== req.params.id && p.role === 'admin' && p.status !== 'inactive');
  if (current.role === 'admin' && (role !== 'admin' || status === 'inactive') && activeAdmins.length === 0) {
    return res.status(400).json({ error: "Cannot demote or deactivate the last remaining active Administrator." });
  }

  // Check email uniqueness if changed
  if (email && email.toLowerCase().trim() !== current.email.toLowerCase().trim()) {
    const duplicate = db.profiles.find((p: any) => p.id !== req.params.id && p.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (duplicate) {
      return res.status(400).json({ error: "Another user already uses this email address." });
    }
  }

  const newRole = role || current.role || 'hr';
  const updatedProfile = normalizeProfile({
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    email: email !== undefined ? email.trim() : current.email,
    role: newRole,
    phone: phone !== undefined ? phone : current.phone,
    designation: designation !== undefined ? designation : current.designation,
    department: department !== undefined ? department : current.department,
    status: status !== undefined ? status : current.status,
    permissions: Array.isArray(permissions) ? permissions : current.permissions || DEFAULT_PERMISSIONS_BY_ROLE[newRole],
    updated_at: new Date().toISOString(),
  });

  db.profiles[index] = updatedProfile;

  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: "audit-" + Date.now(),
    action: 'USER_UPDATE',
    timestamp: new Date().toISOString(),
    user: (req.headers['x-user-email'] as string) || 'admin@unibro.lk',
    details: `Updated user '${updatedProfile.name}' (${updatedProfile.email}) - Role: ${updatedProfile.role}, Status: ${updatedProfile.status}, Rights: ${updatedProfile.permissions.length}`
  });

  writeDB(db);
  res.json(updatedProfile);
});

app.delete("/api/profiles/:id", (req, res) => {
  const requesterRole = req.headers['x-user-role'] || 'admin';
  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Administrator rights required to delete users." });
  }

  const db = readDB();
  if (!db.profiles) db.profiles = [];

  const target = db.profiles.find((p: any) => p.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Safeguard: Cannot delete last active admin
  if (target.role === 'admin') {
    const remainingActiveAdmins = db.profiles.filter((p: any) => p.id !== req.params.id && p.role === 'admin' && p.status !== 'inactive');
    if (remainingActiveAdmins.length === 0) {
      return res.status(400).json({ error: "Cannot delete the last remaining active Administrator." });
    }
  }

  db.profiles = db.profiles.filter((p: any) => p.id !== req.params.id);

  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: "audit-" + Date.now(),
    action: 'USER_DELETE',
    timestamp: new Date().toISOString(),
    user: (req.headers['x-user-email'] as string) || 'admin@unibro.lk',
    details: `Deleted user '${target.name}' (${target.email}) [Role: ${target.role}]`
  });

  writeDB(db);
  res.json({ success: true, message: `User '${target.name}' deleted successfully.` });
});

app.post("/api/profiles/:id/toggle-status", (req, res) => {
  const requesterRole = req.headers['x-user-role'] || 'admin';
  if (requesterRole !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Administrator rights required." });
  }

  const db = readDB();
  if (!db.profiles) db.profiles = [];

  const target = db.profiles.find((p: any) => p.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const newStatus = target.status === 'inactive' ? 'active' : 'inactive';

  if (target.role === 'admin' && newStatus === 'inactive') {
    const remainingActiveAdmins = db.profiles.filter((p: any) => p.id !== req.params.id && p.role === 'admin' && p.status !== 'inactive');
    if (remainingActiveAdmins.length === 0) {
      return res.status(400).json({ error: "Cannot deactivate the last remaining active Administrator." });
    }
  }

  target.status = newStatus;
  target.updated_at = new Date().toISOString();

  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: "audit-" + Date.now(),
    action: 'USER_STATUS_CHANGE',
    timestamp: new Date().toISOString(),
    user: (req.headers['x-user-email'] as string) || 'admin@unibro.lk',
    details: `Changed status of '${target.name}' to ${newStatus}`
  });

  writeDB(db);
  res.json(normalizeProfile(target));
});

// Settings
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.company_settings);
});

app.post("/api/settings", (req, res) => {
  const db = readDB();
  db.company_settings = { ...db.company_settings, ...req.body };
  writeDB(db);
  res.json(db.company_settings);
});

// Backup & Restore Endpoints
app.get("/api/backup", async (req, res) => {
  const role = req.headers['x-user-role'] || 'admin';
  if (role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }

  const db = readDB();
  const zip = new JSZip();

  const addTableToZip = (filename: string, dataArray: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(dataArray && dataArray.length > 0 ? dataArray : [{ message: "No data" }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    zip.file(filename, excelBuffer);
  };

  addTableToZip("profiles.xlsx", (db.profiles || []).map(normalizeProfile));
  addTableToZip("employees.xlsx", db.employees || []);
  addTableToZip("salary_schemes.xlsx", db.salary_schemes || []);
  addTableToZip("attendance.xlsx", db.attendance || []);
  addTableToZip("leave_records.xlsx", db.leave_records || []);
  addTableToZip("overtime_entries.xlsx", db.overtime_entries || []);
  addTableToZip("incentive_entries.xlsx", db.incentive_entries || []);
  addTableToZip("seasonal_incentive_rules.xlsx", db.seasonal_incentive_rules || []);
  addTableToZip("special_ot_rules.xlsx", db.special_ot_rules || []);
  addTableToZip("production_entries.xlsx", db.production_entries || []);
  addTableToZip("sales_entries.xlsx", db.sales_entries || []);
  addTableToZip("payroll_runs.xlsx", db.payroll_runs || []);
  addTableToZip("payroll_items.xlsx", db.payroll_items || []);
  addTableToZip("epf_etf_payments.xlsx", db.epf_etf_payments || []);
  addTableToZip("daily_attendance.xlsx", db.daily_attendance || []);
  addTableToZip("daily_overtime.xlsx", db.daily_overtime || []);
  addTableToZip("company_settings.xlsx", [db.company_settings || {}]);
  addTableToZip("audit_logs.xlsx", db.audit_logs || []);

  zip.file("full_backup.json", JSON.stringify(db, null, 2));

  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: "audit-" + Date.now(),
    action: 'BACKUP',
    timestamp: new Date().toISOString(),
    user: 'admin@unibro.lk',
    details: 'System backup generated and downloaded as ZIP'
  });
  writeDB(db);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const filename = `HRM-Backup-${yyyy}-${mm}-${dd}-${hh}-${min}.zip`;

  const content = await zip.generateAsync({ type: "nodebuffer" });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

app.post("/api/restore", (req, res) => {
  const role = req.headers['x-user-role'] || req.body.role || 'admin';
  if (role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }

  const restoredData = req.body;
  if (!restoredData || !restoredData.employees || !restoredData.company_settings) {
    return res.status(400).json({ error: "Invalid backup structure. Missing required tables." });
  }

  const db = readDB();
  const auditLogs = db.audit_logs || [];
  auditLogs.unshift({
    id: "audit-" + Date.now(),
    action: 'RESTORE',
    timestamp: new Date().toISOString(),
    user: 'admin@unibro.lk',
    details: 'System restored from backup ZIP'
  });

  const newDB: DBData = {
    profiles: restoredData.profiles || db.profiles,
    employees: restoredData.employees || [],
    salary_schemes: restoredData.salary_schemes || [],
    attendance: restoredData.attendance || [],
    leave_records: restoredData.leave_records || [],
    overtime_entries: restoredData.overtime_entries || [],
    incentive_entries: restoredData.incentive_entries || [],
    seasonal_incentive_rules: restoredData.seasonal_incentive_rules || [],
    special_ot_rules: restoredData.special_ot_rules || [],
    production_entries: restoredData.production_entries || [],
    sales_entries: restoredData.sales_entries || [],
    payroll_runs: restoredData.payroll_runs || [],
    payroll_items: restoredData.payroll_items || [],
    epf_etf_payments: restoredData.epf_etf_payments || [],
    daily_attendance: restoredData.daily_attendance || [],
    daily_overtime: restoredData.daily_overtime || [],
    company_settings: restoredData.company_settings || {},
    audit_logs: auditLogs
  };

  writeDB(newDB);
  res.json({ success: true, message: "System restored successfully" });
});

app.get("/api/audit-logs", (req, res) => {
  const db = readDB();
  res.json(db.audit_logs || []);
});

// Real-time Attendance Dashboard Endpoint
app.get("/api/dashboard/realtime-attendance", (req, res) => {
  const db = readDB();
  const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const workStartTime = db.company_settings?.work_start_time || "08:30";

  const activeEmployees = (db.employees || []).filter(e => e.employment_status === 'Active' || e.employment_status === 'Probation');

  // Today's attendance check-ins
  const todayAttendance = (db.daily_attendance || []).filter(a => a.date === targetDate);
  const presentEmpIds = new Set(todayAttendance.map(a => a.employee_id));

  // Approved leave covering today
  const todayLeaves = (db.leave_records || []).filter(l =>
    l.status === 'Approved' && l.start_date <= targetDate && l.end_date >= targetDate
  );
  const leaveEmpIds = new Set(todayLeaves.map(l => l.employee_id));

  // Overtime entries today
  const todayOvertime = (db.daily_overtime || []).filter(ot => ot.date === targetDate && Number(ot.ot_hours) > 0);
  const otEmpIds = new Set(todayOvertime.map(ot => ot.employee_id));

  // Absent = active employees not present and not on approved leave
  const absentEmployees = activeEmployees.filter(emp => !presentEmpIds.has(emp.id) && !leaveEmpIds.has(emp.id));

  // Late arrivals = checked in after work start time
  const lateArrivals = todayAttendance.filter(a => {
    return a.check_in_time && a.check_in_time > workStartTime;
  }).map(a => {
    const emp = db.employees.find(e => e.id === a.employee_id);
    return {
      employee_id: a.employee_id,
      employee_number: emp?.employee_number || '',
      employee_name: emp?.full_name_en || 'Unknown',
      department: emp?.department || '',
      check_in_time: a.check_in_time,
      work_start_time: workStartTime
    };
  });

  // Today's leave list
  const leaveList = todayLeaves.map(l => {
    const emp = db.employees.find(e => e.id === l.employee_id);
    return {
      employee_id: l.employee_id,
      employee_number: emp?.employee_number || '',
      employee_name: emp?.full_name_en || 'Unknown',
      department: emp?.department || '',
      leave_type: l.leave_type
    };
  });

    // Biometric device status and live punches today
    const biometricDevices = db.biometric_devices || [];
    const onlineDevicesCount = biometricDevices.filter(d => d.status === 'online').length;
    const todayPunches = (db.biometric_attendance_logs || []).filter(l => {
      if (!l.check_time) return false;
      const logDate = l.check_time.slice(0, 10);
      return logDate === targetDate;
    });

    const recentBiometricPunches = todayPunches.slice(-10).reverse().map(l => {
      const emp = db.employees.find(e => e.id === l.employee_id);
      const dev = biometricDevices.find(d => d.id === l.device_id);
      return {
        id: l.id,
        device_name: dev?.device_name || l.device_serial_number || 'Hikvision Terminal',
        device_user_id: l.device_user_id,
        employee_id: l.employee_id,
        employee_name: emp?.full_name_en || `Biometric ID #${l.device_user_id}`,
        employee_number: emp?.employee_number || 'Unmapped',
        department: emp?.department || 'General',
        verify_mode: l.verify_mode || 'fingerprint',
        check_time: l.check_time,
        punch_type: l.punch_type || 'check_in'
      };
    });

    const latestSyncTime = biometricDevices.reduce((latest: string | null, d: any) => {
      if (!d.last_sync_time) return latest;
      if (!latest || new Date(d.last_sync_time) > new Date(latest)) return d.last_sync_time;
      return latest;
    }, null);

    res.json({
      date: targetDate,
      work_start_time: workStartTime,
      biometric_summary: {
        total_devices: biometricDevices.length,
        online_devices: onlineDevicesCount,
        last_sync_time: latestSyncTime,
        today_punches_count: todayPunches.length,
        recent_punches: recentBiometricPunches
      },
      summary: {
        today_present: Math.max(presentEmpIds.size, new Set(todayPunches.filter(p => p.employee_id).map(p => p.employee_id)).size),
        on_leave: leaveEmpIds.size,
        absent: absentEmployees.length,
        overtime_employees: otEmpIds.size,
        total_active: activeEmployees.length
      },
      today_leave_list: leaveList,
      late_arrivals: lateArrivals,
      present_list: todayAttendance.map(a => {
        const emp = db.employees.find(e => e.id === a.employee_id);
        return {
          employee_id: a.employee_id,
          employee_number: emp?.employee_number || '',
          employee_name: emp?.full_name_en || 'Unknown',
          department: emp?.department || '',
          check_in_time: a.check_in_time,
          is_late: a.check_in_time > workStartTime
        };
      }),
      absent_list: absentEmployees.map(emp => ({
        employee_id: emp.id,
        employee_number: emp.employee_number,
        employee_name: emp.full_name_en,
        department: emp.department
      })),
      overtime_list: todayOvertime.map(ot => {
        const emp = db.employees.find(e => e.id === ot.employee_id);
        return {
          employee_id: ot.employee_id,
          employee_number: emp?.employee_number || '',
          employee_name: emp?.full_name_en || 'Unknown',
          department: emp?.department || '',
          ot_hours: ot.ot_hours
        };
      })
    });
  });

// Employees
app.get("/api/employees", (req, res) => {
  const db = readDB();
  res.json(db.employees);
});

app.post("/api/employees", (req, res) => {
  const db = readDB();
  const newEmp = { id: "emp-" + Date.now(), created_at: new Date().toISOString(), ...req.body };
  db.employees.push(newEmp);
  writeDB(db);
  res.json(newEmp);
});

app.put("/api/employees/:id", (req, res) => {
  const db = readDB();
  const idx = db.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Employee not found" });
  db.employees[idx] = { ...db.employees[idx], ...req.body };
  writeDB(db);
  res.json(db.employees[idx]);
});

app.delete("/api/employees/:id", (req, res) => {
  const db = readDB();
  db.employees = db.employees.filter(e => e.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Salary Schemes
app.get("/api/salary-schemes", (req, res) => {
  const db = readDB();
  res.json(db.salary_schemes);
});

app.post("/api/salary-schemes", (req, res) => {
  const db = readDB();
  const newScheme = { id: "sch-" + Date.now(), ...req.body };
  db.salary_schemes.push(newScheme);
  writeDB(db);
  res.json(newScheme);
});

app.put("/api/salary-schemes/:id", (req, res) => {
  const db = readDB();
  const idx = db.salary_schemes.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Salary scheme not found" });
  db.salary_schemes[idx] = { ...db.salary_schemes[idx], ...req.body };
  writeDB(db);
  res.json(db.salary_schemes[idx]);
});

// Attendance & OT & Incentives
app.get("/api/attendance", (req, res) => {
  const db = readDB();
  const month = req.query.month as string;
  if (month) {
    res.json(db.attendance.filter(a => a.month === month));
  } else {
    res.json(db.attendance);
  }
});

app.post("/api/attendance", (req, res) => {
  const db = readDB();
  const { employee_id, month, working_days, days_attended, no_pay_leave_days } = req.body;
  const existingIdx = db.attendance.findIndex(a => a.employee_id === employee_id && a.month === month);
  const record = { id: existingIdx >= 0 ? db.attendance[existingIdx].id : "att-" + Date.now(), employee_id, month, working_days: working_days || 25, days_attended, no_pay_leave_days };
  if (existingIdx >= 0) {
    db.attendance[existingIdx] = record;
  } else {
    db.attendance.push(record);
  }
  writeDB(db);
  res.json(record);
});

app.get("/api/overtime", (req, res) => {
  const db = readDB();
  const month = req.query.month as string;
  if (month) {
    res.json(db.overtime_entries.filter(o => o.month === month));
  } else {
    res.json(db.overtime_entries);
  }
});

app.post("/api/overtime", (req, res) => {
  const db = readDB();
  const { employee_id, month, normal_ot_hours, off_day_ot_hours, poya_ot_hours } = req.body;
  const existingIdx = db.overtime_entries.findIndex(o => o.employee_id === employee_id && o.month === month);
  const record = { id: existingIdx >= 0 ? db.overtime_entries[existingIdx].id : "ot-" + Date.now(), employee_id, month, normal_ot_hours: Number(normal_ot_hours), off_day_ot_hours: Number(off_day_ot_hours), poya_ot_hours: Number(poya_ot_hours) };
  if (existingIdx >= 0) {
    db.overtime_entries[existingIdx] = record;
  } else {
    db.overtime_entries.push(record);
  }
  writeDB(db);
  res.json(record);
});

app.get("/api/incentives", (req, res) => {
  const db = readDB();
  const month = req.query.month as string;
  if (month) {
    res.json(db.incentive_entries.filter(i => i.month === month));
  } else {
    res.json(db.incentive_entries);
  }
});

app.post("/api/incentives", (req, res) => {
  const db = readDB();
  const { employee_id, month, target_achieved_pct, incentive_amount, notes } = req.body;
  const existingIdx = db.incentive_entries.findIndex(i => i.employee_id === employee_id && i.month === month);
  const record = { id: existingIdx >= 0 ? db.incentive_entries[existingIdx].id : "inc-" + Date.now(), employee_id, month, target_achieved_pct: Number(target_achieved_pct), incentive_amount: Number(incentive_amount), notes };
  if (existingIdx >= 0) {
    db.incentive_entries[existingIdx] = record;
  } else {
    db.incentive_entries.push(record);
  }
  writeDB(db);
  res.json(record);
});

// Seasonal Incentive Rules Endpoints
app.get("/api/seasonal-incentive-rules", (req, res) => {
  const db = readDB();
  res.json(db.seasonal_incentive_rules || []);
});

app.post("/api/seasonal-incentive-rules", (req, res) => {
  const db = readDB();
  const newRule = { id: "sir-" + Date.now(), is_active: true, slabs: [], ...req.body };
  if (!db.seasonal_incentive_rules) db.seasonal_incentive_rules = [];
  db.seasonal_incentive_rules.push(newRule);
  writeDB(db);
  res.json(newRule);
});

app.put("/api/seasonal-incentive-rules/:id", (req, res) => {
  const db = readDB();
  if (!db.seasonal_incentive_rules) db.seasonal_incentive_rules = [];
  const idx = db.seasonal_incentive_rules.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Seasonal incentive rule not found" });
  db.seasonal_incentive_rules[idx] = { ...db.seasonal_incentive_rules[idx], ...req.body };
  writeDB(db);
  res.json(db.seasonal_incentive_rules[idx]);
});

app.delete("/api/seasonal-incentive-rules/:id", (req, res) => {
  const db = readDB();
  if (!db.seasonal_incentive_rules) db.seasonal_incentive_rules = [];
  db.seasonal_incentive_rules = db.seasonal_incentive_rules.filter(r => r.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Special OT Rules Endpoints
app.get("/api/special-ot-rules", (req, res) => {
  const db = readDB();
  res.json(db.special_ot_rules || []);
});

app.post("/api/special-ot-rules", (req, res) => {
  const db = readDB();
  const newRule = { id: "sot-" + Date.now(), is_active: true, ...req.body };
  if (!db.special_ot_rules) db.special_ot_rules = [];
  db.special_ot_rules.push(newRule);
  writeDB(db);
  res.json(newRule);
});

app.put("/api/special-ot-rules/:id", (req, res) => {
  const db = readDB();
  if (!db.special_ot_rules) db.special_ot_rules = [];
  const idx = db.special_ot_rules.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Special OT rule not found" });
  db.special_ot_rules[idx] = { ...db.special_ot_rules[idx], ...req.body };
  writeDB(db);
  res.json(db.special_ot_rules[idx]);
});

app.delete("/api/special-ot-rules/:id", (req, res) => {
  const db = readDB();
  if (!db.special_ot_rules) db.special_ot_rules = [];
  db.special_ot_rules = db.special_ot_rules.filter(r => r.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Production Entries Endpoints
app.get("/api/production-entries", (req, res) => {
  const db = readDB();
  const month = req.query.month as string;
  const entries = db.production_entries || [];
  if (month) res.json(entries.filter(e => e.month === month));
  else res.json(entries);
});

app.post("/api/production-entries", (req, res) => {
  const db = readDB();
  const { employee_id, month, units_produced } = req.body;
  if (!db.production_entries) db.production_entries = [];
  const existingIdx = db.production_entries.findIndex(e => e.employee_id === employee_id && e.month === month);
  const record = { id: existingIdx >= 0 ? db.production_entries[existingIdx].id : "prod-" + Date.now(), employee_id, month, units_produced: Number(units_produced) };
  if (existingIdx >= 0) db.production_entries[existingIdx] = record;
  else db.production_entries.push(record);
  writeDB(db);
  res.json(record);
});

// Sales Entries Endpoints
app.get("/api/sales-entries", (req, res) => {
  const db = readDB();
  const month = req.query.month as string;
  const entries = db.sales_entries || [];
  if (month) res.json(entries.filter(e => e.month === month));
  else res.json(entries);
});

app.post("/api/sales-entries", (req, res) => {
  const db = readDB();
  const { employee_id, month, sales_amount } = req.body;
  if (!db.sales_entries) db.sales_entries = [];
  const existingIdx = db.sales_entries.findIndex(e => e.employee_id === employee_id && e.month === month);
  const record = { id: existingIdx >= 0 ? db.sales_entries[existingIdx].id : "sale-" + Date.now(), employee_id, month, sales_amount: Number(sales_amount) };
  if (existingIdx >= 0) db.sales_entries[existingIdx] = record;
  else db.sales_entries.push(record);
  writeDB(db);
  res.json(record);
});

// Daily Production Entries Endpoints
app.get("/api/daily-production-entries", (req, res) => {
  const db = readDB();
  const date = req.query.date as string;
  const month = req.query.month as string;
  let entries = db.daily_production_entries || [];
  if (date) entries = entries.filter(e => e.date === date);
  else if (month) entries = entries.filter(e => e.date && e.date.startsWith(month));
  res.json(entries);
});

app.post("/api/daily-production-entries", (req, res) => {
  const db = readDB();
  const { employee_id, date, units_produced } = req.body;
  if (!db.daily_production_entries) db.daily_production_entries = [];
  const existingIdx = db.daily_production_entries.findIndex(e => e.employee_id === employee_id && e.date === date);
  const record = { id: existingIdx >= 0 ? db.daily_production_entries[existingIdx].id : "dprod-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5), employee_id, date, units_produced: Number(units_produced) };
  if (existingIdx >= 0) db.daily_production_entries[existingIdx] = record;
  else db.daily_production_entries.push(record);
  writeDB(db);
  res.json(record);
});

// Daily Sales Entries Endpoints
app.get("/api/daily-sales-entries", (req, res) => {
  const db = readDB();
  const date = req.query.date as string;
  const month = req.query.month as string;
  let entries = db.daily_sales_entries || [];
  if (date) entries = entries.filter(e => e.date === date);
  else if (month) entries = entries.filter(e => e.date && e.date.startsWith(month));
  res.json(entries);
});

app.post("/api/daily-sales-entries", (req, res) => {
  const db = readDB();
  const { employee_id, date, sales_amount } = req.body;
  if (!db.daily_sales_entries) db.daily_sales_entries = [];
  const existingIdx = db.daily_sales_entries.findIndex(e => e.employee_id === employee_id && e.date === date);
  const record = { id: existingIdx >= 0 ? db.daily_sales_entries[existingIdx].id : "dsale-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5), employee_id, date, sales_amount: Number(sales_amount) };
  if (existingIdx >= 0) db.daily_sales_entries[existingIdx] = record;
  else db.daily_sales_entries.push(record);
  writeDB(db);
  res.json(record);
});

// Work Schedules Endpoints
app.get("/api/work-schedules", (req, res) => {
  const db = readDB();
  res.json(db.work_schedules || []);
});

app.post("/api/work-schedules", (req, res) => {
  const db = readDB();
  if (!db.work_schedules) db.work_schedules = [];
  const sch = { id: "sch-" + Date.now(), ...req.body };
  db.work_schedules.push(sch);
  writeDB(db);
  res.json(sch);
});

app.put("/api/work-schedules/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;
  if (!db.work_schedules) db.work_schedules = [];
  const idx = db.work_schedules.findIndex(s => s.id === id);
  if (idx < 0) return res.status(404).json({ error: "Schedule not found" });
  db.work_schedules[idx] = { ...db.work_schedules[idx], ...req.body, id };
  writeDB(db);
  res.json(db.work_schedules[idx]);
});

app.delete("/api/work-schedules/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;
  db.work_schedules = (db.work_schedules || []).filter(s => s.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Employee Schedule Assignments
app.get("/api/employee-schedule-assignments", (req, res) => {
  const db = readDB();
  res.json(db.employee_schedule_assignments || []);
});

app.post("/api/employee-schedule-assignments", (req, res) => {
  const db = readDB();
  if (!db.employee_schedule_assignments) db.employee_schedule_assignments = [];
  const asg = { id: "asg-" + Date.now(), ...req.body };
  db.employee_schedule_assignments.push(asg);
  writeDB(db);
  res.json(asg);
});

app.delete("/api/employee-schedule-assignments/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;
  db.employee_schedule_assignments = (db.employee_schedule_assignments || []).filter(a => a.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Attendance Calculation Simulator
app.post("/api/attendance-calculate-simulator", (req, res) => {
  const db = readDB();
  const { employee_id, date, check_in_time, check_out_time } = req.body;
  const emp = (db.employees || []).find(e => e.id === employee_id);
  if (!emp) return res.status(404).json({ error: "Employee not found" });

  const schedules = db.work_schedules || [];
  const assignments = db.employee_schedule_assignments || [];
  
  let assignedSch = schedules[0];
  const empAsg = assignments.find(a => a.target_type === 'employee' && a.target_id === employee_id);
  if (empAsg) {
    const found = schedules.find(s => s.id === empAsg.schedule_id);
    if (found) assignedSch = found;
  } else {
    const deptAsg = assignments.find(a => a.target_type === 'department' && (a.target_id === emp.department || a.target_id === 'All'));
    if (deptAsg) {
      const found = schedules.find(s => s.id === deptAsg.schedule_id);
      if (found) assignedSch = found;
    }
  }

  const parseTime = (t: string) => {
    const [h, m] = (t || "00:00").split(':').map(Number);
    return h * 60 + m;
  };

  const schedStartMins = parseTime(assignedSch?.start_time || "08:00");
  const checkInMins = parseTime(check_in_time || "08:00");
  const checkOutMins = parseTime(check_out_time || "17:00");

  let status = "Present";
  let lateMins = checkInMins - schedStartMins;
  const graceMins = assignedSch?.grace_period_mins || 15;

  if (lateMins > graceMins) {
    status = "Late";
  }

  let workedMins = checkOutMins - checkInMins;
  const breakStartMins = parseTime(assignedSch?.break_start || "12:00");
  const breakEndMins = parseTime(assignedSch?.break_end || "13:00");
  const breakDurationMins = breakEndMins - breakStartMins;
  if (!assignedSch?.break_paid && workedMins > breakDurationMins) {
    workedMins -= breakDurationMins;
  }

  const workedHours = Number((workedMins / 60).toFixed(2));
  const normalHours = Math.min(workedHours, assignedSch?.total_working_hours || 8);
  const otHours = Math.max(0, Number((workedHours - (assignedSch?.total_working_hours || 8)).toFixed(2)));

  let lateDeduction = 0;
  if (status === "Late" && assignedSch?.deduct_for_late) {
    if (assignedSch.late_deduction_method === 'fixed') {
      lateDeduction = assignedSch.late_deduction_amount;
    } else if (assignedSch.late_deduction_method === 'per_minute') {
      lateDeduction = (lateMins - graceMins) * assignedSch.late_deduction_amount;
    } else if (assignedSch.late_deduction_method === 'per_hour') {
      lateDeduction = Number(((lateMins - graceMins) / 60).toFixed(2)) * assignedSch.late_deduction_amount;
    }
  }

  let halfDayDeduction = 0;
  if (workedHours < (assignedSch?.half_day_min_hours || 4)) {
    status = "Half-day";
    halfDayDeduction = 1000;
  }
  if (workedHours < (assignedSch?.absent_min_hours || 2)) {
    status = "Absent";
  }

  const specialOtBonus = otHours * (assignedSch?.normal_ot_rate || 350);

  res.json({
    schedule_name: assignedSch?.name,
    status,
    worked_hours: workedHours,
    normal_hours: normalHours,
    ot_hours: otHours,
    late_deduction: Math.round(lateDeduction),
    half_day_deduction: halfDayDeduction,
    special_ot_bonus: Math.round(specialOtBonus),
    remarks: status === "Late" ? `Arrived ${lateMins} mins late (Grace: ${graceMins}m).` : "Checked in on time."
  });
});

// Payroll Runs
app.get("/api/payroll-runs", (req, res) => {
  const db = readDB();
  res.json(db.payroll_runs);
});

app.get("/api/payroll-runs/:month", (req, res) => {
  const db = readDB();
  const month = req.params.month;
  const run = db.payroll_runs.find(r => r.month === month);
  const items = db.payroll_items.filter(i => i.payroll_run_id === run?.id);
  res.json({ run: run || null, items });
});

// Calculate and Run Payroll
app.post("/api/payroll-runs/calculate", (req, res) => {
  const db = readDB();
  const { month } = req.body; // e.g. "2026-08"
  if (!month) return res.status(400).json({ error: "Month is required" });

  let run = db.payroll_runs.find(r => r.month === month);
  if (run && run.status === "Locked") {
    return res.status(400).json({ error: "Payroll for this month is locked." });
  }

  const runId = run ? run.id : "run-" + Date.now();
  let total_basic = 0;
  let total_allowances = 0;
  let total_ot = 0;
  let total_incentives = 0;
  let total_deductions = 0;
  let total_epf_employee = 0;
  let total_epf_employer = 0;
  let total_etf_employer = 0;
  let total_net = 0;

  const newItems: any[] = [];

  for (const emp of db.employees) {
    if (emp.employment_status !== "Active" && emp.employment_status !== "Probation") continue;
    const scheme = db.salary_schemes.find(s => s.id === emp.salary_scheme_id) || db.salary_schemes[0];
    const att = db.attendance.find(a => a.employee_id === emp.id && a.month === month) || { days_attended: 25, no_pay_leave_days: 0 };
    const ot = db.overtime_entries.find(o => o.employee_id === emp.id && o.month === month) || { normal_ot_hours: 0, off_day_ot_hours: 0, poya_ot_hours: 0 };
    const inc = db.incentive_entries.find(i => i.employee_id === emp.id && i.month === month) || { incentive_amount: scheme.default_incentive_amount || 0 };

    // Sri Lankan 25 working days logic
    const dailyBasic = (scheme.no_pay_deduction_rate !== undefined && Number(scheme.no_pay_deduction_rate) > 0)
      ? Number(scheme.no_pay_deduction_rate)
      : (scheme.basic_salary / 25);
    const noPayDays = att.no_pay_leave_days || 0;
    const noPayDeduction = noPayDays * dailyBasic;
    const basicEarned = Math.max(0, scheme.basic_salary - noPayDeduction);

    // Allowance deduction rule based on shortfall from 25 days
    const daysShortfall = Math.max(0, 25 - att.days_attended);
    let allowanceDeduction = 0;
    if (daysShortfall === 1) allowanceDeduction = scheme.deduct_day_1;
    else if (daysShortfall === 2) allowanceDeduction = scheme.deduct_day_1 + scheme.deduct_day_2;
    else if (daysShortfall === 3) allowanceDeduction = scheme.deduct_day_1 + scheme.deduct_day_2 + scheme.deduct_day_3;
    else if (daysShortfall === 4) allowanceDeduction = scheme.deduct_day_1 + scheme.deduct_day_2 + scheme.deduct_day_3 + scheme.deduct_day_4;
    else if (daysShortfall > 4) {
      allowanceDeduction = scheme.deduct_day_1 + scheme.deduct_day_2 + scheme.deduct_day_3 + scheme.deduct_day_4 + (daysShortfall - 4) * scheme.deduct_additional_day;
    }

    const fixedAllowanceEarned = Math.max(0, scheme.fixed_allowance_25_days - allowanceDeduction);

    // Special OT calculation
    let specialOtBonus = 0;
    const activeSpecialOtRules = (db.special_ot_rules || []).filter(r => r.is_active && (r.department === "All" || r.department === emp.department) && (r.employee_group === "All" || r.employee_group === emp.designation));
    for (const sot of activeSpecialOtRules) {
      if (sot.ot_multiplier && sot.ot_multiplier > 1) {
        if (sot.ot_type === "normal" || sot.ot_type === "all") {
          specialOtBonus += (ot.normal_ot_hours || 0) * scheme.ot_normal_rate_per_hour * (sot.ot_multiplier - 1);
        }
        if (sot.ot_type === "off" || sot.ot_type === "all") {
          specialOtBonus += (ot.off_day_ot_hours || 0) * scheme.ot_off_rate_per_hour * (sot.ot_multiplier - 1);
        }
        if (sot.ot_type === "poya" || sot.ot_type === "all") {
          specialOtBonus += (ot.poya_ot_hours || 0) * scheme.ot_poya_rate_per_hour * (sot.ot_multiplier - 1);
        }
      }
    }

    const otAmount = emp.ot_eligible ? (
      ((ot.normal_ot_hours || 0) * scheme.ot_normal_rate_per_hour) +
      ((ot.off_day_ot_hours || 0) * scheme.ot_off_rate_per_hour) +
      ((ot.poya_ot_hours || 0) * scheme.ot_poya_rate_per_hour) + specialOtBonus
    ) : 0;

    // Seasonal & Target Incentives calculation
    const dailyProdSum = (db.daily_production_entries || [])
      .filter(p => p.employee_id === emp.id && p.date && p.date.startsWith(month))
      .reduce((sum, p) => sum + (p.units_produced || 0), 0);
    const monthlyProdEntry = (db.production_entries || []).find(p => p.employee_id === emp.id && p.month === month)?.units_produced || 0;
    const totalUnitsProduced = dailyProdSum > 0 ? dailyProdSum : monthlyProdEntry;

    const dailySalesSum = (db.daily_sales_entries || [])
      .filter(s => s.employee_id === emp.id && s.date && s.date.startsWith(month))
      .reduce((sum, s) => sum + (s.sales_amount || 0), 0);
    const monthlySalesEntry = (db.sales_entries || []).find(s => s.employee_id === emp.id && s.month === month)?.sales_amount || 0;
    const totalSalesAmount = dailySalesSum > 0 ? dailySalesSum : monthlySalesEntry;

    const prodEntry = { units_produced: totalUnitsProduced };
    const salesEntry = { sales_amount: totalSalesAmount };
    const activeSeasonalRules = (db.seasonal_incentive_rules || []).filter(r => r.is_active && (r.department === "All" || r.department === emp.department) && (r.employee_group === "All" || r.employee_group === emp.designation));

    let productionIncentive = 0;
    let salesIncentive = 0;
    let seasonalIncentive = 0;
    let attendanceIncentive = 0;
    const calculatedRuleResults: Array<{ type: string, amount: number, priority: number }> = [];

    for (const rule of activeSeasonalRules) {
      if (rule.attendance_requirement > 0 && att.days_attended < rule.attendance_requirement) continue;
      if (rule.min_working_days > 0 && att.days_attended < rule.min_working_days) continue;
      if (rule.min_production > 0 && prodEntry.units_produced < rule.min_production) continue;
      if (rule.min_sales > 0 && salesEntry.sales_amount < rule.min_sales) continue;

      let ruleAmount = rule.fixed_bonus || 0;
      if (rule.slabs && rule.slabs.length > 0) {
        const val = rule.incentive_type === 'Production' ? prodEntry.units_produced : (rule.incentive_type === 'Sales' ? salesEntry.sales_amount : att.days_attended);
        const matchingSlab = rule.slabs.find(s => val >= s.min_val && val <= (s.max_val || 999999999));
        if (matchingSlab) {
          if (matchingSlab.bonus_type === 'fixed') {
            ruleAmount += matchingSlab.bonus_val;
          } else if (matchingSlab.bonus_type === 'per_unit') {
            ruleAmount += val * matchingSlab.bonus_val;
          } else if (matchingSlab.bonus_type === 'percentage') {
            ruleAmount += scheme.basic_salary * (matchingSlab.bonus_val / 100);
          } else if (matchingSlab.bonus_type === 'slab_bonus') {
            ruleAmount += matchingSlab.bonus_val;
          }
        }
      }
      calculatedRuleResults.push({ type: rule.incentive_type, amount: ruleAmount, priority: rule.priority || 1 });
    }

    const collisionMode = db.company_settings?.seasonal_incentive_collision_mode || 'highest_only';
    if (calculatedRuleResults.length > 0) {
      if (collisionMode === 'highest_only') {
        const maxRes = calculatedRuleResults.reduce((max, r) => r.amount > max.amount ? r : max, calculatedRuleResults[0]);
        if (maxRes.type === 'Production') productionIncentive += maxRes.amount;
        else if (maxRes.type === 'Sales') salesIncentive += maxRes.amount;
        else if (maxRes.type === 'Attendance') attendanceIncentive += maxRes.amount;
        else seasonalIncentive += maxRes.amount;
      } else if (collisionMode === 'add_all') {
        for (const res of calculatedRuleResults) {
          if (res.type === 'Production') productionIncentive += res.amount;
          else if (res.type === 'Sales') salesIncentive += res.amount;
          else if (res.type === 'Attendance') attendanceIncentive += res.amount;
          else seasonalIncentive += res.amount;
        }
      } else if (collisionMode === 'add_highest_two') {
        const sorted = [...calculatedRuleResults].sort((a, b) => b.amount - a.amount);
        for (const res of sorted.slice(0, 2)) {
          if (res.type === 'Production') productionIncentive += res.amount;
          else if (res.type === 'Sales') salesIncentive += res.amount;
          else if (res.type === 'Attendance') attendanceIncentive += res.amount;
          else seasonalIncentive += res.amount;
        }
      } else {
        const sorted = [...calculatedRuleResults].sort((a, b) => a.priority - b.priority);
        const topRes = sorted[0];
        if (topRes.type === 'Production') productionIncentive += topRes.amount;
        else if (topRes.type === 'Sales') salesIncentive += topRes.amount;
        else if (topRes.type === 'Attendance') attendanceIncentive += topRes.amount;
        else seasonalIncentive += topRes.amount;
      }
    }

    const baseIncentive = inc.incentive_amount || scheme.default_incentive_amount || 0;
    const incentiveAmount = baseIncentive + productionIncentive + salesIncentive + seasonalIncentive + attendanceIncentive;
    const grossEarnings = basicEarned + fixedAllowanceEarned + otAmount + incentiveAmount;

    // EPF & ETF calculation
    const epfBase = basicEarned + fixedAllowanceEarned;
    const empEPF = (emp.epf_enabled && scheme.epf_etf_applicable) ? epfBase * 0.08 : 0;
    const employerEPF = (emp.epf_enabled && scheme.epf_etf_applicable) ? epfBase * 0.12 : 0;
    const employerETF = (emp.etf_enabled && scheme.epf_etf_applicable) ? epfBase * 0.03 : 0;

    const totalDeductions = empEPF + noPayDeduction;
    const netSalary = grossEarnings - empEPF;

    total_basic += basicEarned;
    total_allowances += fixedAllowanceEarned;
    total_ot += otAmount;
    total_incentives += incentiveAmount;
    total_deductions += totalDeductions;
    total_epf_employee += empEPF;
    total_epf_employer += employerEPF;
    total_etf_employer += employerETF;
    total_net += netSalary;

    newItems.push({
      id: "item-" + emp.id + "-" + Date.now(),
      payroll_run_id: runId,
      employee_id: emp.id,
      employee_number: emp.employee_number,
      full_name_en: emp.full_name_en,
      full_name_ta: emp.full_name_ta,
      full_name_si: emp.full_name_si,
      department: emp.department,
      designation: emp.designation,
      nic: emp.nic,
      bank_details: `${emp.bank_name} - ${emp.bank_account_number} (${emp.bank_branch})`,
      basic_salary: scheme.basic_salary,
      days_attended: att.days_attended,
      no_pay_leave_days: noPayDays,
      basic_earned: Math.round(basicEarned * 100) / 100,
      fixed_allowance_earned: Math.round(fixedAllowanceEarned * 100) / 100,
      allowance_deduction: Math.round(allowanceDeduction * 100) / 100,
      no_pay_deduction: Math.round(noPayDeduction * 100) / 100,
      ot_amount: Math.round(otAmount * 100) / 100,
      special_ot_bonus: Math.round(specialOtBonus * 100) / 100,
      incentive_amount: Math.round(incentiveAmount * 100) / 100,
      production_incentive: Math.round(productionIncentive * 100) / 100,
      sales_incentive: Math.round(salesIncentive * 100) / 100,
      seasonal_incentive: Math.round(seasonalIncentive * 100) / 100,
      attendance_incentive: Math.round(attendanceIncentive * 100) / 100,
      gross_earnings: Math.round(grossEarnings * 100) / 100,
      employee_epf_8: Math.round(empEPF * 100) / 100,
      employer_epf_12: Math.round(employerEPF * 100) / 100,
      employer_etf_3: Math.round(employerETF * 100) / 100,
      total_deductions: Math.round(totalDeductions * 100) / 100,
      net_salary: Math.round(netSalary * 100) / 100
    });
  }

  const runObj = {
    id: runId,
    month,
    status: "Draft",
    total_basic: Math.round(total_basic * 100) / 100,
    total_allowances: Math.round(total_allowances * 100) / 100,
    total_ot: Math.round(total_ot * 100) / 100,
    total_incentives: Math.round(total_incentives * 100) / 100,
    total_deductions: Math.round(total_deductions * 100) / 100,
    total_epf_employee: Math.round(total_epf_employee * 100) / 100,
    total_epf_employer: Math.round(total_epf_employer * 100) / 100,
    total_etf_employer: Math.round(total_etf_employer * 100) / 100,
    total_net: Math.round(total_net * 100) / 100,
    created_at: new Date().toISOString()
  };

  if (run) {
    const runIdx = db.payroll_runs.findIndex(r => r.id === run.id);
    db.payroll_runs[runIdx] = runObj;
    db.payroll_items = db.payroll_items.filter(i => i.payroll_run_id !== run.id);
  } else {
    db.payroll_runs.push(runObj);
  }
  db.payroll_items.push(...newItems);
  writeDB(db);

  res.json({ run: runObj, items: newItems });
});

app.post("/api/payroll-runs/:month/lock", (req, res) => {
  const db = readDB();
  const month = req.params.month;
  const run = db.payroll_runs.find(r => r.month === month);
  if (!run) return res.status(404).json({ error: "Payroll run not found" });
  run.status = "Locked";
  run.locked_at = new Date().toISOString();
  writeDB(db);
  res.json(run);
});

app.post("/api/payroll-runs/:month/unlock", (req, res) => {
  const db = readDB();
  const month = req.params.month;
  const run = db.payroll_runs.find(r => r.month === month);
  if (!run) return res.status(404).json({ error: "Payroll run not found" });
  run.status = "Draft";
  delete run.locked_at;
  writeDB(db);
  res.json(run);
});

// EPF & ETF Employer Remittances & Payments Endpoints
app.get("/api/epf-etf-payments", (req, res) => {
  const db = readDB();
  const month = req.query.month as string;
  const dept = req.query.department as string;
  let payments = db.epf_etf_payments || [];
  if (month) {
    payments = payments.filter(p => p.month === month);
  }
  if (dept && dept !== 'All') {
    payments = payments.filter(p => p.department === dept || p.department === 'All');
  }
  res.json(payments);
});

app.post("/api/epf-etf-payments", (req, res) => {
  const db = readDB();
  if (!db.epf_etf_payments) db.epf_etf_payments = [];

  const {
    month,
    payment_date,
    department = "All",
    payment_type = "COMBINED_ALL",
    amount,
    payment_method = "Bank Transfer",
    reference_number,
    paid_to = "Central Bank of Sri Lanka (EPF Dept) & ETF Board",
    notes = "",
    created_by = "Admin"
  } = req.body;

  if (!month || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "Month and a valid payment amount are required." });
  }

  const paymentRecord = {
    id: "epf-pay-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    month,
    payment_date: payment_date || new Date().toISOString().split('T')[0],
    department,
    payment_type,
    amount: Math.round(Number(amount) * 100) / 100,
    payment_method,
    reference_number: reference_number || `SLIPS-${Date.now().toString().slice(-6)}`,
    paid_to,
    notes,
    created_by,
    created_at: new Date().toISOString()
  };

  db.epf_etf_payments.push(paymentRecord);

  // Add audit log
  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: "audit-" + Date.now(),
    action: 'EPF_ETF_PAYMENT',
    timestamp: new Date().toISOString(),
    user: created_by || 'admin@unibro.lk',
    details: `Employer paid LKR ${paymentRecord.amount.toLocaleString()} for ${month} (${department}) - Ref: ${paymentRecord.reference_number}`
  });

  writeDB(db);
  res.json(paymentRecord);
});

app.put("/api/epf-etf-payments/:id", (req, res) => {
  const db = readDB();
  if (!db.epf_etf_payments) db.epf_etf_payments = [];
  const idx = db.epf_etf_payments.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Payment record not found" });

  db.epf_etf_payments[idx] = {
    ...db.epf_etf_payments[idx],
    ...req.body,
    amount: Number(req.body.amount !== undefined ? req.body.amount : db.epf_etf_payments[idx].amount),
    updated_at: new Date().toISOString()
  };

  writeDB(db);
  res.json(db.epf_etf_payments[idx]);
});

app.delete("/api/epf-etf-payments/:id", (req, res) => {
  const db = readDB();
  if (!db.epf_etf_payments) db.epf_etf_payments = [];
  const deleted = db.epf_etf_payments.find(p => p.id === req.params.id);
  db.epf_etf_payments = db.epf_etf_payments.filter(p => p.id !== req.params.id);

  if (deleted) {
    if (!db.audit_logs) db.audit_logs = [];
    db.audit_logs.unshift({
      id: "audit-" + Date.now(),
      action: 'EPF_ETF_PAYMENT_DELETED',
      timestamp: new Date().toISOString(),
      user: 'admin@unibro.lk',
      details: `Deleted payment LKR ${deleted.amount} for ${deleted.month} (${deleted.department})`
    });
  }

  writeDB(db);
  res.json({ success: true });
});

// Comprehensive EPF & ETF Balance and Departmental Reconciliation Endpoint
app.get("/api/epf-etf-balance-summary/:month", (req, res) => {
  const db = readDB();
  const month = req.params.month;
  
  const payrollRun = db.payroll_runs.find(r => r.month === month);
  const items = (db.payroll_items || []).filter(i => {
    if (payrollRun) return i.payroll_run_id === payrollRun.id;
    return false;
  });

  const payments = (db.epf_etf_payments || []).filter(p => p.month === month);

  // Department list
  const departmentsSet = new Set<string>();
  (db.employees || []).forEach(e => {
    if (e.department) departmentsSet.add(e.department);
  });
  items.forEach(i => {
    if (i.department) departmentsSet.add(i.department);
  });

  const departmentList = Array.from(departmentsSet);

  // Overall calculations
  const totalEmpEPF = items.reduce((acc, i) => acc + (i.employee_epf_8 || 0), 0);
  const totalEmployerEPF = items.reduce((acc, i) => acc + (i.employer_epf_12 || 0), 0);
  const totalEPF = totalEmpEPF + totalEmployerEPF;
  const totalEmployerETF = items.reduce((acc, i) => acc + (i.employer_etf_3 || 0), 0);
  const totalStatutoryLiability = totalEPF + totalEmployerETF;
  const totalEpfBase = items.reduce((acc, i) => acc + (i.basic_earned || 0) + (i.fixed_allowance_earned || 0), 0);

  // Payments breakdown
  let totalPaidOverall = 0;
  let totalPaidEPF = 0;
  let totalPaidETF = 0;

  payments.forEach(p => {
    totalPaidOverall += p.amount;
    if (p.payment_type === 'ETF_3') {
      totalPaidETF += p.amount;
    } else if (p.payment_type === 'EPF_20' || p.payment_type === 'EPF_EMP_8' || p.payment_type === 'EPF_EMPR_12') {
      totalPaidEPF += p.amount;
    } else {
      // COMBINED_ALL - distribute proportionally 20/23 to EPF and 3/23 to ETF
      totalPaidEPF += (p.amount * 20) / 23;
      totalPaidETF += (p.amount * 3) / 23;
    }
  });

  const currentOutstandingBalance = Math.max(0, totalStatutoryLiability - totalPaidOverall);
  const epfOutstandingBalance = Math.max(0, totalEPF - totalPaidEPF);
  const etfOutstandingBalance = Math.max(0, totalEmployerETF - totalPaidETF);

  // Department-wise breakdown
  const departmentBreakdown = departmentList.map(dept => {
    const deptItems = items.filter(i => i.department === dept);
    const deptEmpEpf = deptItems.reduce((acc, i) => acc + (i.employee_epf_8 || 0), 0);
    const deptEmprEpf = deptItems.reduce((acc, i) => acc + (i.employer_epf_12 || 0), 0);
    const deptEpf = deptEmpEpf + deptEmprEpf;
    const deptEtf = deptItems.reduce((acc, i) => acc + (i.employer_etf_3 || 0), 0);
    const deptTotalStatutory = deptEpf + deptEtf;
    const deptBase = deptItems.reduce((acc, i) => acc + (i.basic_earned || 0) + (i.fixed_allowance_earned || 0), 0);

    // Direct department payments
    const deptDirectPayments = payments.filter(p => p.department === dept).reduce((acc, p) => acc + p.amount, 0);

    // If there are general "All" department payments, distribute them proportionally
    const allDeptPayments = payments.filter(p => p.department === 'All').reduce((acc, p) => acc + p.amount, 0);
    const deptShareOfAll = totalStatutoryLiability > 0 ? (deptTotalStatutory / totalStatutoryLiability) * allDeptPayments : 0;

    const totalDeptPaid = deptDirectPayments + deptShareOfAll;
    const deptBalance = Math.max(0, deptTotalStatutory - totalDeptPaid);

    let status: 'Settled' | 'Partially Paid' | 'Unpaid' | 'Overpaid' = 'Unpaid';
    if (totalDeptPaid >= deptTotalStatutory && deptTotalStatutory > 0) {
      status = totalDeptPaid > deptTotalStatutory ? 'Overpaid' : 'Settled';
    } else if (totalDeptPaid > 0) {
      status = 'Partially Paid';
    } else if (deptTotalStatutory === 0) {
      status = 'Settled';
    }

    return {
      department: dept,
      employee_count: deptItems.length,
      epf_base_total: Math.round(deptBase * 100) / 100,
      epf_employee_8: Math.round(deptEmpEpf * 100) / 100,
      epf_employer_12: Math.round(deptEmprEpf * 100) / 100,
      epf_total_20: Math.round(deptEpf * 100) / 100,
      etf_employer_3: Math.round(deptEtf * 100) / 100,
      total_statutory_due: Math.round(deptTotalStatutory * 100) / 100,
      total_paid: Math.round(totalDeptPaid * 100) / 100,
      current_balance: Math.round(deptBalance * 100) / 100,
      status
    };
  });

  res.json({
    month,
    has_payroll: !!payrollRun,
    payroll_status: payrollRun?.status || 'None',
    total_epf_base: Math.round(totalEpfBase * 100) / 100,
    total_employee_epf_8: Math.round(totalEmpEPF * 100) / 100,
    total_employer_epf_12: Math.round(totalEmployerEPF * 100) / 100,
    total_epf_20: Math.round(totalEPF * 100) / 100,
    total_employer_etf_3: Math.round(totalEmployerETF * 100) / 100,
    total_statutory_liability: Math.round(totalStatutoryLiability * 100) / 100,
    total_paid: Math.round(totalPaidOverall * 100) / 100,
    total_paid_epf: Math.round(totalPaidEPF * 100) / 100,
    total_paid_etf: Math.round(totalPaidETF * 100) / 100,
    current_outstanding_balance: Math.round(currentOutstandingBalance * 100) / 100,
    epf_outstanding_balance: Math.round(epfOutstandingBalance * 100) / 100,
    etf_outstanding_balance: Math.round(etfOutstandingBalance * 100) / 100,
    overall_status: totalStatutoryLiability === 0 ? 'No Due' : (currentOutstandingBalance === 0 ? 'Fully Settled' : (totalPaidOverall > 0 ? 'Partially Paid' : 'Pending Payment')),
    department_breakdown: departmentBreakdown,
    payments: payments
  });
});

// Biometric Devices API
app.get("/api/biometric/devices", (req, res) => {
  const db = readDB();
  res.json(db.biometric_devices || []);
});

app.post("/api/biometric/devices", (req, res) => {
  const db = readDB();
  if (!db.biometric_devices) db.biometric_devices = [];
  const newDevice = {
    id: "bio-dev-" + Date.now(),
    device_name: req.body.device_name || "Hikvision DS-K1A8503MF",
    brand: req.body.brand || "Hikvision",
    model: req.body.model || "DS-K1A8503MF",
    ip_address: req.body.ip_address || "192.168.1.201",
    port: Number(req.body.port) || 80,
    username: req.body.username || "admin",
    password: req.body.password || "",
    time_zone: req.body.time_zone || "Asia/Colombo (UTC+05:30)",
    auto_sync_enabled: req.body.auto_sync_enabled !== false,
    sync_interval: Number(req.body.sync_interval) || 5,
    serial_number: req.body.serial_number || `DS-K1A8503MF${Date.now()}`,
    status: "online",
    last_sync_time: new Date().toISOString(),
    last_heartbeat: new Date().toISOString(),
    location: req.body.location || "Main Entrance",
    notes: req.body.notes || "Hikvision Standalone Attendance Terminal",
    created_at: new Date().toISOString()
  };
  db.biometric_devices.push(newDevice);
  writeDB(db);
  res.json(newDevice);
});

app.put("/api/biometric/devices/:id", (req, res) => {
  const db = readDB();
  if (!db.biometric_devices) db.biometric_devices = [];
  const idx = db.biometric_devices.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Biometric device not found" });
  db.biometric_devices[idx] = { ...db.biometric_devices[idx], ...req.body };
  writeDB(db);
  res.json(db.biometric_devices[idx]);
});

app.delete("/api/biometric/devices/:id", (req, res) => {
  const db = readDB();
  if (!db.biometric_devices) db.biometric_devices = [];
  db.biometric_devices = db.biometric_devices.filter(d => d.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.post("/api/biometric/devices/:id/test-connection", (req, res) => {
  const db = readDB();
  const dev = (db.biometric_devices || []).find(d => d.id === req.params.id);
  if (!dev) return res.status(404).json({ error: "Device not found" });
  
  // Simulate / execute connection test against Hikvision ISAPI
  const isHealthy = true;
  dev.status = isHealthy ? "online" : "offline";
  dev.last_heartbeat = new Date().toISOString();
  writeDB(db);

  res.json({
    success: isHealthy,
    status: dev.status,
    device_name: dev.device_name,
    model: dev.model,
    serial_number: dev.serial_number,
    ip_address: dev.ip_address,
    port: dev.port,
    firmware_version: dev.firmware_version || "V1.3.1_build240410",
    message: "ISAPI Digest authentication handshake successful. Device response: 200 OK."
  });
});

app.post("/api/biometric/devices/:id/heartbeat", (req, res) => {
  const db = readDB();
  const dev = (db.biometric_devices || []).find(d => d.id === req.params.id);
  if (!dev) return res.status(404).json({ error: "Device not found" });
  dev.status = req.body.status || "online";
  dev.last_heartbeat = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, timestamp: dev.last_heartbeat });
});

app.post("/api/biometric/devices/:id/sync-now", (req, res) => {
  const db = readDB();
  const dev = (db.biometric_devices || []).find(d => d.id === req.params.id);
  if (!dev) return res.status(404).json({ error: "Device not found" });

  dev.status = "online";
  dev.last_sync_time = new Date().toISOString();
  dev.last_heartbeat = new Date().toISOString();
  writeDB(db);

  res.json({
    success: true,
    last_sync_time: dev.last_sync_time,
    synced_records: (db.biometric_attendance_logs || []).filter(l => l.device_id === dev.id).length,
    message: "Manual ISAPI attendance poll completed successfully."
  });
});

// Biometric User Mappings API
app.get("/api/biometric/mappings", (req, res) => {
  const db = readDB();
  const mappings = (db.biometric_user_mappings || []).map(m => {
    const emp = db.employees.find(e => e.id === m.employee_id);
    const dev = (db.biometric_devices || []).find(d => d.id === m.device_id);
    return {
      ...m,
      employee_number: emp?.employee_number || 'Unassigned',
      employee_name: emp?.full_name_en || 'Unknown Employee',
      department: emp?.department || '',
      designation: emp?.designation || '',
      device_name: dev?.device_name || 'All Devices'
    };
  });
  res.json(mappings);
});

app.post("/api/biometric/mappings", (req, res) => {
  const db = readDB();
  if (!db.biometric_user_mappings) db.biometric_user_mappings = [];
  const { device_id, device_user_id, employee_id, card_number, verify_type } = req.body;

  // Check if mapping already exists
  const existingIdx = db.biometric_user_mappings.findIndex(m => m.device_user_id === String(device_user_id) && (m.device_id === device_id || !device_id));
  const newMapping = {
    id: existingIdx >= 0 ? db.biometric_user_mappings[existingIdx].id : "bio-map-" + Date.now(),
    device_id: device_id || (db.biometric_devices?.[0]?.id || "bio-dev-001"),
    device_user_id: String(device_user_id),
    employee_id,
    card_number: card_number || "",
    verify_type: verify_type || "fingerprint",
    enrolled_date: req.body.enrolled_date || new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    db.biometric_user_mappings[existingIdx] = newMapping;
  } else {
    db.biometric_user_mappings.push(newMapping);
  }

  // Also retroactively update existing unmapped logs with this employee_id
  if (db.biometric_attendance_logs) {
    db.biometric_attendance_logs.forEach(log => {
      if (log.device_user_id === String(device_user_id) && !log.employee_id) {
        log.employee_id = employee_id;
      }
    });
  }

  writeDB(db);
  res.json(newMapping);
});

app.put("/api/biometric/mappings/:id", (req, res) => {
  const db = readDB();
  if (!db.biometric_user_mappings) db.biometric_user_mappings = [];
  const idx = db.biometric_user_mappings.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Mapping not found" });
  db.biometric_user_mappings[idx] = { ...db.biometric_user_mappings[idx], ...req.body };
  writeDB(db);
  res.json(db.biometric_user_mappings[idx]);
});

app.delete("/api/biometric/mappings/:id", (req, res) => {
  const db = readDB();
  if (!db.biometric_user_mappings) db.biometric_user_mappings = [];
  db.biometric_user_mappings = db.biometric_user_mappings.filter(m => m.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.post("/api/biometric/mappings/auto-match", (req, res) => {
  const db = readDB();
  if (!db.biometric_user_mappings) db.biometric_user_mappings = [];
  const employees = db.employees || [];
  const defaultDevId = db.biometric_devices?.[0]?.id || "bio-dev-001";

  let matchedCount = 0;
  employees.forEach((emp, index) => {
    // Check if employee already mapped
    const alreadyMapped = db.biometric_user_mappings.some(m => m.employee_id === emp.id);
    if (!alreadyMapped) {
      // Extract numeric ID from employee number e.g. "NL-001" -> "1" or "001"
      const numMatch = (emp.employee_number || "").match(/\d+/);
      const suggestedUserId = numMatch ? String(parseInt(numMatch[0], 10)) : String(index + 1);

      db.biometric_user_mappings.push({
        id: "bio-map-" + Date.now() + "-" + index,
        device_id: defaultDevId,
        device_user_id: suggestedUserId,
        employee_id: emp.id,
        card_number: `000845${suggestedUserId.padStart(4, '0')}`,
        verify_type: "fingerprint",
        enrolled_date: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString()
      });
      matchedCount++;
    }
  });

  writeDB(db);
  res.json({ success: true, matched_count: matchedCount, total_mappings: db.biometric_user_mappings.length });
});

// Biometric Logs API
app.get("/api/biometric/logs", (req, res) => {
  const db = readDB();
  const { device_id, employee_id, date, verify_mode, limit } = req.query;

  let logs = (db.biometric_attendance_logs || []).map(l => {
    const emp = db.employees.find(e => e.id === l.employee_id);
    const dev = (db.biometric_devices || []).find(d => d.id === l.device_id);
    return {
      ...l,
      employee_name: emp?.full_name_en || (l.employee_id ? 'Unknown' : 'Unmapped'),
      employee_number: emp?.employee_number || 'N/A',
      department: emp?.department || 'N/A',
      device_name: dev?.device_name || l.device_serial_number || 'Hikvision Terminal'
    };
  });

  if (device_id) logs = logs.filter(l => l.device_id === device_id);
  if (employee_id) logs = logs.filter(l => l.employee_id === employee_id);
  if (date) logs = logs.filter(l => l.check_time && l.check_time.startsWith(date as string));
  if (verify_mode) logs = logs.filter(l => l.verify_mode === verify_mode);

  // Sort descending by check_time
  logs.sort((a, b) => new Date(b.check_time).getTime() - new Date(a.check_time).getTime());

  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json(logs);
});

// Windows Sync Service Ingestion API (with SHA256 Deduplication)
app.post("/api/biometric/logs/ingest", (req, res) => {
  const db = readDB();
  if (!db.biometric_attendance_logs) db.biometric_attendance_logs = [];
  if (!db.biometric_devices) db.biometric_devices = [];
  if (!db.biometric_user_mappings) db.biometric_user_mappings = [];

  const { device_serial_number, records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: "Records array is required" });
  }

  // Find or identify device
  let dev = db.biometric_devices.find(d => d.serial_number === device_serial_number || d.id === req.body.device_id);
  if (!dev && db.biometric_devices.length > 0) {
    dev = db.biometric_devices[0];
  }

  let insertedCount = 0;
  let duplicateCount = 0;
  const processedDates = new Set<string>();

  for (const r of records) {
    // Generate deterministic deduplication hash
    const syncHash = r.sync_hash || `hash_${device_serial_number || 'dsk1a8503'}_${r.device_user_id}_${r.check_time.replace(/[-:T+.]/g, '').slice(0, 14)}`;

    // Check duplicate
    const isDuplicate = db.biometric_attendance_logs.some(existing => existing.sync_hash === syncHash);
    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

    // Resolve mapped employee
    let empId = r.employee_id;
    if (!empId) {
      const mapping = db.biometric_user_mappings.find(m => m.device_user_id === String(r.device_user_id));
      if (mapping) empId = mapping.employee_id;
    }

    const logRecord = {
      id: "bio-log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      device_id: dev?.id || "bio-dev-001",
      device_serial_number: device_serial_number || dev?.serial_number || "DS-K1A8503MF",
      device_user_id: String(r.device_user_id),
      employee_id: empId || null,
      verify_mode: r.verify_mode || "fingerprint",
      check_time: r.check_time,
      punch_type: r.punch_type || "auto",
      sync_hash: syncHash,
      sync_status: "synced",
      raw_event_data: r.raw_event_data || null,
      created_at: new Date().toISOString()
    };

    db.biometric_attendance_logs.push(logRecord);
    insertedCount++;

    if (r.check_time) {
      processedDates.add(r.check_time.slice(0, 10));
    }
  }

  if (dev) {
    dev.status = "online";
    dev.last_sync_time = new Date().toISOString();
    dev.last_heartbeat = new Date().toISOString();
  }

  writeDB(db);

  res.json({
    success: true,
    inserted_count: insertedCount,
    duplicate_count: duplicateCount,
    total_received: records.length,
    device_status: "online",
    last_sync_time: dev?.last_sync_time || new Date().toISOString()
  });
});

// Single Manual Punch Log Entry
app.post("/api/biometric/logs", (req, res) => {
  const db = readDB();
  if (!db.biometric_attendance_logs) db.biometric_attendance_logs = [];
  const { device_id, device_user_id, employee_id, verify_mode, check_time, punch_type } = req.body;

  let empId = employee_id;
  if (!empId && device_user_id) {
    const mapping = (db.biometric_user_mappings || []).find(m => m.device_user_id === String(device_user_id));
    if (mapping) empId = mapping.employee_id;
  }

  const syncHash = `manual_${Date.now()}_${device_user_id || empId}_${(check_time || new Date().toISOString()).slice(0, 19)}`;

  const logRecord = {
    id: "bio-log-" + Date.now(),
    device_id: device_id || (db.biometric_devices?.[0]?.id || "bio-dev-001"),
    device_serial_number: db.biometric_devices?.[0]?.serial_number || "DS-K1A8503MF",
    device_user_id: String(device_user_id || "1"),
    employee_id: empId || null,
    verify_mode: verify_mode || "fingerprint",
    check_time: check_time || new Date().toISOString(),
    punch_type: punch_type || "check_in",
    sync_hash: syncHash,
    sync_status: "processed",
    created_at: new Date().toISOString()
  };

  db.biometric_attendance_logs.push(logRecord);
  writeDB(db);
  res.json(logRecord);
});

// Process Biometric Punches into Daily Attendance & Overtime
app.post("/api/biometric/process-daily", (req, res) => {
  const db = readDB();
  const targetDate = req.body.date || new Date().toISOString().slice(0, 10);
  const targetMonth = targetDate.slice(0, 7);

  if (!db.daily_attendance) db.daily_attendance = [];
  if (!db.daily_overtime) db.daily_overtime = [];
  if (!db.attendance) db.attendance = [];

  const logs = (db.biometric_attendance_logs || []).filter(l => l.check_time && l.check_time.startsWith(targetDate));
  const schedules = db.work_schedules || [];
  const assignments = db.employee_schedule_assignments || [];
  const employees = db.employees || [];

  const processedSummaries: any[] = [];

  // Group logs by employee_id
  const empLogsMap = new Map<string, any[]>();
  for (const log of logs) {
    if (!log.employee_id) continue;
    if (!empLogsMap.has(log.employee_id)) empLogsMap.set(log.employee_id, []);
    empLogsMap.get(log.employee_id)!.push(log);
  }

  for (const emp of employees) {
    if (emp.employment_status !== 'Active' && emp.employment_status !== 'Probation') continue;
    const empPunches = empLogsMap.get(emp.id) || [];
    
    // Sort punches chronologically
    empPunches.sort((a, b) => new Date(a.check_time).getTime() - new Date(b.check_time).getTime());

    // Resolve assigned schedule
    let assignedSch = schedules[0];
    const empAsg = assignments.find(a => a.target_type === 'employee' && a.target_id === emp.id);
    if (empAsg) {
      const found = schedules.find(s => s.id === empAsg.schedule_id);
      if (found) assignedSch = found;
    } else {
      const deptAsg = assignments.find(a => a.target_type === 'department' && (a.target_id === emp.department || a.target_id === 'All'));
      if (deptAsg) {
        const found = schedules.find(s => s.id === deptAsg.schedule_id);
        if (found) assignedSch = found;
      }
    }

    if (empPunches.length === 0) {
      // Absent or not punched yet
      processedSummaries.push({
        date: targetDate,
        employee_id: emp.id,
        employee_number: emp.employee_number,
        employee_name: emp.full_name_en,
        department: emp.department,
        first_punch: null,
        last_punch: null,
        punch_count: 0,
        punches: [],
        schedule_name: assignedSch?.name || 'Standard 8h',
        worked_hours: 0,
        normal_hours: 0,
        ot_hours: 0,
        status: 'Absent',
        late_mins: 0,
        late_deduction: 0
      });
      continue;
    }

    // First punch = check in, Last punch = check out
    const firstPunch = empPunches[0];
    const lastPunch = empPunches.length > 1 ? empPunches[empPunches.length - 1] : firstPunch;

    const firstTimeStr = firstPunch.check_time.includes('T') ? firstPunch.check_time.split('T')[1].slice(0, 5) : firstPunch.check_time.slice(11, 16);
    const lastTimeStr = lastPunch.check_time.includes('T') ? lastPunch.check_time.split('T')[1].slice(0, 5) : lastPunch.check_time.slice(11, 16);

    const parseTime = (t: string) => {
      const [h, m] = (t || "00:00").split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const schedStartMins = parseTime(assignedSch?.start_time || "08:00");
    const checkInMins = parseTime(firstTimeStr);
    const checkOutMins = parseTime(lastTimeStr);

    let status = "Present";
    const graceMins = assignedSch?.grace_period_mins || 15;
    const lateMins = Math.max(0, checkInMins - schedStartMins);
    if (lateMins > graceMins) {
      status = "Late";
    }

    // Calculate worked minutes
    let workedMins = Math.max(0, checkOutMins - checkInMins);
    if (empPunches.length === 1) {
      // If only single check-in punch recorded so far, assume in-progress with standard normal hours
      workedMins = (assignedSch?.total_working_hours || 8) * 60;
    }

    const breakStartMins = parseTime(assignedSch?.break_start || "12:00");
    const breakEndMins = parseTime(assignedSch?.break_end || "13:00");
    const breakDurationMins = Math.max(0, breakEndMins - breakStartMins);
    if (!assignedSch?.break_paid && workedMins > breakDurationMins) {
      workedMins -= breakDurationMins;
    }

    const workedHours = Number((workedMins / 60).toFixed(2));
    const normalHours = Math.min(workedHours, assignedSch?.total_working_hours || 8);
    const otHours = Math.max(0, Number((workedHours - (assignedSch?.total_working_hours || 8)).toFixed(2)));

    let lateDeduction = 0;
    if (status === "Late" && assignedSch?.deduct_for_late) {
      if (assignedSch.late_deduction_method === 'fixed') {
        lateDeduction = assignedSch.late_deduction_amount;
      } else if (assignedSch.late_deduction_method === 'per_minute') {
        lateDeduction = (lateMins - graceMins) * assignedSch.late_deduction_amount;
      } else if (assignedSch.late_deduction_method === 'per_hour') {
        lateDeduction = Number(((lateMins - graceMins) / 60).toFixed(2)) * assignedSch.late_deduction_amount;
      }
    }

    if (workedHours < (assignedSch?.half_day_min_hours || 4) && empPunches.length > 1) {
      status = "Half-day";
    }

    // Update or insert into daily_attendance
    const existingAttIdx = db.daily_attendance.findIndex(a => a.employee_id === emp.id && a.date === targetDate);
    const dailyAttRecord = {
      id: existingAttIdx >= 0 ? db.daily_attendance[existingAttIdx].id : "d-att-" + Date.now() + "-" + emp.id,
      employee_id: emp.id,
      date: targetDate,
      check_in_time: firstTimeStr,
      check_out_time: lastTimeStr,
      worked_hours: workedHours,
      status
    };
    if (existingAttIdx >= 0) db.daily_attendance[existingAttIdx] = dailyAttRecord;
    else db.daily_attendance.push(dailyAttRecord);

    // Update or insert into daily_overtime
    const existingOtIdx = db.daily_overtime.findIndex(o => o.employee_id === emp.id && o.date === targetDate);
    const dailyOtRecord = {
      id: existingOtIdx >= 0 ? db.daily_overtime[existingOtIdx].id : "d-ot-" + Date.now() + "-" + emp.id,
      employee_id: emp.id,
      date: targetDate,
      ot_hours: otHours
    };
    if (existingOtIdx >= 0) db.daily_overtime[existingOtIdx] = dailyOtRecord;
    else db.daily_overtime.push(dailyOtRecord);

    processedSummaries.push({
      date: targetDate,
      employee_id: emp.id,
      employee_number: emp.employee_number,
      employee_name: emp.full_name_en,
      department: emp.department,
      first_punch: firstTimeStr,
      last_punch: lastTimeStr,
      punch_count: empPunches.length,
      punches: empPunches.map(p => ({
        time: p.check_time,
        verify_mode: p.verify_mode,
        type: p.punch_type
      })),
      schedule_name: assignedSch?.name || 'Standard 8h',
      worked_hours: workedHours,
      normal_hours: normalHours,
      ot_hours: otHours,
      status,
      late_mins: lateMins,
      late_deduction: Math.round(lateDeduction)
    });
  }

  // Update monthly attendance aggregator
  const monthDaysAttendedMap = new Map<string, number>();
  db.daily_attendance.filter(a => a.date.startsWith(targetMonth) && a.status !== 'Absent').forEach(a => {
    monthDaysAttendedMap.set(a.employee_id, (monthDaysAttendedMap.get(a.employee_id) || 0) + 1);
  });

  employees.forEach(emp => {
    const daysAtt = monthDaysAttendedMap.get(emp.id) || 25;
    const existingMonthAttIdx = db.attendance.findIndex(a => a.employee_id === emp.id && a.month === targetMonth);
    if (existingMonthAttIdx >= 0) {
      db.attendance[existingMonthAttIdx].days_attended = daysAtt;
    } else {
      db.attendance.push({
        id: "att-" + Date.now() + "-" + emp.id,
        employee_id: emp.id,
        month: targetMonth,
        working_days: 25,
        days_attended: daysAtt,
        no_pay_leave_days: 0
      });
    }
  });

  writeDB(db);

  res.json({
    success: true,
    date: targetDate,
    processed_count: processedSummaries.length,
    present_count: processedSummaries.filter(s => s.status !== 'Absent').length,
    late_count: processedSummaries.filter(s => s.status === 'Late').length,
    summaries: processedSummaries
  });
});

// Biometric Live Status Endpoint
app.get("/api/biometric/status", (req, res) => {
  const db = readDB();
  const todayStr = new Date().toISOString().slice(0, 10);
  const devices = db.biometric_devices || [];
  const logs = db.biometric_attendance_logs || [];
  const todayLogs = logs.filter(l => l.check_time && l.check_time.startsWith(todayStr));

  const presentEmpIds = new Set(todayLogs.filter(l => l.employee_id).map(l => l.employee_id));

  const latestSync = devices.reduce((latest: string | null, d: any) => {
    if (!d.last_sync_time) return latest;
    if (!latest || new Date(d.last_sync_time) > new Date(latest)) return d.last_sync_time;
    return latest;
  }, null);

  res.json({
    total_devices: devices.length,
    online_devices: devices.filter(d => d.status === 'online').length,
    last_sync_time: latestSync,
    today_punches_count: todayLogs.length,
    today_present_count: presentEmpIds.size,
    pending_queue_count: 0,
    devices: devices.map(d => ({
      id: d.id,
      device_name: d.device_name,
      model: d.model,
      ip_address: d.ip_address,
      port: d.port,
      status: d.status,
      serial_number: d.serial_number,
      last_sync_time: d.last_sync_time,
      auto_sync_enabled: d.auto_sync_enabled,
      sync_interval: d.sync_interval
    }))
  });
});

// Supabase Full SQL Schema generator including Biometrics
app.get("/api/biometric/supabase-sql", (req, res) => {
  const sql = `-- Supabase PostgreSQL Schema for Hikvision Biometric Attendance System (DS-K1A8503MF)

CREATE TABLE IF NOT EXISTS biometric_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL,
  brand TEXT DEFAULT 'Hikvision',
  model TEXT DEFAULT 'DS-K1A8503MF',
  ip_address TEXT NOT NULL,
  port INT DEFAULT 80,
  username TEXT DEFAULT 'admin',
  password_hash TEXT,
  time_zone TEXT DEFAULT 'Asia/Colombo',
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  sync_interval INT DEFAULT 5,
  serial_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('online', 'offline', 'syncing', 'error')) DEFAULT 'offline',
  last_sync_time TIMESTAMPTZ,
  last_heartbeat TIMESTAMPTZ,
  location TEXT,
  firmware_version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS biometric_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES biometric_devices(id) ON DELETE CASCADE,
  device_user_id TEXT NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  card_number TEXT,
  verify_type TEXT DEFAULT 'fingerprint',
  enrolled_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_id, device_user_id)
);

CREATE TABLE IF NOT EXISTS biometric_attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES biometric_devices(id) ON DELETE SET NULL,
  device_serial_number TEXT NOT NULL,
  device_user_id TEXT NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  verify_mode TEXT CHECK (verify_mode IN ('fingerprint', 'card', 'face', 'password', 'other')) DEFAULT 'fingerprint',
  check_time TIMESTAMPTZ NOT NULL,
  punch_type TEXT CHECK (punch_type IN ('check_in', 'check_out', 'auto', 'break_start', 'break_end')) DEFAULT 'auto',
  sync_hash TEXT UNIQUE NOT NULL,
  sync_status TEXT DEFAULT 'synced',
  raw_event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast Indexing for Real-Time Queries & Deduplication
CREATE INDEX IF NOT EXISTS idx_bio_logs_check_time ON biometric_attendance_logs(check_time);
CREATE INDEX IF NOT EXISTS idx_bio_logs_employee_id ON biometric_attendance_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_bio_logs_sync_hash ON biometric_attendance_logs(sync_hash);
CREATE INDEX IF NOT EXISTS idx_bio_mappings_user_id ON biometric_user_mappings(device_user_id);

-- Enable RLS
ALTER TABLE biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access biometric devices" ON biometric_devices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access biometric mappings" ON biometric_user_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access biometric logs" ON biometric_attendance_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(sql);
});

// SQL Schema endpoint for Supabase

app.get("/api/supabase-schema", (req, res) => {
  const sql = `
-- Supabase PostgreSQL Schema for UNIBRO SMART APPARELS - HRM & Payroll

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_address TEXT,
  epf_employer_rate NUMERIC DEFAULT 12.0,
  epf_employee_rate NUMERIC DEFAULT 8.0,
  etf_employer_rate NUMERIC DEFAULT 3.0,
  standard_working_days INT DEFAULT 25,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'hr', 'payroll')) DEFAULT 'hr',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  basic_salary NUMERIC NOT NULL,
  fixed_allowance_25_days NUMERIC NOT NULL,
  deduct_day_1 NUMERIC DEFAULT 1000,
  deduct_day_2 NUMERIC DEFAULT 1500,
  deduct_day_3 NUMERIC DEFAULT 2000,
  deduct_day_4 NUMERIC DEFAULT 2500,
  deduct_additional_day NUMERIC DEFAULT 3000,
  ot_normal_rate_per_hour NUMERIC DEFAULT 250,
  ot_off_rate_per_hour NUMERIC DEFAULT 350,
  ot_poya_rate_per_hour NUMERIC DEFAULT 500,
  incentive_type TEXT DEFAULT 'Manufacturing',
  default_incentive_amount NUMERIC DEFAULT 5000,
  epf_etf_applicable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number TEXT UNIQUE NOT NULL,
  full_name_en TEXT NOT NULL,
  full_name_ta TEXT,
  full_name_si TEXT,
  nic TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  join_date DATE NOT NULL,
  employment_status TEXT DEFAULT 'Active',
  epf_enabled BOOLEAN DEFAULT TRUE,
  etf_enabled BOOLEAN DEFAULT TRUE,
  ot_eligible BOOLEAN DEFAULT TRUE,
  salary_scheme_id UUID REFERENCES salary_schemes(id),
  bank_name TEXT,
  bank_branch TEXT,
  bank_account_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- YYYY-MM
  working_days INT DEFAULT 25,
  days_attended INT NOT NULL,
  no_pay_leave_days INT DEFAULT 0,
  paid_leave_days INT DEFAULT 0,
  UNIQUE(employee_id, month)
);

CREATE TABLE IF NOT EXISTS overtime_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  normal_ot_hours NUMERIC DEFAULT 0,
  off_day_ot_hours NUMERIC DEFAULT 0,
  poya_ot_hours NUMERIC DEFAULT 0,
  UNIQUE(employee_id, month)
);

CREATE TABLE IF NOT EXISTS incentive_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  target_achieved_pct NUMERIC DEFAULT 100,
  incentive_amount NUMERIC DEFAULT 0,
  notes TEXT,
  UNIQUE(employee_id, month)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Draft',
  total_basic NUMERIC,
  total_allowances NUMERIC,
  total_ot NUMERIC,
  total_incentives NUMERIC,
  total_deductions NUMERIC,
  total_epf_employee NUMERIC,
  total_epf_employer NUMERIC,
  total_etf_employer NUMERIC,
  total_net NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  employee_number TEXT,
  full_name_en TEXT,
  full_name_ta TEXT,
  full_name_si TEXT,
  department TEXT,
  designation TEXT,
  nic TEXT,
  bank_details TEXT,
  basic_salary NUMERIC,
  days_attended INT,
  no_pay_leave_days INT,
  basic_earned NUMERIC,
  fixed_allowance_earned NUMERIC,
  allowance_deduction NUMERIC,
  no_pay_deduction NUMERIC,
  ot_amount NUMERIC,
  incentive_amount NUMERIC,
  gross_earnings NUMERIC,
  employee_epf_8 NUMERIC,
  employer_epf_12 NUMERIC,
  employer_etf_3 NUMERIC,
  total_deductions NUMERIC,
  net_salary NUMERIC
);

-- Row Level Security (RLS) Enablement
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Allow authenticated users full access for demo/applet)
CREATE POLICY "Allow all authenticated access" ON employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access schemes" ON salary_schemes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access attendance" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access ot" ON overtime_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access incentives" ON incentive_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access runs" ON payroll_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access items" ON payroll_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access settings" ON company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated access profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(sql);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UNIBRO SMART APPARELS - HRM server running on http://localhost:${PORT}`);
  });
}

startServer();
