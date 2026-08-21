export type Language = 'en' | 'ta' | 'si';
export type UserRole = 'admin' | 'hr' | 'payroll' | 'manager' | 'viewer';

export type UserPermission =
  | 'manage_users'
  | 'manage_employees'
  | 'manage_salary_schemes'
  | 'manage_attendance'
  | 'run_payroll'
  | 'approve_payroll'
  | 'manage_epf_etf'
  | 'manage_biometric'
  | 'manage_working_time'
  | 'manage_incentives'
  | 'backup_restore'
  | 'export_reports'
  | 'view_only';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  department?: string;
  status: 'active' | 'inactive';
  permissions: UserPermission[];
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface Employee {
  id: string;
  employee_number: string;
  full_name_en: string;
  full_name_ta: string;
  full_name_si: string;
  nic: string;
  department: string;
  designation: string;
  join_date: string;
  employment_status: 'Active' | 'Probation' | 'Resigned' | 'Terminated';
  epf_enabled: boolean;
  etf_enabled: boolean;
  ot_eligible: boolean;
  salary_scheme_id: string;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  created_at: string;
}

export interface SalaryScheme {
  id: string;
  name: string;
  scheme_name?: string;
  basic_salary: number;
  fixed_allowance_25_days: number;
  // Allowance deduction rules for attendance shortfall based on 25 working days
  deduct_day_1: number;
  deduct_day_2: number;
  deduct_day_3: number;
  deduct_day_4: number;
  deduct_additional_day: number;
  no_pay_deduction_rate: number; // custom no pay leave deduction rate per day (if 0, uses basic_salary / 25)
  ot_normal_rate_per_hour: number;
  ot_off_rate_per_hour: number;
  ot_poya_rate_per_hour: number;
  ot_rate_normal?: number;
  ot_rate_double?: number;
  bra_allowance?: number;
  budgetary_relief?: number;
  epf_applicable_allowances?: number;
  ot_rate_type?: string;
  attendance_incentive_rule?: string;
  attendance_incentive_target_days?: number;
  attendance_incentive_amount?: number;
  incentive_type: 'Manufacturing' | 'Sales' | 'Fixed' | 'None';
  default_incentive_amount: number;
  epf_etf_applicable: boolean;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  month: string; // YYYY-MM
  working_days: number; // standard 25
  days_attended: number;
  no_pay_leave_days: number;
  paid_leave_days: number;
}

export interface OvertimeRecord {
  id: string;
  employee_id: string;
  month: string; // YYYY-MM
  normal_ot_hours: number;
  off_day_ot_hours: number;
  poya_ot_hours: number;
}

export interface IncentiveRecord {
  id: string;
  employee_id: string;
  month: string; // YYYY-MM
  target_achieved_pct: number;
  incentive_amount: number;
  notes: string;
}

export interface PayrollRun {
  id: string;
  month: string; // YYYY-MM
  status: 'Draft' | 'Locked' | 'Approved';
  total_basic?: number;
  total_allowances?: number;
  total_ot?: number;
  total_incentives?: number;
  total_deductions?: number;
  total_epf_employee: number;
  total_epf_employer: number;
  total_etf_employer: number;
  total_net: number;
  total_gross_pay?: number;
  total_net_pay?: number;
  employee_count?: number;
  is_locked?: boolean;
  calculated_at?: string;
  created_at?: string;
  updated_at?: string;
  locked_at?: string;
}

export interface PayrollItem {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  employee_number: string;
  full_name_en: string;
  full_name_ta: string;
  full_name_si: string;
  department: string;
  designation: string;
  nic: string;
  bank_details: string;
  basic_salary: number;
  days_attended: number;
  no_pay_leave_days: number;
  basic_earned: number;
  fixed_allowance_earned: number;
  allowance_deduction: number;
  no_pay_deduction: number;
  ot_amount: number;
  incentive_amount: number;
  production_incentive: number;
  sales_incentive: number;
  seasonal_incentive: number;
  attendance_incentive: number;
  special_ot_bonus: number;
  gross_earnings: number;
  employee_epf_8: number;
  employer_epf_12: number;
  employer_etf_3: number;
  total_deductions: number;
  net_salary: number;
}

export interface SeasonalIncentiveSlab {
  id: string;
  min_val: number;
  max_val: number;
  bonus_val: number;
  bonus_type: 'fixed' | 'per_unit' | 'percentage' | 'slab_bonus';
}

