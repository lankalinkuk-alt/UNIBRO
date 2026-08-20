import { config } from "./config";
import { logger } from "./logger";
import { BiometricSyncEngine } from "./sync-engine";
import { WindowsAutoStart } from "./windows-autostart";
import { WindowsTrayService } from "./tray-service";

async function bootstrap() {
  console.log(`
  ======================================================
     NAVA LADY HRM - HIKVISION BIOMETRIC SYNC SERVICE
     Model: ${config.device.model} | IP: ${config.device.ip}:${config.device.port}
  ======================================================
  `);

  logger.info("Initializing Windows Biometric Sync Daemon...");

  if (config.windows.startWithWindows) {
    await WindowsAutoStart.enableAutoStart();
  }

  const syncEngine = new BiometricSyncEngine();
  const trayService = new WindowsTrayService(syncEngine);

  trayService.init();
  syncEngine.start();

  process.on("SIGINT", () => {
    logger.info("Received SIGINT. Shutting down gracefully...");
    syncEngine.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM. Shutting down gracefully...");
    syncEngine.stop();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal error starting Windows Sync Service:", err);
});
