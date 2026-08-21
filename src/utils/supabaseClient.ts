// Supabase Client Helper for UNIBRO SMART APPARELS - HRM
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getClientDB, saveClientDB } from './clientDb';
import { Employee, SalaryScheme } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  configured?: boolean;
}

export interface SupabaseConnectionStatus {
  connected: boolean;
  message: string;
  tablesFound?: string[];
  latencyMs?: number;
  error?: string;
  canWriteEmployees?: boolean;
  missingColumns?: boolean;
  tableReports?: TableHealthReport[];
}

export interface TableHealthReport {
  tableName: string;
  displayName: string;
  status: 'healthy' | 'warning' | 'missing_table' | 'rls_blocked' | 'error';
  statusText: string;
  rowCount: number;
  errorDetails?: string;
  fixRecommendation?: string;
}

export const SUPABASE_MIGRATION_SQL = `-- Supabase PostgreSQL Full Schema & Non-Destructive Migration Script
-- UNIBRO SMART APPARELS - HRM, Payroll & Biometric Attendance
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create base tables if they don't exist yet
CREATE TABLE IF NOT EXISTS company_settings (id TEXT PRIMARY KEY DEFAULT 'default');
CREATE TABLE IF NOT EXISTS salary_schemes (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS biometric_devices (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS biometric_user_mappings (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS biometric_attendance_logs (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS payroll_runs (id TEXT PRIMARY KEY);

-- 2. Safely add or update all required columns on EMPLOYEES table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emp_no TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name_en TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name_ta TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name_si TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS nic TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Production';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Operator';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_status TEXT DEFAULT 'Active';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS epf_enabled BOOLEAN DEFAULT true;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS etf_enabled BOOLEAN DEFAULT true;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS ot_eligible BOOLEAN DEFAULT true;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_scheme_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_branch TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure NOT NULL constraints and type mismatches do not fail cross-compatibility
DO $$
BEGIN
  ALTER TABLE IF EXISTS employees ALTER COLUMN emp_no DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN employee_number DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN full_name DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN name DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN full_name_en DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN department DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN designation DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN join_date DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN nic DROP NOT NULL;
  ALTER TABLE IF EXISTS employees ALTER COLUMN salary_scheme_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

UPDATE employees SET emp_no = COALESCE(emp_no, employee_number) WHERE emp_no IS NULL AND employee_number IS NOT NULL;
UPDATE employees SET employee_number = COALESCE(employee_number, emp_no) WHERE employee_number IS NULL AND emp_no IS NOT NULL;

-- 3. Safely add or update columns on SALARY_SCHEMES table
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Standard Scheme';
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS basic_salary NUMERIC DEFAULT 35000;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS fixed_allowance_25_days NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS deduct_day_1 NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS deduct_day_2 NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS deduct_day_3 NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS deduct_day_4 NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS deduct_additional_day NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS ot_normal_rate_per_hour NUMERIC DEFAULT 250;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS ot_off_rate_per_hour NUMERIC DEFAULT 350;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS ot_poya_rate_per_hour NUMERIC DEFAULT 500;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS incentive_type TEXT DEFAULT 'Manufacturing';
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS default_incentive_amount NUMERIC DEFAULT 5000;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS epf_etf_applicable BOOLEAN DEFAULT true;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS budgetary_relief NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS bra_allowance NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS epf_applicable_allowances NUMERIC DEFAULT 0;
ALTER TABLE salary_schemes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Safely add or update columns on COMPANY_SETTINGS table
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'UNIBRO SMART APPARELS';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS epf_employer_rate NUMERIC DEFAULT 12.0;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS epf_employee_rate NUMERIC DEFAULT 8.0;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS etf_employer_rate NUMERIC DEFAULT 3.0;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS standard_working_days INT DEFAULT 25;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS supabase_url TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Safely add columns on PAYROLL_RUNS table
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS employee_count INT DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_gross_pay NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_net_pay NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_epf_employee NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_epf_employer NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_etf_employer NUMERIC DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Biometric attendance tables
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS device_name TEXT;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS port INT DEFAULT 80;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS device_model TEXT DEFAULT 'DS-K1A8503MF';
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'BOTH';
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS sync_interval INT DEFAULT 30;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'online';
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS last_sync_time TIMESTAMPTZ;
ALTER TABLE biometric_devices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS device_user_id TEXT;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS employee_number TEXT;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS verify_type TEXT DEFAULT 'fingerprint';
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS enrolled_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE biometric_user_mappings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS device_serial_number TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS device_user_id TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS employee_number TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS check_time TIMESTAMPTZ;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS verify_mode TEXT DEFAULT 'fingerprint';
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS punch_type TEXT DEFAULT 'check_in';
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS sync_hash TEXT;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced';
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS synced_to_payroll BOOLEAN DEFAULT false;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS raw_payload JSONB;
ALTER TABLE biometric_attendance_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure timestamp / check_time cross-compatibility
DO $$
BEGIN
  ALTER TABLE IF EXISTS biometric_attendance_logs ALTER COLUMN check_time DROP NOT NULL;
  ALTER TABLE IF EXISTS biometric_attendance_logs ALTER COLUMN timestamp DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7. Type conversion safety if previously UUID
DO $$
BEGIN
  ALTER TABLE employees ALTER COLUMN id TYPE TEXT;
  ALTER TABLE employees ALTER COLUMN salary_scheme_id TYPE TEXT;
  ALTER TABLE salary_schemes ALTER COLUMN id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 8. Enable RLS and permissive policies for anon & authenticated roles
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access company_settings" ON company_settings;
CREATE POLICY "Allow full access company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access salary_schemes" ON salary_schemes;
CREATE POLICY "Allow full access salary_schemes" ON salary_schemes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access employees" ON employees;
CREATE POLICY "Allow full access employees" ON employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access biometric_devices" ON biometric_devices;
CREATE POLICY "Allow full access biometric_devices" ON biometric_devices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access biometric_user_mappings" ON biometric_user_mappings;
CREATE POLICY "Allow full access biometric_user_mappings" ON biometric_user_mappings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access biometric_attendance_logs" ON biometric_attendance_logs;
CREATE POLICY "Allow full access biometric_attendance_logs" ON biometric_attendance_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access payroll_runs" ON payroll_runs;
CREATE POLICY "Allow full access payroll_runs" ON payroll_runs FOR ALL USING (true) WITH CHECK (true);

-- 9. Grant permissions to public roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export const getSupabaseConfig = (): SupabaseConfig => {
  const db = getClientDB();
  const url = (db.company_settings?.supabase_url || (typeof process !== 'undefined' ? (process.env.SUPABASE_URL || '') : '') || '').trim();
  const anonKey = (db.company_settings?.supabase_anon_key || (typeof process !== 'undefined' ? (process.env.SUPABASE_ANON_KEY || '') : '') || '').trim();
  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey)
  };
};

export const getSupabaseClient = (overrideUrl?: string, overrideKey?: string): SupabaseClient | null => {
  const config = getSupabaseConfig();
  const targetUrl = (overrideUrl !== undefined ? overrideUrl : config.url).trim().replace(/\/+$/, '');
  const targetKey = (overrideKey !== undefined ? overrideKey : config.anonKey).trim();

  if (!targetUrl || !targetKey) {
    return null;
  }

  const key = `${targetUrl}__${targetKey}`;
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedConfigKey = key;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase Client:", err);
    return null;
  }
};

export const saveSupabaseConfig = async (config: SupabaseConfig) => {
  const db = getClientDB();
  db.company_settings = {
    ...db.company_settings,
    supabase_url: config.url.trim(),
    supabase_anon_key: config.anonKey.trim()
  };
  saveClientDB(db);

  // Clear client cache
  cachedClient = null;
  cachedConfigKey = '';

  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db.company_settings)
    });
  } catch (e) {
    console.warn("Synced Supabase config to local storage");
  }
};

export const APP_TABLE_DEFINITIONS: { name: string; label: string; primaryKey: string }[] = [
  { name: 'company_settings', label: 'Company Settings & EPF/ETF Rates', primaryKey: 'id' },
  { name: 'salary_schemes', label: 'Salary Schemes & Overtime Rules', primaryKey: 'id' },
  { name: 'employees', label: 'Employee Master Registry', primaryKey: 'id' },
  { name: 'biometric_devices', label: 'Biometric Terminals & Devices', primaryKey: 'id' },
  { name: 'biometric_user_mappings', label: 'Biometric User/Card Enrolments', primaryKey: 'id' },
  { name: 'biometric_attendance_logs', label: 'Biometric Hardware Attendance Logs', primaryKey: 'id' },
  { name: 'payroll_runs', label: 'Monthly Payroll Runs & History', primaryKey: 'id' }
];

/**
 * Perform a thorough, table-by-table health diagnostic on every single table in Supabase
 */
export const diagnoseAllTables = async (
  urlOverride?: string,
  keyOverride?: string
): Promise<{
  connected: boolean;
  latencyMs: number;
  totalTables: number;
  healthyTables: number;
  hasErrors: boolean;
  reports: TableHealthReport[];
  generalMessage: string;
}> => {
  const config = getSupabaseConfig();
  const targetUrl = (urlOverride !== undefined ? urlOverride : config.url).trim().replace(/\/+$/, '');
  const targetKey = (keyOverride !== undefined ? keyOverride : config.anonKey).trim();

  if (!targetUrl || !targetKey) {
    return {
      connected: false,
      latencyMs: 0,
      totalTables: APP_TABLE_DEFINITIONS.length,
      healthyTables: 0,
      hasErrors: true,
      reports: APP_TABLE_DEFINITIONS.map(t => ({
        tableName: t.name,
        displayName: t.label,
        status: 'error',
        statusText: 'Credentials Missing',
        rowCount: 0,
        errorDetails: 'Supabase URL and Anon API key are not configured yet.',
        fixRecommendation: 'Enter your Supabase URL & Key in Supabase Settings and click Save.'
      })),
      generalMessage: 'Supabase URL and API Key are required to run table diagnostics.'
    };
  }

  const startTime = Date.now();
  const client = getSupabaseClient(targetUrl, targetKey);
  if (!client) {
    return {
      connected: false,
      latencyMs: 0,
      totalTables: APP_TABLE_DEFINITIONS.length,
      healthyTables: 0,
      hasErrors: true,
      reports: APP_TABLE_DEFINITIONS.map(t => ({
        tableName: t.name,
        displayName: t.label,
        status: 'error',
        statusText: 'Initialization Failed',
        rowCount: 0,
        errorDetails: 'Failed to create Supabase client instance.'
      })),
      generalMessage: 'Failed to initialize Supabase client.'
    };
  }

  const reports: TableHealthReport[] = [];

  for (const tableDef of APP_TABLE_DEFINITIONS) {
    try {
      // 1. Try a count and minimal select query
      const { data, error, count } = await client
        .from(tableDef.name)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          reports.push({
            tableName: tableDef.name,
            displayName: tableDef.label,
            status: 'missing_table',
            statusText: 'Table Missing',
            rowCount: 0,
            errorDetails: `Table "${tableDef.name}" does not exist in Supabase (${error.message}).`,
            fixRecommendation: `Run the SQL schema in your Supabase SQL Editor to create table "${tableDef.name}".`
          });
        } else if (error.code === '42501' || error.message.includes('row-level security') || error.message.includes('permission denied') || error.message.includes('policy')) {
          reports.push({
            tableName: tableDef.name,
            displayName: tableDef.label,
            status: 'rls_blocked',
            statusText: 'RLS Permission Blocked',
            rowCount: 0,
            errorDetails: `Row Level Security (RLS) is preventing access to "${tableDef.name}".`,
            fixRecommendation: `Execute the RLS policy SQL: CREATE POLICY "Allow full access ${tableDef.name}" ON ${tableDef.name} FOR ALL USING (true) WITH CHECK (true);`
          });
        } else if (error.code === '42703' || error.message.includes('column')) {
          reports.push({
            tableName: tableDef.name,
            displayName: tableDef.label,
            status: 'warning',
            statusText: 'Schema Notice',
            rowCount: count || (data ? data.length : 0),
            errorDetails: `Column mismatch on "${tableDef.name}": ${error.message}`,
            fixRecommendation: 'Run the non-destructive SQL migration script to add missing columns.'
          });
        } else {
          reports.push({
            tableName: tableDef.name,
            displayName: tableDef.label,
            status: 'error',
            statusText: `Error (${error.code || 'API'})`,
            rowCount: 0,
            errorDetails: error.message,
            fixRecommendation: 'Check table structure and Supabase API key permissions.'
          });
        }
      } else {
        // Table exists and query succeeded!
        const rowCount = count !== null && count !== undefined ? count : (data ? data.length : 0);
        reports.push({
          tableName: tableDef.name,
          displayName: tableDef.label,
          status: 'healthy',
          statusText: 'Ready & Synced',
          rowCount,
          errorDetails: undefined
        });
      }
    } catch (err: any) {
      reports.push({
        tableName: tableDef.name,
        displayName: tableDef.label,
        status: 'error',
        statusText: 'Network / Query Failure',
        rowCount: 0,
        errorDetails: err?.message || 'Unknown network error'
      });
    }
  }

  const latencyMs = Date.now() - startTime;
  const healthyTables = reports.filter(r => r.status === 'healthy').length;
  const hasErrors = healthyTables < APP_TABLE_DEFINITIONS.length;

  let generalMessage = '';
  if (healthyTables === APP_TABLE_DEFINITIONS.length) {
    generalMessage = `All ${APP_TABLE_DEFINITIONS.length} tables verified healthy & synchronized (${latencyMs}ms response).`;
  } else if (healthyTables === 0) {
    generalMessage = `Tables are missing or blocked by RLS in Supabase. Run the provided SQL migration in Supabase SQL Editor.`;
  } else {
    generalMessage = `${healthyTables} of ${APP_TABLE_DEFINITIONS.length} tables ready. ${APP_TABLE_DEFINITIONS.length - healthyTables} table(s) need SQL setup.`;
  }

  return {
    connected: healthyTables > 0 || reports.some(r => r.status !== 'error'),
    latencyMs,
    totalTables: APP_TABLE_DEFINITIONS.length,
    healthyTables,
    hasErrors,
    reports,
    generalMessage
  };
};

export const testSupabaseConnection = async (
  url?: string,
  anonKey?: string
): Promise<SupabaseConnectionStatus> => {
  const diag = await diagnoseAllTables(url, anonKey);
  
  const tablesFound = diag.reports.filter(r => r.status === 'healthy' || r.status === 'warning').map(r => r.tableName);
  const empReport = diag.reports.find(r => r.tableName === 'employees');
  const canWriteEmployees = empReport ? (empReport.status === 'healthy' || empReport.status === 'warning') : false;
  const missingColumns = diag.reports.some(r => r.status === 'warning' || r.status === 'missing_table');

  return {
    connected: diag.connected,
    latencyMs: diag.latencyMs,
    message: diag.generalMessage,
    tablesFound,
    canWriteEmployees,
    missingColumns,
    tableReports: diag.reports,
    error: diag.hasErrors ? diag.reports.find(r => r.status !== 'healthy')?.errorDetails : undefined
  };
};

/**
 * Ensures salary scheme exists in Supabase to avoid foreign key errors on employee insertion
 */
export const ensureSupabaseSalarySchemeExists = async (schemeId?: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  const db = getClientDB();
  const schemes = db.salary_schemes || [];
  const targetScheme = schemes.find(s => s.id === schemeId) || schemes[0];

  if (!targetScheme) return true;

  try {
    const payload = {
      id: targetScheme.id,
      name: targetScheme.name || targetScheme.scheme_name || 'Standard Scheme',
      basic_salary: Number(targetScheme.basic_salary) || 35000,
      fixed_allowance_25_days: Number(targetScheme.fixed_allowance_25_days) || 0,
      deduct_day_1: Number(targetScheme.deduct_day_1) || 0,
      deduct_day_2: Number(targetScheme.deduct_day_2) || 0,
      deduct_day_3: Number(targetScheme.deduct_day_3) || 0,
      deduct_day_4: Number(targetScheme.deduct_day_4) || 0,
      deduct_additional_day: Number(targetScheme.deduct_additional_day) || 0,
      ot_normal_rate_per_hour: Number(targetScheme.ot_normal_rate_per_hour || targetScheme.ot_rate_normal) || 250,
      ot_off_rate_per_hour: Number(targetScheme.ot_off_rate_per_hour || targetScheme.ot_rate_double) || 350,
      ot_poya_rate_per_hour: Number(targetScheme.ot_poya_rate_per_hour) || 500,
      epf_etf_applicable: targetScheme.epf_etf_applicable ?? true
    };

    const { error } = await client
      .from('salary_schemes')
      .upsert(payload, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn("Salary scheme sync notice:", error.message);
    }
    return !error;
  } catch (err) {
    console.warn("Error ensuring salary scheme in Supabase:", err);
    return false;
  }
};

/**
 * Validates and normalizes date strings to YYYY-MM-DD
 */
const toSafeIsoDate = (val?: any): string => {
  if (!val) return new Date().toISOString().split('T')[0];
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
};

/**
 * Saves or updates an employee directly in Supabase with auto-adaptive schema handling
 */
export const saveEmployeeToSupabase = async (employee: Partial<Employee>): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured with URL and Anon Key' };
  }

  try {
    // 1. Ensure scheme is available in Supabase if scheme_id is supplied
    if (employee.salary_scheme_id) {
      await ensureSupabaseSalarySchemeExists(employee.salary_scheme_id);
    }

    const empNo = (employee.employee_number || (employee as any).emp_no || (employee as any).employee_id || `EMP-${Date.now()}`).toString().trim();
    const fullName = (employee.full_name_en || (employee as any).full_name || (employee as any).name || 'Unnamed Employee').toString().trim();
    const safeJoinDate = toSafeIsoDate(employee.join_date);
    const empId = employee.id || `emp-${Date.now()}`;

    // 2. Query 1 row to dynamically inspect table structure if already populated
    let knownColumns: Set<string> | null = null;
    try {
      const { data: sampleData, error: sampleErr } = await client.from('employees').select('*').limit(1);
      if (!sampleErr && sampleData && sampleData.length > 0) {
        knownColumns = new Set(Object.keys(sampleData[0]));
      }
    } catch {
      // ignore
    }

    // 3. Prepare base payload matching standard Supabase employees table columns
    let currentPayload: Record<string, any> = {
      id: empId,
      employee_number: empNo,
      full_name_en: fullName,
      nic: employee.nic || null,
      department: employee.department || 'Production',
      designation: employee.designation || 'Operator',
      join_date: safeJoinDate,
      employment_status: employee.employment_status || 'Active',
      epf_enabled: employee.epf_enabled ?? true,
      etf_enabled: employee.etf_enabled ?? true,
      ot_eligible: employee.ot_eligible ?? true,
      salary_scheme_id: employee.salary_scheme_id || null,
      bank_name: employee.bank_name || null,
      bank_branch: employee.bank_branch || null,
      bank_account_number: employee.bank_account_number || null,
      created_at: employee.created_at || new Date().toISOString()
    };

    // If known columns were detected, adapt payload to match exact database schema
    if (knownColumns) {
      if (knownColumns.has('emp_no')) currentPayload.emp_no = empNo;
      if (knownColumns.has('full_name')) currentPayload.full_name = fullName;
      if (knownColumns.has('name')) currentPayload.name = fullName;
      if (!knownColumns.has('employee_number') && knownColumns.has('emp_no')) delete currentPayload.employee_number;
      if (!knownColumns.has('full_name_en') && (knownColumns.has('full_name') || knownColumns.has('name'))) delete currentPayload.full_name_en;

      // Filter out any payload properties that do not exist in the database table
      for (const key of Object.keys(currentPayload)) {
        if (!knownColumns.has(key)) {
          delete currentPayload[key];
        }
      }
    }

    // Auto-adaptive retry loop for schema variations (emp_no vs employee_number, not-null constraints, missing columns, type mismatches)
    let maxAttempts = 6;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await client
        .from('employees')
        .upsert(currentPayload, { onConflict: 'id' })
        .select();

      if (!error) {
        console.log("Successfully saved employee to Supabase:", data);
        return { success: true };
      }

      lastError = error;
      console.warn(`Supabase employee upsert attempt ${attempt + 1} issue:`, error);

      // 1. Handle 42703 / PGRST204: Column does not exist in the schema cache
      if (error.code === '42703' || (error as any).code === 'PGRST204' || error.message.includes('column') || error.message.includes('does not exist')) {
        const colMatch = error.message.match(/'([^']+)' column/) || error.message.match(/column "([^"]+)"/i) || error.message.match(/column ([a-zA-Z0-9_]+) does not exist/i);
        const missingCol = colMatch ? colMatch[1] : null;

        if (missingCol && missingCol in currentPayload) {
          delete currentPayload[missingCol];
          if (missingCol === 'employee_number') {
            currentPayload.emp_no = empNo;
          } else if (missingCol === 'full_name_en') {
            currentPayload.full_name = fullName;
            currentPayload.name = fullName;
          }
          continue; // Retry without this missing column!
        }
      }

      // 2. Handle 23502: NOT NULL constraint violation (e.g. null value in column "xyz" violates not-null constraint)
      if (error.code === '23502' || error.message.includes('not-null constraint')) {
        const notNullMatch = error.message.match(/column "([^"]+)"/i);
        const colName = notNullMatch ? notNullMatch[1] : null;

        if (colName && (!(colName in currentPayload) || currentPayload[colName] === null)) {
          const lower = colName.toLowerCase();
          if (lower.includes('date') || lower.includes('dob') || lower.includes('time') || lower.includes('joined') || lower.includes('hire') || lower.includes('birth') || lower.includes('at')) {
            currentPayload[colName] = safeJoinDate;
          } else if (lower.includes('salary') || lower.includes('amount') || lower.includes('rate') || lower.includes('allowance') || lower.includes('deduct') || lower.includes('num') || lower.includes('count') || lower.includes('age') || lower.includes('ot')) {
            currentPayload[colName] = 0;
          } else if (lower.includes('is_') || lower.includes('has_') || lower.includes('enabled') || lower.includes('active') || lower.includes('eligible')) {
            currentPayload[colName] = true;
          } else if (lower.includes('name')) {
            currentPayload[colName] = fullName;
          } else if (lower.includes('department')) {
            currentPayload[colName] = employee.department || 'Production';
          } else if (lower.includes('designation') || lower.includes('role')) {
            currentPayload[colName] = employee.designation || 'Operator';
          } else if (lower.includes('status')) {
            currentPayload[colName] = employee.employment_status || 'Active';
          } else if (lower.includes('epf') || lower.includes('etf') || lower.includes('nic')) {
            currentPayload[colName] = employee.nic || empNo;
          } else {
            currentPayload[colName] = empNo;
          }
          continue; // Retry with missing NOT NULL column intelligently populated!
        }
      }

      // 3. Handle 22007 / 22P02 / 22008 / 42804: Invalid input syntax for type (date, integer, uuid, etc.)
      if (error.code === '22007' || error.code === '22P02' || error.code === '22008' || error.code === '42804' || error.message.includes('invalid input syntax') || error.message.includes('type')) {
        const typeMatch = error.message.match(/invalid input syntax for type ([a-zA-Z0-9_ ]+):/i);
        const expectedType = typeMatch ? typeMatch[1].trim().toLowerCase() : '';

        // If error mentions date, ensure all date-like fields are safe ISO dates
        if (expectedType.includes('date') || error.message.includes('date')) {
          for (const [key, val] of Object.entries(currentPayload)) {
            if (key.toLowerCase().includes('date') || key.toLowerCase().includes('dob') || key.toLowerCase().includes('time') || key.toLowerCase().includes('joined')) {
              currentPayload[key] = safeJoinDate;
            } else if (typeof val === 'string' && val === empNo && key !== 'employee_number' && key !== 'emp_no' && key !== 'id') {
              delete currentPayload[key];
            }
          }
          continue;
        }

        // If error mentions integer / numeric, ensure numeric fields
        if (expectedType.includes('int') || expectedType.includes('numeric') || expectedType.includes('float')) {
          for (const [key, val] of Object.entries(currentPayload)) {
            if (typeof val === 'string' && isNaN(Number(val))) {
              if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('salary')) {
                currentPayload[key] = 0;
              }
            }
          }
          continue;
        }
      }

      // 4. Handle 23503: Foreign key violation on salary_scheme_id
      if (error.code === '23503' && currentPayload.salary_scheme_id) {
        currentPayload.salary_scheme_id = null;
        continue; // Retry with nullable foreign key!
      }

      // 5. Handle 23505: Unique constraint violation (try direct update)
      if (error.code === '23505') {
        try {
          const { error: updErr } = await client
            .from('employees')
            .update(currentPayload)
            .eq('id', empId);
          if (!updErr) return { success: true };
        } catch {
          // ignore
        }
      }

      // If we cannot auto-heal this specific error, exit loop
      break;
    }

    let userFriendlyMsg = lastError?.message || 'Error saving employee to Supabase';
    if (lastError?.code === '42P01') {
      userFriendlyMsg = 'Table "employees" does not exist in Supabase. Run the SQL schema script in your Supabase SQL Editor.';
    } else if (lastError?.code === '42501' || lastError?.message.includes('row-level security')) {
      userFriendlyMsg = 'Row Level Security (RLS) is blocking inserts on "employees". Run the SQL script to enable anon read/write policy.';
    } else if (lastError?.code === '23505') {
      userFriendlyMsg = `Duplicate constraint violation: An employee with number "${empNo}" or NIC "${employee.nic}" already exists in Supabase.`;
    }

    return { success: false, error: userFriendlyMsg };
  } catch (err: any) {
    console.error("Exception saving employee to Supabase:", err);
    return { success: false, error: err.message || 'Unknown network error' };
  }
};

/**
 * Deletes an employee from Supabase
 */
export const deleteEmployeeFromSupabase = async (employeeId: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase is not configured' };

  try {
    const { error } = await client
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) {
      console.error("Supabase employee delete error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Fetches all employees from Supabase
 */
export const fetchEmployeesFromSupabase = async (): Promise<{ success: boolean; data?: Employee[]; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await client
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const normalized: Employee[] = (data || []).map((row: any) => ({
      id: row.id || `emp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      employee_number: row.employee_number || row.emp_no || row.employee_no || `EMP-${Date.now()}`,
      full_name_en: row.full_name_en || row.full_name || row.name || 'Unnamed Employee',
      full_name_ta: row.full_name_ta || '',
      full_name_si: row.full_name_si || '',
      nic: row.nic || '',
      department: row.department || 'Production',
      designation: row.designation || 'Operator',
      join_date: row.join_date ? row.join_date.toString().split('T')[0] : new Date().toISOString().split('T')[0],
      employment_status: row.employment_status || row.status || 'Active',
      epf_enabled: row.epf_enabled !== false,
      etf_enabled: row.etf_enabled !== false,
      ot_eligible: row.ot_eligible !== false,
      salary_scheme_id: row.salary_scheme_id || '',
      bank_name: row.bank_name || '',
      bank_branch: row.bank_branch || '',
      bank_account_number: row.bank_account_number || '',
      created_at: row.created_at || new Date().toISOString()
    }));

    return { success: true, data: normalized };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Sync all local employees and schemes to Supabase
 */