export interface SeasonalIncentiveRule {
  id: string;
  name: string;
  incentive_type: 'Production' | 'Sales' | 'Attendance' | 'Time-based' | 'Overtime campaign' | 'Custom';
  department: string; // 'All' or specific dept
  employee_group: string; // 'All' or specific group
  start_date: string;
  end_date: string;
  is_active: boolean;
  fixed_bonus: number;
  attendance_requirement: number;
  min_working_days: number;
  min_production: number;
  min_sales: number;
  priority: number;
  slabs: SeasonalIncentiveSlab[];
}

export interface SpecialOTRule {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  from_time: string;
  to_time: string;
  ot_multiplier: number;
  ot_type: 'normal' | 'off' | 'poya' | 'night' | 'all';
  department: string;
  employee_group: string;
  priority: number;
  is_active: boolean;
}

export interface ProductionEntry {
  id: string;
  employee_id: string;
  month: string; // YYYY-MM
  units_produced: number;
}

export interface SalesEntry {
  id: string;
  employee_id: string;
  month: string; // YYYY-MM
  sales_amount: number;
}

export interface DailyProductionEntry {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  units_produced: number;
}

export interface DailySalesEntry {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  sales_amount: number;
}

export interface WorkSchedule {
  id: string;
  name: string;
  shift_type: 'Day' | 'Evening' | 'Night' | 'Rotating' | 'Flexible';
  working_days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  start_time: string; // e.g. "08:00"
  end_time: string; // e.g. "17:00"
  total_working_hours: number; // e.g. 8
  break_start: string; // e.g. "12:00"
  break_end: string; // e.g. "13:00"
  break_paid: boolean;
  crosses_midnight: boolean;
  
  // Late config
  grace_period_mins: number; // e.g. 15
  mark_late_after_grace: boolean;
  deduct_for_late: boolean;
  late_deduction_method: 'fixed' | 'per_minute' | 'per_hour';
  late_deduction_amount: number;

  // Half-day rules
  half_day_min_hours: number; // e.g. 4
  absent_min_hours: number; // e.g. 2

  // Overtime rules
  ot_start_after_end: boolean;
  min_ot_mins: number; // e.g. 30
  ot_rounding_mins: number; // 15 | 30 | 60
  normal_ot_rate: number; // LKR per hr
  off_day_ot_rate: number;
  holiday_ot_rate: number;
  night_ot_rate: number;

  // Flexible shift
  earliest_checkin?: string;
  latest_checkin?: string;
  required_flexible_hours?: number;
}

export interface EmployeeScheduleAssignment {
  id: string;
  schedule_id: string;
  target_type: 'department' | 'employee';
  target_id: string; // department name or employee ID
  effective_from: string; // YYYY-MM-DD
}

export interface AttendanceCalculationRecord {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  schedule_id: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'Present' | 'Late' | 'Half-day' | 'Absent' | 'On Leave';
  worked_hours: number;
  normal_hours: number;
  ot_hours: number;
  late_deduction: number;
  half_day_deduction: number;
  special_ot_bonus: number;
  remarks?: string;
}

export interface CompanySettings {
  company_name: string;
  company_address: string;
  epf_employer_rate: number; // 12%
  epf_employee_rate: number; // 8%
  etf_employer_rate: number; // 3%
  standard_working_days: number; // 25
  supabase_url: string;
  supabase_anon_key: string;
  seasonal_incentive_collision_mode: 'highest_only' | 'add_all' | 'add_highest_two' | 'custom_priority';
}

