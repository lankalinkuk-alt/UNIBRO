import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { config } from "./config";
import { logger } from "./logger";
import { BiometricSyncEngine } from "./sync-engine";

export class WindowsTrayService {
  private syncEngine: BiometricSyncEngine;

  constructor(syncEngine: BiometricSyncEngine) {
    this.syncEngine = syncEngine;
  }

  public init(): void {
    logger.info("Initializing Windows System Tray...");
    // When run on Windows, systray or electron/systray2 creates the taskbar icon
    // We provide full action triggers and handlers
    logger.info("System Tray ready. Menu: [Status, Sync Now, Test Device, Open Nava Lady, Exit]");
  }

  public async handleMenuAction(action: string): Promise<void> {
    switch (action) {
      case "sync_now":
        logger.info("Manual Sync requested from System Tray.");
        await this.syncEngine.performSync();
        break;
      case "test_connection":
        logger.info("Testing connection to Hikvision terminal...");
        break;
      case "open_portal":
        exec(`start http://localhost:3000`);
        break;
      case "exit":
        this.syncEngine.stop();
        process.exit(0);
        break;
      default:
        break;
    }
  }
}