export const syncAllDataToSupabase = async (): Promise<{
  success: boolean;
  employeesSynced: number;
  schemesSynced: number;
  devicesSynced?: number;
  mappingsSynced?: number;
  logsSynced?: number;
  error?: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, employeesSynced: 0, schemesSynced: 0, error: 'Supabase URL and Anon Key are not set.' };
  }

  // 1. Get employees and schemes from all available sources (server API + local clientDB)
  const db = getClientDB();
  let schemes = db.salary_schemes || [];
  let employees: any[] = db.employees || [];

  try {
    const sRes = await fetch('/api/salary-schemes');
    if (sRes.ok) {
      const serverSchemes = await sRes.json();
      if (Array.isArray(serverSchemes) && serverSchemes.length > 0) {
        schemes = serverSchemes;
      }
    }
  } catch {
    // use local schemes
  }

  try {
    const eRes = await fetch('/api/employees');
    if (eRes.ok) {
      const serverEmployees = await eRes.json();
      if (Array.isArray(serverEmployees) && serverEmployees.length > 0) {
        // Merge server employees with client employees by ID
        const empMap = new Map<string, any>();
        for (const e of employees) empMap.set(e.id || e.employee_number, e);
        for (const e of serverEmployees) empMap.set(e.id || e.employee_number, e);
        employees = Array.from(empMap.values());
      }
    }
  } catch {
    // use local employees
  }

  let schemesSynced = 0;
  let employeesSynced = 0;
  const syncErrors: string[] = [];

  try {
    // 1. Sync Salary Schemes
    for (const s of schemes) {
      const payload = {
        id: s.id,
        name: s.name || s.scheme_name || 'Standard Scheme',
        basic_salary: Number(s.basic_salary) || 35000,
        fixed_allowance_25_days: Number(s.fixed_allowance_25_days) || 0,
        deduct_day_1: Number(s.deduct_day_1) || 0,
        deduct_day_2: Number(s.deduct_day_2) || 0,
        deduct_day_3: Number(s.deduct_day_3) || 0,
        deduct_day_4: Number(s.deduct_day_4) || 0,
        deduct_additional_day: Number(s.deduct_additional_day) || 0,
        ot_normal_rate_per_hour: Number(s.ot_normal_rate_per_hour || s.ot_rate_normal) || 250,
        ot_off_rate_per_hour: Number(s.ot_off_rate_per_hour || s.ot_rate_double) || 350,
        ot_poya_rate_per_hour: Number(s.ot_poya_rate_per_hour) || 500,
        epf_etf_applicable: s.epf_etf_applicable ?? true
      };

      const { error } = await client.from('salary_schemes').upsert(payload, { onConflict: 'id' });
      if (!error) schemesSynced++;
    }

    // 2. Sync Employees
    for (const e of employees) {
      const res = await saveEmployeeToSupabase(e);
      if (res.success) {
        employeesSynced++;
      } else if (res.error) {
        syncErrors.push(`${e.employee_number || e.id}: ${res.error}`);
      }
    }

    // 3. Sync Company Settings
    if (db.company_settings) {
      const settingsPayload = {
        id: 'default',
        company_name: db.company_settings.company_name || 'UNIBRO SMART APPARELS',
        company_address: db.company_settings.company_address || '',
        epf_employer_rate: Number(db.company_settings.epf_employer_rate) || 12,
        epf_employee_rate: Number(db.company_settings.epf_employee_rate) || 8,
        etf_employer_rate: Number(db.company_settings.etf_employer_rate) || 3,
        standard_working_days: Number(db.company_settings.standard_working_days) || 25,
        supabase_url: db.company_settings.supabase_url || '',
        supabase_anon_key: db.company_settings.supabase_anon_key || ''
      };
      await client.from('company_settings').upsert(settingsPayload, { onConflict: 'id' });
    }

    // 4. Sync Biometric Devices, Mappings, and In/Out Attendance Logs
    let bioDevicesSynced = 0;
    let bioMappingsSynced = 0;
    let bioLogsSynced = 0;

    try {
      const bioResult = await syncBiometricDataToSupabase();
      if (bioResult.success) {
        bioDevicesSynced = bioResult.devicesSynced;
        bioMappingsSynced = bioResult.mappingsSynced;
        bioLogsSynced = bioResult.logsSynced;
      }
    } catch (bioErr) {
      console.warn("Biometric data sync notice in syncAllDataToSupabase:", bioErr);
    }

    if (employeesSynced === 0 && employees.length > 0 && syncErrors.length > 0) {
      return {
        success: false,
        employeesSynced,
        schemesSynced,
        logsSynced: bioLogsSynced,
        devicesSynced: bioDevicesSynced,
        mappingsSynced: bioMappingsSynced,
        error: syncErrors[0]
      };
    }

    return {
      success: true,
      employeesSynced,
      schemesSynced,
      logsSynced: bioLogsSynced,
      devicesSynced: bioDevicesSynced,
      mappingsSynced: bioMappingsSynced
    };
  } catch (err: any) {
    return {
      success: false,
      employeesSynced,
      schemesSynced,
      logsSynced: 0,
      devicesSynced: 0,
      mappingsSynced: 0,
      error: err.message
    };
  }
};

