import fs from "fs";
import path from "path";
import { config } from "./config";

if (!fs.existsSync(config.storage.logDir)) {
  fs.mkdirSync(config.storage.logDir, { recursive: true });
}

const getLogFilePath = () => {
  const dateStr = new Date().toISOString().slice(0, 10);
  return path.join(config.storage.logDir, `sync-${dateStr}.log`);
};

export const logger = {
  info: (msg: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [INFO] ${msg} ${meta ? JSON.stringify(meta) : ""}\n`;
    console.log(`\x1b[32m[INFO]\x1b[0m ${msg}`, meta || "");
    try {
      fs.appendFileSync(getLogFilePath(), formatted);
    } catch (e) {
      // Ignore write errors
    }
  },
  warn: (msg: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [WARN] ${msg} ${meta ? JSON.stringify(meta) : ""}\n`;
    console.warn(`\x1b[33m[WARN]\x1b[0m ${msg}`, meta || "");
    try {
      fs.appendFileSync(getLogFilePath(), formatted);
    } catch (e) {}
  },
  error: (msg: string, err?: any) => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [ERROR] ${msg} ${err ? (err.stack || JSON.stringify(err)) : ""}\n`;
    console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`, err || "");
    try {
      fs.appendFileSync(getLogFilePath(), formatted);
    } catch (e) {}
  }
};
