import fs from "fs";
import axios from "axios";
import { config } from "./config";
import { logger } from "./logger";
import { HikvisionISAPIClient, AttendanceRecordPayload } from "./hikvision-client";

export class BiometricSyncEngine {
  private hikvision: HikvisionISAPIClient;
  private isSyncing = false;
  private isOnline = true;
  private timer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.hikvision = new HikvisionISAPIClient();
  }

  /**
   * Load local offline deduplication set
   */
  private loadDedupHashes(): Set<string> {
    try {
      if (fs.existsSync(config.storage.dedupCacheFile)) {
        const data = fs.readFileSync(config.storage.dedupCacheFile, "utf-8");
        const list = JSON.parse(data);
        return new Set(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      logger.error("Failed to load deduplication cache:", e);
    }
    return new Set();
  }

  /**
   * Save deduplication set to disk (capped at 50,000 recent hashes)
   */
  private saveDedupHashes(hashes: Set<string>): void {
    try {
      const arr = Array.from(hashes).slice(-50000);
      fs.writeFileSync(config.storage.dedupCacheFile, JSON.stringify(arr), "utf-8");
    } catch (e) {
      logger.error("Failed to save deduplication cache:", e);
    }
  }

  /**
   * Load pending offline queue from disk
   */
  private loadOfflineQueue(): AttendanceRecordPayload[] {
    try {
      if (fs.existsSync(config.storage.offlineQueueFile)) {
        const data = fs.readFileSync(config.storage.offlineQueueFile, "utf-8");
        const list = JSON.parse(data);
        return Array.isArray(list) ? list : [];
      }
    } catch (e) {
      logger.error("Failed to load offline queue:", e);
    }
    return [];
  }

  /**
   * Save pending offline queue to disk
   */
  private saveOfflineQueue(queue: AttendanceRecordPayload[]): void {
    try {
      const capped = queue.slice(-config.sync.maxOfflineQueueSize);
      fs.writeFileSync(config.storage.offlineQueueFile, JSON.stringify(capped, null, 2), "utf-8");
    } catch (e) {
      logger.error("Failed to save offline queue:", e);
    }
  }

  /**
   * Core Sync Routine:
   * 1. Pull events from Hikvision terminal
   * 2. Filter duplicates using SHA-256 hash
   * 3. Flush offline queue + new events to server
   * 4. Persist state
   */
  public async performSync(): Promise<{
    syncedCount: number;
    duplicateCount: number;
    queuedCount: number;
    isOnline: boolean;
  }> {
    if (this.isSyncing) {
      logger.info("Sync is already running. Skipping concurrent trigger.");
      return { syncedCount: 0, duplicateCount: 0, queuedCount: 0, isOnline: this.isOnline };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let duplicateCount = 0;

    try {
      logger.info(`Starting Hikvision DS-K1A8503MF sync from ${config.device.ip}...`);

      const dedupSet = this.loadDedupHashes();
      let offlineQueue = this.loadOfflineQueue();

      // 1. Fetch live events from device
      const fetchedEvents = await this.hikvision.fetchAttendanceEvents();
      logger.info(`Fetched ${fetchedEvents.length} raw attendance events from terminal.`);

      // 2. Filter out already processed events
      const newEvents: AttendanceRecordPayload[] = [];
      for (const evt of fetchedEvents) {
        if (dedupSet.has(evt.sync_hash)) {
          duplicateCount++;
        } else {
          newEvents.push(evt);
          dedupSet.add(evt.sync_hash);
        }
      }

      // 3. Combine with any previously queued offline records
      const recordsToTransmit = [...offlineQueue, ...newEvents];

      if (recordsToTransmit.length > 0) {
        logger.info(`Transmitting ${recordsToTransmit.length} records to Nava Lady HRM (${config.server.apiUrl})...`);

        try {
          const response = await axios.post(
            `${config.server.apiUrl}/biometric/logs/ingest`,
            {
              device_serial_number: config.device.serialNumber,
              records: recordsToTransmit
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-api-key": config.server.apiKey
              },
              timeout: 15000
            }
          );

          if (response.status === 200 && response.data.success) {
            syncedCount = recordsToTransmit.length;
            offlineQueue = []; // Clear queue on successful server transmission
            this.saveOfflineQueue(offlineQueue);
            this.saveDedupHashes(dedupSet);
            this.isOnline = true;
            logger.info(`Successfully synced ${syncedCount} records. Duplicate skipped: ${duplicateCount}.`);
          } else {
            throw new Error(`Server returned status ${response.status}: ${JSON.stringify(response.data)}`);
          }
        } catch (serverErr: any) {
          this.isOnline = false;
          logger.warn(`Network/Server offline: Storing ${newEvents.length} new records in offline local queue.`, serverErr.message);
          // Append new records to offline queue
          offlineQueue.push(...newEvents);
          this.saveOfflineQueue(offlineQueue);
          this.saveDedupHashes(dedupSet);
        }
      } else {
        logger.info("No new punch events to transmit.");
      }

      return {
        syncedCount,
        duplicateCount,
        queuedCount: offlineQueue.length,
        isOnline: this.isOnline
      };
    } catch (err: any) {
      logger.error("Error during biometric sync cycle:", err);
      return { syncedCount: 0, duplicateCount: 0, queuedCount: 0, isOnline: false };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Heartbeat to cloud / local server to maintain device health badge
   */
  public async sendHeartbeat(): Promise<void> {
    try {
      await axios.post(
        `${config.server.apiUrl}/biometric/devices/bio-dev-001/heartbeat`,
        {
          status: this.isOnline ? "online" : "syncing",
          timestamp: new Date().toISOString()
        },
        { timeout: 5000 }
      );
    } catch (e) {
      // Ignore heartbeat transmission failure
    }
  }

  /**
   * Starts background continuous sync schedule
   */
  public start(): void {
    logger.info(`Starting Biometric Sync Service (Interval: ${config.sync.intervalMinutes} min)...`);
    
    // Initial immediate sync
    this.performSync();

    // Periodic sync interval
    const intervalMs = Math.max(1, config.sync.intervalMinutes) * 60 * 1000;
    this.timer = setInterval(() => {
      this.performSync();
    }, intervalMs);

    // Heartbeat every 60 seconds
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 60000);
  }

  /**
   * Stops background service
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    logger.info("Biometric Sync Service stopped.");
  }
}