export interface EPFETFPayment {
  id: string;
  month: string; // YYYY-MM (e.g., '2026-08')
  payment_date: string; // YYYY-MM-DD
  department: string; // 'All' or specific e.g. 'Production'
  payment_type: 'COMBINED_ALL' | 'EPF_20' | 'EPF_EMP_8' | 'EPF_EMPR_12' | 'ETF_3';
  amount: number; // in LKR
  payment_method: 'Bank Transfer' | 'Cheque' | 'Direct Debit' | 'Online C-Form' | 'Cash';
  reference_number: string; // Cheque #, Bank Slip No, or C-Form Ref
  paid_to: string; // e.g. 'Central Bank of Sri Lanka (EPF Dept)' or 'ETF Board' or Department Account
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface DepartmentStatutorySummary {
  department: string;
  employee_count: number;
  epf_base_total: number;
  epf_employee_8: number;
  epf_employer_12: number;
  epf_total_20: number;
  etf_employer_3: number;
  total_statutory_due: number;
  total_paid: number;
  current_balance: number;
  status: 'Settled' | 'Partially Paid' | 'Unpaid' | 'Overpaid';
}

export interface BiometricDevice {
  id: string;
  device_name: string;
  brand: 'Hikvision' | string;
  model: 'DS-K1A8503MF' | string;
  ip_address: string;
  port: number;
  username: string;
  password?: string;
  time_zone: string;
  auto_sync_enabled: boolean;
  sync_interval: number; // 1, 5, 15, 30
  serial_number: string;
  status: 'online' | 'offline' | 'syncing' | 'error';
  last_sync_time: string | null;
  last_heartbeat?: string | null;
  firmware_version?: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export interface BiometricUserMapping {
  id: string;
  device_id: string;
  device_user_id: string; // ID registered in Hikvision terminal
  employee_id: string; // Linked system employee ID
  employee_name?: string;
  employee_number?: string;
  department?: string;
  card_number?: string;
  verify_type?: 'fingerprint' | 'card' | 'face' | 'password' | 'multiple';
  enrolled_date?: string;
  created_at: string;
}

export interface BiometricAttendanceLog {
  id: string;
  device_id: string;
  device_name?: string;
  device_serial_number: string;
  device_user_id: string;
  employee_id: string | null;
  employee_name?: string;
  employee_number?: string;
  department?: string;
  verify_mode: 'fingerprint' | 'card' | 'face' | 'password' | 'other';
  check_time: string; // ISO Datetime string e.g. "2026-08-14T08:04:12+05:30"
  punch_type: 'check_in' | 'check_out' | 'auto' | 'break_start' | 'break_end';
  sync_hash: string; // SHA-256 fingerprint for deduplication
  sync_status: 'synced' | 'pending' | 'processed';
  raw_event_data?: any;
  created_at: string;
}

export interface DailyBiometricSummary {
  date: string; // YYYY-MM-DD
  employee_id: string;
  employee_number: string;
  employee_name: string;
  department: string;
  first_punch: string | null;
  last_punch: string | null;
  punch_count: number;
  punches: Array<{ time: string; verify_mode: string; type: string }>;
  schedule_name?: string;
  worked_hours: number;
  normal_hours: number;
  ot_hours: number;
  status: 'Present' | 'Late' | 'Half-day' | 'Absent';
  late_mins: number;
  late_deduction: number;
}

export interface BiometricSyncStatus {
  total_devices: number;
  online_devices: number;
  last_sync_time: string | null;
  today_punches_count: number;
  today_present_count: number;
  pending_queue_count: number;
  recent_punches: BiometricAttendanceLog[];
}

export type HelpCategoryId =
  | 'getting-started'
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'working-time'
  | 'overtime'
  | 'seasonal-incentives'
  | 'payroll'
  | 'epf-etf'
  | 'payslip'
  | 'backup-restore'
  | 'biometric'
  | 'reports'
  | 'troubleshooting'
  | 'faq';

export interface HelpStep {
  stepNumber: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  illustrationType?: 'dashboard' | 'employee-form' | 'attendance-grid' | 'payroll-run' | 'payslip-4a4' | 'biometric-lan' | 'backup-zip' | 'epf-calc' | 'generic';
  callout?: {
    type: 'tip' | 'warning' | 'info' | 'success';
    text: Record<Language, string>;
  };
}

export interface HelpFAQ {
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

export interface HelpArticle {
  id: string;
  categoryId: HelpCategoryId;
  slug: string;
  iconName: string;
  badgeColor: string;
  readTimeMins: number;
  targetRoute?: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config';
  targetTab?: string;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  tags: Record<Language, string[]>;
  steps: HelpStep[];
  proTip?: Record<Language, string>;
  warning?: Record<Language, string>;
  infoNote?: Record<Language, string>;
  successOutcome?: Record<Language, string>;
  faqs?: HelpFAQ[];
  relatedArticleIds?: string[];
}

export interface HelpCategory {
  id: HelpCategoryId;
  iconName: string;
  colorClass: string;
  badgeColor: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  order: number;
}

