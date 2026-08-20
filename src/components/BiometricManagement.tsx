import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  Download,
  Terminal,
  Activity,
  Layers,
  Search,
  Sliders,
  Check,
  X,
  Play,
  Server,
  Zap,
  Info
} from "lucide-react";
import {
  BiometricDevice,
  BiometricUserMapping,
  BiometricAttendanceLog,
  Employee
} from "../types";

interface BiometricManagementProps {
  t: (key: string) => string;
  lang: string;
  employees: Employee[];
  onRefreshParent?: () => void;
}

export const BiometricManagement: React.FC<BiometricManagementProps> = ({
  t,
  lang,
  employees,
  onRefreshParent
}) => {
  const [activeTab, setActiveTab] = useState<"devices" | "mapping" | "logs" | "service">("devices");
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [mappings, setMappings] = useState<BiometricUserMapping[]>([]);
  const [logs, setLogs] = useState<BiometricAttendanceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Filter states
  const [logDateFilter, setLogDateFilter] = useState<string>(new Date().toISOString().slice(0, 10));
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");
  const [mappingSearchQuery, setMappingSearchQuery] = useState<string>("");

  // Modals
  const [showDeviceModal, setShowDeviceModal] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [editingMapping, setEditingMapping] = useState<BiometricUserMapping | null>(null);
  const [showManualPunchModal, setShowManualPunchModal] = useState<boolean>(false);

  // Device Form State
  const [deviceForm, setDeviceForm] = useState({
    device_name: "Main Factory Entrance - DS-K1A8503MF",
    brand: "Hikvision",
    model: "DS-K1A8503MF",
    ip_address: "192.168.1.201",
    port: 80,
    username: "admin",
    password: "",
    time_zone: "Asia/Colombo (UTC+05:30)",
    auto_sync_enabled: true,
    sync_interval: 5,
    serial_number: "DS-K1A8503MF20240915V01234",
    location: "Security Gate 1",
    notes: "Hikvision standalone attendance terminal"
  });

  // Mapping Form State
  const [mappingForm, setMappingForm] = useState({
    device_id: "",
    device_user_id: "",
    employee_id: "",
    card_number: "",
    verify_type: "fingerprint" as "fingerprint" | "card" | "face" | "password",
    enrolled_date: new Date().toISOString().slice(0, 10)
  });

  // Manual Punch Form State
  const [punchForm, setPunchForm] = useState({
    device_id: "",
    employee_id: "",
    device_user_id: "",
    verify_mode: "fingerprint" as "fingerprint" | "card" | "face" | "password",
    check_time: new Date().toISOString().slice(0, 16),
    punch_type: "check_in" as "check_in" | "check_out"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devRes, mapRes, logRes] = await Promise.all([
        fetch("/api/biometric/devices"),
        fetch("/api/biometric/mappings"),
        fetch(`/api/biometric/logs?date=${logDateFilter}`)
      ]);

      if (devRes.ok) setDevices(await devRes.json());
      if (mapRes.ok) setMappings(await mapRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch (err) {
      console.error("Error fetching biometric data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [logDateFilter]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Device actions
  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("saving_device");
    try {
      const url = editingDevice ? `/api/biometric/devices/${editingDevice.id}` : "/api/biometric/devices";
      const method = editingDevice ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deviceForm)
      });
      if (res.ok) {
        showToast(editingDevice ? "Device updated successfully!" : "New biometric device registered!");
        setShowDeviceModal(false);
        setEditingDevice(null);
        fetchData();
      } else {
        showToast("Failed to save device details.", "error");
      }
    } catch (err) {
      showToast("Error connecting to server.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestConnection = async (deviceId: string) => {
    setActionLoading(`test_${deviceId}`);
    try {
      const res = await fetch(`/api/biometric/devices/${deviceId}/test-connection`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`Connection to ${data.device_name} (${data.ip_address}) successful! ISAPI Digest authenticated.`);
        fetchData();
      } else {
        showToast(`Connection failed: ${data.message || "Device unreachable"}`, "error");
      }
    } catch (err) {
      showToast("Connection test error.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncNow = async (deviceId: string) => {
    setActionLoading(`sync_${deviceId}`);
    try {
      const res = await fetch(`/api/biometric/devices/${deviceId}/sync-now`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`Sync completed! ${data.synced_records} attendance records processed.`);
        fetchData();
        if (onRefreshParent) onRefreshParent();
      } else {
        showToast("Sync failed.", "error");
      }
    } catch (err) {
      showToast("Sync request error.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm("Are you sure you want to remove this biometric device?")) return;
    try {
      const res = await fetch(`/api/biometric/devices/${deviceId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Device deleted.");
        fetchData();
      }
    } catch (err) {
      showToast("Delete failed.", "error");
    }
  };

  // Mapping actions
  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingForm.employee_id || !mappingForm.device_user_id) {
      showToast("Please select an employee and enter a Biometric User ID.", "error");
      return;
    }
    setActionLoading("saving_mapping");
    try {
      const url = editingMapping ? `/api/biometric/mappings/${editingMapping.id}` : "/api/biometric/mappings";
      const method = editingMapping ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappingForm)
      });
      if (res.ok) {
        showToast("Employee biometric mapping saved!");
        setShowMappingModal(false);
        setEditingMapping(null);
        fetchData();
      } else {
        showToast("Failed to save mapping.", "error");
      }
    } catch (err) {
      showToast("Mapping save error.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoMatch = async () => {
    setActionLoading("auto_matching");
    try {
      const res = await fetch("/api/biometric/mappings/auto-match", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`Auto-matched ${data.matched_count} employees to biometric terminal user IDs!`);
        fetchData();
      }
    } catch (err) {
      showToast("Auto-match failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      const res = await fetch(`/api/biometric/mappings/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Mapping removed.");
        fetchData();
      }
    } catch (err) {
      showToast("Error deleting mapping.", "error");
    }
  };

  // Log & Attendance Processing
  const handleSaveManualPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("saving_punch");
    try {
      const res = await fetch("/api/biometric/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...punchForm,
          check_time: new Date(punchForm.check_time).toISOString()
        })
      });
      if (res.ok) {
        showToast("Attendance punch recorded successfully!");
        setShowManualPunchModal(false);
        fetchData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      showToast("Failed to record punch.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessDailyAttendance = async () => {
    setActionLoading("processing_attendance");
    try {
      const res = await fetch("/api/biometric/process-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: logDateFilter })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Processed attendance for ${data.processed_count} employees (${data.present_count} present, ${data.late_count} late)!`);
        fetchData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      showToast("Attendance calculation error.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLogs = logs.filter(l => {
    const q = logSearchQuery.toLowerCase();
    return (
      (l.employee_name && l.employee_name.toLowerCase().includes(q)) ||
      (l.employee_number && l.employee_number.toLowerCase().includes(q)) ||
      (l.device_user_id && l.device_user_id.toLowerCase().includes(q)) ||
      (l.department && l.department.toLowerCase().includes(q))
    );
  });

  const filteredMappings = mappings.filter(m => {
    const q = mappingSearchQuery.toLowerCase();
    return (
      (m.employee_name && m.employee_name.toLowerCase().includes(q)) ||
      (m.employee_number && m.employee_number.toLowerCase().includes(q)) ||
      (m.device_user_id && m.device_user_id.toLowerCase().includes(q)) ||
      (m.card_number && m.card_number.toLowerCase().includes(q))
    );
  });

  return (
    <div id="biometric_management_container" className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          id="biometric_toast_notification"
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg text-white animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-600"
              : notification.type === "error"
              ? "bg-rose-600"
              : "bg-blue-600"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {notification.type === "error" && <AlertCircle className="w-5 h-5" />}
            {notification.type === "info" && <Info className="w-5 h-5" />}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with quick stats */}
      <div id="biometric_header_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Fingerprint className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t("biometric_devices")}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hikvision DS-K1A8503MF Active
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                LAN Biometric Hardware, Employee Mapping & Real-time Attendance Ingestion
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn_refresh_biometric"
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium text-sm transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
              Refresh
            </button>
            <button
              id="btn_process_attendance_today"
              onClick={handleProcessDailyAttendance}
              disabled={actionLoading === "processing_attendance"}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {actionLoading === "processing_attendance" ? "Processing..." : t("process_attendance")}
            </button>
            <button
              id="btn_add_device_main"
              onClick={() => {
                setEditingDevice(null);
                setDeviceForm({
                  device_name: "Main Factory Entrance - DS-K1A8503MF",
                  brand: "Hikvision",
                  model: "DS-K1A8503MF",
                  ip_address: "192.168.1.201",
                  port: 80,
                  username: "admin",
                  password: "Password123#",
                  time_zone: "Asia/Colombo (UTC+05:30)",
                  auto_sync_enabled: true,
                  sync_interval: 5,
                  serial_number: `DS-K1A8503MF20240915V0${devices.length + 1}`,
                  location: "Main Entrance",
                  notes: "Standalone biometric attendance terminal"
                });
                setShowDeviceModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium text-sm transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Device
            </button>
          </div>
        </div>

        {/* Navigation Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 -mb-6">
          <button
            id="tab_bio_devices"
            onClick={() => setActiveTab("devices")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "devices"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Cpu className="w-4 h-4" />
            {t("biometric_devices")} ({devices.length})
          </button>
          <button
            id="tab_bio_mapping"
            onClick={() => setActiveTab("mapping")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "mapping"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {t("biometric_mapping")} ({mappings.length})
          </button>
          <button
            id="tab_bio_logs"
            onClick={() => setActiveTab("logs")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "logs"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Activity className="w-4 h-4" />
            {t("biometric_logs")} ({logs.length})
          </button>
          <button
            id="tab_bio_service"
            onClick={() => setActiveTab("service")}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "service"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Server className="w-4 h-4" />
            {t("hikvision_sync")}
          </button>
        </div>
      </div>

      {/* TAB 1: DEVICES LIST */}
      {activeTab === "devices" && (
        <div id="biometric_devices_tab_content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                id={`device_card_${device.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {device.device_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {device.brand} {device.model} • SN: {device.serial_number}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      device.status === "online"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {device.status === "online" ? (
                      <>
                        <Wifi className="w-3.5 h-3.5" />
                        {t("device_online")}
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5" />
                        {t("device_offline")}
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">IP & Port</span>
                    <p className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {device.ip_address}:{device.port}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Time Zone</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {device.time_zone}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">{t("auto_sync")}</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                      {device.auto_sync_enabled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Enabled (Every {device.sync_interval} min)
                        </span>
                      ) : (
                        <span className="text-slate-400">Disabled</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Last Synced</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {device.last_sync_time
                        ? new Date(device.last_sync_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : "Never"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn_test_conn_${device.id}`}
                      onClick={() => handleTestConnection(device.id)}
                      disabled={actionLoading === `test_${device.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Zap className={`w-3.5 h-3.5 ${actionLoading === `test_${device.id}` ? "animate-spin text-amber-500" : "text-amber-500"}`} />
                      {t("test_connection")}
                    </button>
                    <button
                      id={`btn_sync_now_${device.id}`}
                      onClick={() => handleSyncNow(device.id)}
                      disabled={actionLoading === `sync_${device.id}`}
                      className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === `sync_${device.id}` ? "animate-spin text-indigo-600" : "text-indigo-600"}`} />
                      {t("sync_now")}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`btn_edit_dev_${device.id}`}
                      onClick={() => {
                        setEditingDevice(device);
                        setDeviceForm({
                          device_name: device.device_name,
                          brand: device.brand,
                          model: device.model,
                          ip_address: device.ip_address,
                          port: device.port,
                          username: device.username,
                          password: device.password,
                          time_zone: device.time_zone,
                          auto_sync_enabled: device.auto_sync_enabled,
                          sync_interval: device.sync_interval,
                          serial_number: device.serial_number,
                          location: device.location || "",
                          notes: device.notes || ""
                        });
                        setShowDeviceModal(true);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit Device"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn_del_dev_${device.id}`}
                      onClick={() => handleDeleteDevice(device.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete Device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE MAPPING */}
      {activeTab === "mapping" && (
        <div id="biometric_mapping_tab_content" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mapped employee, biometric user ID, card number..."
                  value={mappingSearchQuery}
                  onChange={(e) => setMappingSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn_auto_match_employees"
                  onClick={handleAutoMatch}
                  disabled={actionLoading === "auto_matching"}
                  className="px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-medium text-xs transition flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Auto-Match by Employee No
                </button>
                <button
                  id="btn_add_mapping"
                  onClick={() => {
                    setEditingMapping(null);
                    setMappingForm({
                      device_id: devices[0]?.id || "",
                      device_user_id: String(mappings.length + 1),
                      employee_id: employees[0]?.id || "",
                      card_number: "",
                      verify_type: "fingerprint",
                      enrolled_date: new Date().toISOString().slice(0, 10)
                    });
                    setShowMappingModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add User Mapping
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 px-3">Biometric ID</th>
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">Department</th>
                    <th className="pb-3 px-3">Verify Mode</th>
                    <th className="pb-3 px-3">Card Number</th>
                    <th className="pb-3 px-3">Enrolled Date</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredMappings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No employee biometric mappings found. Click "Auto-Match" or "Add User Mapping".
                      </td>
                    </tr>
                  ) : (
                    filteredMappings.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                            ID #{m.device_user_id}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {m.employee_name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {m.employee_number}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-xs">
                          {m.department || "General"}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize flex items-center gap-1 w-fit">
                            <Fingerprint className="w-3 h-3 text-indigo-500" />
                            {m.verify_type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {m.card_number || "—"}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">
                          {m.enrolled_date || "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingMapping(m);
                                setMappingForm({
                                  device_id: m.device_id,
                                  device_user_id: m.device_user_id,
                                  employee_id: m.employee_id,
                                  card_number: m.card_number || "",
                                  verify_type: m.verify_type || "fingerprint",
                                  enrolled_date: m.enrolled_date || new Date().toISOString().slice(0, 10)
                                });
                                setShowMappingModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMapping(m.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE LOGS */}
      {activeTab === "logs" && (
        <div id="biometric_logs_tab_content" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="date"
                    value={logDateFilter}
                    onChange={(e) => setLogDateFilter(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by employee or ID..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn_add_manual_punch"
                  onClick={() => {
                    setPunchForm({
                      device_id: devices[0]?.id || "",
                      employee_id: employees[0]?.id || "",
                      device_user_id: "1",
                      verify_mode: "fingerprint",
                      check_time: new Date().toISOString().slice(0, 16),
                      punch_type: "check_in"
                    });
                    setShowManualPunchModal(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium text-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Manual Punch Entry
                </button>
                <button
                  id="btn_calculate_attendance_for_date"
                  onClick={handleProcessDailyAttendance}
                  disabled={actionLoading === "processing_attendance"}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  {t("process_attendance")} ({logDateFilter})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 px-3">Punch Time</th>
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">Biometric ID</th>
                    <th className="pb-3 px-3">Verify Mode</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Device / Terminal</th>
                    <th className="pb-3 px-3">Deduplication Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No biometric punch logs recorded for {logDateFilter}.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white text-xs">
                          {log.check_time ? new Date(log.check_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "—"}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {log.employee_name || "Unmapped User"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {log.employee_number || "—"}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-700 dark:text-slate-300">
                            #{log.device_user_id}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 capitalize">
                            {log.verify_mode}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.punch_type === 'check_in'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : log.punch_type === 'check_out'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {log.punch_type === 'check_in' ? 'Check In' : log.punch_type === 'check_out' ? 'Check Out' : 'Auto Punch'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">
                          {log.device_name || log.device_serial_number}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                          {log.sync_hash}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WINDOWS SYNC SERVICE & SUPABASE DDL */}
      {activeTab === "service" && (
        <div id="biometric_service_tab_content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Architecture Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Windows Desktop Sync Service Architecture
                  </h3>
                  <p className="text-xs text-slate-500">Node.js + TypeScript Standalone Background Daemon</p>
                </div>
              </div>

              <div className="space-y-3 mt-6 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">LAN ISAPI Digest Protocol</strong>
                    <p className="mt-0.5 text-slate-500">Directly authenticates with DS-K1A8503MF on port 80/8000 via HTTP Digest challenge.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Deterministic SHA-256 Deduplication</strong>
                    <p className="mt-0.5 text-slate-500">Prevents multiple entries of same punch event even during repeated polling intervals.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Offline Disk Queue & Auto-Retry</strong>
                    <p className="mt-0.5 text-slate-500">Buffers events on Windows local disk when internet drops, automatically synchronizing upon reconnection.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Windows Registry Autostart & Tray Menu</strong>
                    <p className="mt-0.5 text-slate-500">Starts silently with Windows boot in taskbar system tray with manual sync trigger.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Setup Commands */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-sm font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="font-semibold text-indigo-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Quick Windows Deployment
                  </span>
                  <span className="text-[10px] text-slate-500">PowerShell / Command Prompt</span>
                </div>

                <p className="text-slate-400 mb-2 font-sans">1. Navigate to sync service and install packages:</p>
                <div className="p-2.5 bg-slate-950 rounded-lg text-emerald-400 mb-4 overflow-x-auto">
                  cd windows-sync-service && npm install
                </div>

                <p className="text-slate-400 mb-2 font-sans">2. Run in background mode with system tray:</p>
                <div className="p-2.5 bg-slate-950 rounded-lg text-emerald-400 mb-4 overflow-x-auto">
                  npm run start
                </div>

                <p className="text-slate-400 mb-2 font-sans">3. Build standalone Windows .exe executable:</p>
                <div className="p-2.5 bg-slate-950 rounded-lg text-emerald-400 overflow-x-auto">
                  npm run build:exe
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-sans">Download Supabase PostgreSQL DDL:</span>
                <a
                  href="/api/biometric/supabase-sql"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-sans font-medium text-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download SQL Schema
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DEVICE */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingDevice ? "Edit Biometric Device" : "Add Biometric Device"}
                  </h3>
                  <p className="text-xs text-slate-500">Hikvision DS-K1A8503MF Standalone Attendance Terminal</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeviceModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDevice} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Device Name
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceForm.device_name}
                    onChange={(e) => setDeviceForm({ ...deviceForm, device_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Factory Entrance Terminal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceForm.brand}
                    onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceForm.model}
                    onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IP Address (LAN)
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceForm.ip_address}
                    onChange={(e) => setDeviceForm({ ...deviceForm, ip_address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                    placeholder="192.168.1.201"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={deviceForm.port}
                    onChange={(e) => setDeviceForm({ ...deviceForm, port: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceForm.username}
                    onChange={(e) => setDeviceForm({ ...deviceForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={deviceForm.password}
                    onChange={(e) => setDeviceForm({ ...deviceForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sync Interval
                  </label>
                  <select
                    value={deviceForm.sync_interval}
                    onChange={(e) => setDeviceForm({ ...deviceForm, sync_interval: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>Every 1 minute</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Zone
                  </label>
                  <input
                    type="text"
                    value={deviceForm.time_zone}
                    onChange={(e) => setDeviceForm({ ...deviceForm, time_zone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="auto_sync_check"
                    checked={deviceForm.auto_sync_enabled}
                    onChange={(e) => setDeviceForm({ ...deviceForm, auto_sync_enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="auto_sync_check" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Enable Automatic Background Sync for this terminal
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saving_device"}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
                >
                  {actionLoading === "saving_device" ? "Saving..." : "Save Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT MAPPING */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingMapping ? "Edit Employee Mapping" : "Map Employee to Biometric ID"}
                  </h3>
                  <p className="text-xs text-slate-500">Link Hikvision user slot to employee record</p>
                </div>
              </div>
              <button
                onClick={() => setShowMappingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMapping} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Employee
                </label>
                <select
                  required
                  value={mappingForm.employee_id}
                  onChange={(e) => setMappingForm({ ...mappingForm, employee_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_number} - {emp.full_name_en} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biometric User ID (Enrolled in DS-K1A8503MF)
                </label>
                <input
                  type="text"
                  required
                  value={mappingForm.device_user_id}
                  onChange={(e) => setMappingForm({ ...mappingForm, device_user_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 1, 2, 101"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Mode
                </label>
                <select
                  value={mappingForm.verify_type}
                  onChange={(e) => setMappingForm({ ...mappingForm, verify_type: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="fingerprint">Fingerprint</option>
                  <option value="card">RFID Card</option>
                  <option value="face">Face</option>
                  <option value="password">Password</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Number (Optional)
                </label>
                <input
                  type="text"
                  value={mappingForm.card_number}
                  onChange={(e) => setMappingForm({ ...mappingForm, card_number: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 0008459201"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMappingModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saving_mapping"}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
                >
                  {actionLoading === "saving_mapping" ? "Saving..." : "Save Mapping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL PUNCH ENTRY */}
      {showManualPunchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Manual Attendance Punch
                  </h3>
                  <p className="text-xs text-slate-500">Record verification log entry manually</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualPunchModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPunch} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <select
                  required
                  value={punchForm.employee_id}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const mapping = mappings.find(m => m.employee_id === empId);
                    setPunchForm({
                      ...punchForm,
                      employee_id: empId,
                      device_user_id: mapping?.device_user_id || "1"
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_number} - {emp.full_name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Punch Type
                </label>
                <select
                  value={punchForm.punch_type}
                  onChange={(e) => setPunchForm({ ...punchForm, punch_type: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="check_in">Check In (Duty Start)</option>
                  <option value="check_out">Check Out (Duty End)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Punch Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={punchForm.check_time}
                  onChange={(e) => setPunchForm({ ...punchForm, check_time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verify Mode
                </label>
                <select
                  value={punchForm.verify_mode}
                  onChange={(e) => setPunchForm({ ...punchForm, verify_mode: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="fingerprint">Fingerprint</option>
                  <option value="card">RFID Card</option>
                  <option value="face">Face</option>
                  <option value="password">Password</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualPunchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saving_punch"}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
                >
                  {actionLoading === "saving_punch" ? "Saving..." : "Record Punch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