/**
 * Saves a single In/Out Biometric Attendance Log directly to Supabase with auto-healing schema adaptation
 */
export const saveBiometricLogToSupabase = async (
  log: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured with URL and Anon Key' };
  }

  try {
    const db = getClientDB();
    const employees = db.employees || [];
    const emp = employees.find(e => e.id === log.employee_id || e.employee_number === log.employee_number);

    const safeTime = log.check_time || log.timestamp || new Date().toISOString();
    const logId = log.id || `bio-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const empNo = emp?.employee_number || log.employee_number || null;
    const empName = emp?.full_name_en || log.employee_name || null;
    const dept = emp?.department || log.department || null;

    let payload: Record<string, any> = {
      id: logId,
      device_id: log.device_id || 'bio-dev-001',
      device_serial_number: log.device_serial_number || 'DS-K1A8503MF',
      device_user_id: String(log.device_user_id || '1'),
      employee_id: log.employee_id || emp?.id || null,
      employee_number: empNo,
      employee_name: empName,
      department: dept,
      check_time: safeTime,
      timestamp: safeTime,
      verify_mode: log.verify_mode || 'fingerprint',
      punch_type: log.punch_type || 'check_in',
      sync_hash: log.sync_hash || `punch_${log.device_user_id || empNo}_${safeTime.replace(/[-:T+.]/g, '').slice(0, 14)}`,
      sync_status: 'synced',
      synced_to_payroll: Boolean(log.synced_to_payroll),
      created_at: log.created_at || new Date().toISOString()
    };

    // Auto-adaptive upsert with retry loop
    for (let attempt = 0; attempt < 4; attempt++) {
      const { error } = await client
        .from('biometric_attendance_logs')
        .upsert(payload, { onConflict: 'id' });

      if (!error) {
        console.log("Successfully saved biometric attendance log to Supabase:", logId);
        return { success: true };
      }

      console.warn(`Supabase biometric log attempt ${attempt + 1} notice:`, error);

      // Handle 42703 / PGRST204: Column does not exist in schema cache
      if (error.code === '42703' || (error as any).code === 'PGRST204' || error.message.includes('column') || error.message.includes('does not exist')) {
        const colMatch = error.message.match(/'([^']+)' column/) || error.message.match(/column "([^"]+)"/i) || error.message.match(/column ([a-zA-Z0-9_]+) does not exist/i);
        const missingCol = colMatch ? colMatch[1] : null;

        if (missingCol && missingCol in payload) {
          delete payload[missingCol];
          continue;
        }
      }

      // If generic column issue, fall back to core columns
      if (attempt === 1) {
        payload = {
          id: logId,
          device_id: payload.device_id,
          device_user_id: payload.device_user_id,
          employee_id: payload.employee_id,
          check_time: safeTime,
          timestamp: safeTime,
          verify_mode: payload.verify_mode,
          punch_type: payload.punch_type,
          created_at: payload.created_at
        };
        continue;
      }

      if (attempt === 2) {
        payload = {
          id: logId,
          device_id: payload.device_id,
          device_user_id: payload.device_user_id,
          timestamp: safeTime,
          punch_type: payload.punch_type
        };
        continue;
      }

      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception saving biometric log to Supabase:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Saves a batch of In/Out Biometric Attendance Logs to Supabase
 */
export const saveBiometricLogsBatchToSupabase = async (
  logs: any[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(logs) || logs.length === 0) {
    return { success: false, count: 0, error: 'No client or empty logs' };
  }

  let savedCount = 0;
  for (const log of logs) {
    const res = await saveBiometricLogToSupabase(log);
    if (res.success) savedCount++;
  }

  return { success: savedCount > 0, count: savedCount };
};

/**
 * Saves a Biometric Device to Supabase
 */
export const saveBiometricDeviceToSupabase = async (
  device: any
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  try {
    const payload = {
      id: device.id || `bio-${Date.now()}`,
      name: device.name || device.device_name || 'Hikvision Terminal',
      device_name: device.device_name || device.name || 'Hikvision Terminal',
      ip_address: device.ip_address || '192.168.1.201',
      port: Number(device.port) || 80,
      device_model: device.device_model || 'DS-K1A8503MF',
      serial_number: device.serial_number || 'DSK1A8503MF',
      direction: device.direction || 'BOTH',
      sync_interval: Number(device.sync_interval) || 30,
      is_active: device.is_active !== false,
      status: device.status || 'online',
      last_sync_time: device.last_sync_time || new Date().toISOString(),
      created_at: device.created_at || new Date().toISOString()
    };

    const { error } = await client.from('biometric_devices').upsert(payload, { onConflict: 'id' });
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Saves a Biometric User/Card Mapping to Supabase
 */
export const saveBiometricMappingToSupabase = async (
  mapping: any
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  try {
    const db = getClientDB();
    const emp = (db.employees || []).find(e => e.id === mapping.employee_id);

    const payload = {
      id: mapping.id || `bio-map-${Date.now()}`,
      device_id: mapping.device_id || 'bio-dev-001',
      device_user_id: String(mapping.device_user_id || '1'),
      employee_id: mapping.employee_id || null,
      employee_number: emp?.employee_number || mapping.employee_number || null,
      employee_name: emp?.full_name_en || mapping.employee_name || null,
      card_number: mapping.card_number || null,
      verify_type: mapping.verify_type || 'fingerprint',
      enrolled_date: mapping.enrolled_date || new Date().toISOString().slice(0, 10),
      created_at: mapping.created_at || new Date().toISOString()
    };

    const { error } = await client.from('biometric_user_mappings').upsert(payload, { onConflict: 'id' });
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Fetches biometric logs from Supabase
 */
export const fetchBiometricLogsFromSupabase = async (
  targetDate?: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  try {
    let query = client
      .from('biometric_attendance_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (targetDate) {
      query = query.or(`check_time.gte.${targetDate}T00:00:00,timestamp.gte.${targetDate}T00:00:00`);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Syncs all biometric hardware devices, user mappings, and In/Out Attendance Logs to Supabase
 */
export const syncBiometricDataToSupabase = async (): Promise<{
  success: boolean;
  logsSynced: number;
  devicesSynced: number;
  mappingsSynced: number;
  error?: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, logsSynced: 0, devicesSynced: 0, mappingsSynced: 0, error: 'Supabase is not configured' };
  }

  const db = getClientDB();
  let devices: any[] = db.biometric_devices || [];
  let mappings: any[] = db.biometric_user_mappings || [];
  let logs: any[] = db.biometric_attendance_logs || [];

  // Try fetching latest records from server API
  try {
    const [devRes, mapRes, logRes] = await Promise.all([
      fetch('/api/biometric/devices'),
      fetch('/api/biometric/mappings'),
      fetch('/api/biometric/logs')
    ]);

    if (devRes.ok) {
      const sDevs = await devRes.json();
      if (Array.isArray(sDevs) && sDevs.length > 0) devices = sDevs;
    }
    if (mapRes.ok) {
      const sMaps = await mapRes.json();
      if (Array.isArray(sMaps) && sMaps.length > 0) mappings = sMaps;
    }
    if (logRes.ok) {
      const sLogs = await logRes.json();
      if (Array.isArray(sLogs) && sLogs.length > 0) {
        const logMap = new Map<string, any>();
        for (const l of logs) logMap.set(l.id || l.sync_hash, l);
        for (const l of sLogs) logMap.set(l.id || l.sync_hash, l);
        logs = Array.from(logMap.values());
      }
    }
  } catch {
    // continue with local data
  }

  let devicesSynced = 0;
  let mappingsSynced = 0;
  let logsSynced = 0;

  // 1. Sync devices
  for (const d of devices) {
    const res = await saveBiometricDeviceToSupabase(d);
    if (res.success) devicesSynced++;
  }

  // 2. Sync mappings
  for (const m of mappings) {
    const res = await saveBiometricMappingToSupabase(m);
    if (res.success) mappingsSynced++;
  }

  // 3. Sync logs
  for (const l of logs) {
    const res = await saveBiometricLogToSupabase(l);
    if (res.success) logsSynced++;
  }

  // Also notify server endpoint if online
  try {
    await fetch('/api/biometric/sync-supabase', { method: 'POST' });
  } catch {
    // ignore
  }

  return {
    success: true,
    logsSynced,
    devicesSynced,
    mappingsSynced
  };
};
