# Nava Lady HRM - Hikvision DS-K1A8503MF Windows Desktop Sync Service

This standalone Windows Desktop Background Service connects to on-premise Hikvision biometric terminals (Model `DS-K1A8503MF`) over the local area network (LAN), retrieves live fingerprint/card verification events via Hikvision ISAPI Digest protocol, eliminates duplicates, buffers events during internet outages, and synchronizes securely with Nava Lady HRM and Supabase.

---

## 🌟 Key Features

1. **Hikvision ISAPI Protocol Support**
   - Direct HTTP Digest authentication with Hikvision terminals.
   - Polls Access Control System Events (`/ISAPI/AccessControl/AcsEvent`).
   - Retrieves employee number, verify type (fingerprint, card, password), and precise timestamp.

2. **Deduplication Engine**
   - Computes deterministic SHA-256 event hashes (`device_serial:user_id:timestamp`).
   - Prevents duplicate log ingestion even across multiple polls or re-syncs.

3. **Offline Resilience & Auto-Retry**
   - Automatically stores un-transmitted logs in local encrypted disk queue (`%APPDATA%/NavaLadyHikvisionSync/offline_queue.json`).
   - Resumes and drains queue as soon as internet connection is restored.

4. **Windows System Tray & Autostart**
   - Starts silently on Windows startup (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`).
   - Resides in the Windows Taskbar Notification Tray.
   - Provides quick actions: *Sync Now*, *Test Connection*, *Open Web Portal*, and *Exit*.

---

## ⚙️ Configuration (`.env`)

Create a `.env` file in the service root directory:

```env
# Hikvision Hardware Settings (LAN)
HIKVISION_IP=192.168.1.201
HIKVISION_PORT=80
HIKVISION_USER=admin
HIKVISION_PASSWORD=Password123#
HIKVISION_MODEL=DS-K1A8503MF
HIKVISION_SERIAL=DS-K1A8503MF20240915V01234
HIKVISION_PROTOCOL=http

# Nava Lady HRM & Supabase API Settings
NAVALADY_API_URL=http://localhost:3000/api
NAVALADY_API_KEY=nl_sec_live_biometric_sync_token_2026
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Sync Engine Rules
SYNC_INTERVAL_MINUTES=5
START_WITH_WINDOWS=true
```

---

## 🚀 Installation & Running

### Step 1: Install Dependencies
```bash
cd windows-sync-service
npm install
```

### Step 2: Run in Development Mode
```bash
npm run dev
```

### Step 3: Build Windows Standalone Executable (.exe)
```bash
npm run build:exe
```
This produces `dist/NavaLady-Hikvision-Sync.exe` which can be distributed to Windows factory/office PCs.

### Step 4: Run as Windows Background Service (Optional via NSSM)
```powershell
nssm install "NavaLadyBiometricSync" "C:\NavaLady\NavaLady-Hikvision-Sync.exe"
nssm set "NavaLadyBiometricSync" AppDirectory "C:\NavaLady"
nssm set "NavaLadyBiometricSync" Start SERVICE_AUTO_START
nssm start "NavaLadyBiometricSync"
```
