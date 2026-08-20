import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  device: {
    ip: string;
    port: number;
    username: string;
    password: string;
    protocol: "http" | "https";
    model: string;
    serialNumber: string;
    timeoutMs: number;
  };
  server: {
    apiUrl: string;
    apiKey: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
  };
  sync: {
    intervalMinutes: number;
    batchSize: number;
    autoRetry: boolean;
    retryIntervalSeconds: number;
    maxOfflineQueueSize: number;
  };
  storage: {
    dataDir: string;
    offlineQueueFile: string;
    dedupCacheFile: string;
    logDir: string;
  };
  windows: {
    startWithWindows: boolean;
    appName: string;
    exePath: string;
  };
}

const appDataPath = process.env.APPDATA 
  ? path.join(process.env.APPDATA, "NavaLadyHikvisionSync")
  : path.join(process.cwd(), "data");

if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true });
}

export const config: AppConfig = {
  device: {
    ip: process.env.HIKVISION_IP || "192.168.1.201",
    port: parseInt(process.env.HIKVISION_PORT || "80", 10),
    username: process.env.HIKVISION_USER || "admin",
    password: process.env.HIKVISION_PASSWORD || "Password123#",
    protocol: (process.env.HIKVISION_PROTOCOL as "http" | "https") || "http",
    model: process.env.HIKVISION_MODEL || "DS-K1A8503MF",
    serialNumber: process.env.HIKVISION_SERIAL || "DS-K1A8503MF20240915V01234",
    timeoutMs: 10000
  },
  server: {
    apiUrl: process.env.NAVALADY_API_URL || "http://localhost:3000/api",
    apiKey: process.env.NAVALADY_API_KEY || "nl_sec_live_biometric_sync_token_2026",
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  },
  sync: {
    intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES || "5", 10),
    batchSize: 100,
    autoRetry: true,
    retryIntervalSeconds: 30,
    maxOfflineQueueSize: 50000
  },
  storage: {
    dataDir: appDataPath,
    offlineQueueFile: path.join(appDataPath, "offline_queue.json"),
    dedupCacheFile: path.join(appDataPath, "dedup_hashes.json"),
    logDir: path.join(appDataPath, "logs")
  },
  windows: {
    startWithWindows: process.env.START_WITH_WINDOWS === "true" || true,
    appName: "NavaLadyBiometricSyncService",
    exePath: process.execPath
  }
};
