import { exec } from "child_process";
import { config } from "./config";
import { logger } from "./logger";

export class WindowsAutoStart {
  /**
   * Registers application in Windows Registry (HKCU\Software\Microsoft\Windows\CurrentVersion\Run)
   * to start silently on Windows boot
   */
  public static async enableAutoStart(): Promise<boolean> {
    return new Promise((resolve) => {
      const regKey = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`;
      const regValueName = config.windows.appName;
      const exePath = `"${config.windows.exePath}" --tray`;

      const command = `reg add "${regKey}" /v "${regValueName}" /t REG_SZ /d "${exePath}" /f`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error("Failed to enable Windows autostart:", stderr || error.message);
          resolve(false);
        } else {
          logger.info("Windows autostart enabled successfully via Registry Run key.");
          resolve(true);
        }
      });
    });
  }

  /**
   * Removes autostart entry from Windows Registry
   */
  public static async disableAutoStart(): Promise<boolean> {
    return new Promise((resolve) => {
      const regKey = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`;
      const regValueName = config.windows.appName;

      const command = `reg delete "${regKey}" /v "${regValueName}" /f`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.warn("Windows autostart key was not present or could not be removed.");
          resolve(false);
        } else {
          logger.info("Windows autostart disabled.");
          resolve(true);
        }
      });
    });
  }
}
