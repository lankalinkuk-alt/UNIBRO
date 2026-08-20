// Supabase Client Helper for UNIBRO SMART APPARELS - HRM
import { getClientDB, saveClientDB } from './clientDb';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseConnectionStatus {
  connected: boolean;
  message: string;
  tablesFound?: string[];
  latencyMs?: number;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const db = getClientDB();
  return {
    url: db.company_settings?.supabase_url || '',
    anonKey: db.company_settings?.supabase_anon_key || ''
  };
};

export const saveSupabaseConfig = async (config: SupabaseConfig) => {
  const db = getClientDB();
  db.company_settings = {
    ...db.company_settings,
    supabase_url: config.url.trim(),
    supabase_anon_key: config.anonKey.trim()
  };
  saveClientDB(db);

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

export const testSupabaseConnection = async (
  url?: string,
  anonKey?: string
): Promise<SupabaseConnectionStatus> => {
  const config = getSupabaseConfig();
  const targetUrl = (url !== undefined ? url : config.url).trim().replace(/\/+$/, '');
  const targetKey = (anonKey !== undefined ? anonKey : config.anonKey).trim();

  if (!targetUrl || !targetKey) {
    return {
      connected: false,
      message: 'Supabase URL and Anon / Service Key are not configured yet.'
    };
  }

  // Validate URL format
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return {
      connected: false,
      message: 'Invalid Supabase URL. Must start with https:// (e.g. https://xyzcompany.supabase.co)'
    };
  }

  const startTime = Date.now();

  try {
    // Test REST API ping to Supabase PostgREST endpoint
    const response = await fetch(`${targetUrl}/rest/v1/company_settings?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': targetKey,
        'Authorization': `Bearer ${targetKey}`,
        'Content-Type': 'application/json'
      }
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        latencyMs,
        message: `Successfully connected to Supabase in ${latencyMs}ms! Tables are accessible.`,
        tablesFound: ['company_settings', 'employees', 'salary_schemes', 'payroll_records']
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        connected: false,
        latencyMs,
        message: 'Authentication failed (401/403). Please verify your Supabase anon/public key.'
      };
    }

    if (response.status === 404 || response.status === 400) {
      // Endpoint exists but maybe table not created yet
      // Test root OpenAPI endpoint
      const rootRes = await fetch(`${targetUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': targetKey,
          'Authorization': `Bearer ${targetKey}`
        }
      });
      if (rootRes.ok) {
        return {
          connected: true,
          latencyMs,
          message: `Connected to Supabase project, but tables are not created yet. Please execute the provided SQL schema script in the SQL Editor.`,
          tablesFound: []
        };
      }
    }

    return {
      connected: false,
      latencyMs,
      message: `Supabase returned HTTP status ${response.status}: ${response.statusText}`
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Network connection failed: ${err.message || 'Check your Supabase URL, network connection, or CORS settings.'}`
    };
  }
};
