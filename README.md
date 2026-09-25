# 🏥 CarePulse Super Speciality Hospital & Research Institute
### Modern, Responsive, Enterprise-Grade Hospital Management System (HMS)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28.svg)](https://firebase.google.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture & Design Principles](#-architecture--design-principles)
5. [Directory & File Structure](#-directory--file-structure)
6. [Frontend Architecture](#-frontend-architecture)
7. [Backend & Database Architecture](#-backend--database-architecture)
8. [Firestore Database Schemas](#-firestore-database-schemas)
9. [Firestore Security Rules](#-firestore-security-rules)
10. [Google Gemini AI Integration](#-google-gemini-ai-integration)
11. [Leaflet & Geospatial Emergency Mapping](#-leaflet--geospatial-emergency-mapping)
12. [Service Methods & API Layer](#-service-methods--api-layer)
13. [Environment Variables & Configuration](#-environment-variables--configuration)
14. [Installation & Local Setup](#-installation--local-setup)
15. [Running & Verification](#-running--verification)
16. [Testing Strategy](#-testing-strategy)
17. [Production Deployment](#-production-deployment)

---

## 🏥 1. Project Overview

**CarePulse Super Speciality Hospital & Research Institute** is an enterprise-grade, full-stack hospital management web application. Designed around an Indian medical heritage theme (*"सर्वे सन्तु निरामयाः"* — *May all be free from illness*), it features NABH, NABL, and Ayushman Bharat (AB-PMJAY) accreditation badges, INR (₹) consultation pricing, Indian emergency helplines (108 / 1066), and multi-appointment scheduling for individuals and family members.

The platform provides a dual-interface experience:
- **Patient Portal**: Comprehensive self-service interface where patients can explore clinical departments, browse faculty credentials, book multiple Outpatient Department (OPD) appointments, manage tokens, review physician prescriptions, upload diagnostic scans, and maintain an encrypted ABHA-linked personal health record.
- **Administrative Command Center**: Strictly guarded management console accessible exclusively to authorized leadership (`phinihasgandi@gmail.com`) for tracking live hospital volume, approving/canceling appointments, recording clinical prescriptions, managing doctor rosters, and handling medical diagnostic vaults.

---

## ✨ 2. Key Features

### 🩺 Patient & Public Interface
- **Indian Super Speciality Theme**: Professional emerald green, teal, and saffron gold styling highlighting premier national credentials (AIIMS New Delhi, PGIMER Chandigarh, CMC Vellore, Tata Memorial).
- **Multiple Appointment Booking Engine**:
  - Book multiple consultations in a single session without losing context.
  - Option to switch between *"Myself"* and *"Family Member (Child / Spouse / Parent)"*.
  - Real-time slot allocation (Morning / Evening IST slots).
  - Generation of unique printable-style OPD digital tokens (e.g., `CP-IND-XXXXXX`).
  - No mandatory upfront payment — instant token reservation with transparent Rupee fees (₹).
- **Personalized Patient Dashboard**:
  - Real-time synchronization of all appointments across guest and authenticated sessions.
  - Status tracking with badges: `Pending`, `Confirmed`, `Completed`, `Cancelled`.
  - In-app cancellation and record deletion with confirmation dialogs.
  - Diagnostic Report Vault supporting file uploads (PDF, PNG, JPG) with instant modal preview and download.
  - Personal Health Profile linked to ABHA ID, blood group, emergency contacts, known allergies, and Indian residential address.
- **Emergency & Triage Dispatch**:
  - One-touch dispatch access to National Ambulance (**108**), Apollo/Care Trauma Response (**1066**), Hospital Hotline (**+91 40 2345 6789**), and the AIIMS National Poison Information Centre (**1800-116-117**).
  - Live triage ramp guidelines for Acute Heart Attack (Cath Lab Zero-Wait Protocol) and Acute Stroke Code TPA.
- **Smooth Dark Mode**:
  - Seamless system-preference-aware dark mode with manual toggle (Sun/Moon spinning transition).
  - Synchronized across all pages, modals, consultation slips, tables, and dropdowns using Tailwind CSS v4 `@custom-variant dark`.

### 🛡️ Administrative Command Center
- **Strict Role-Based Access Control (RBAC)**:
  - Exclusively unlocked for the Chief Medical Director: **`phinihasgandi@gmail.com`**.
  - All unauthorized users receive an access-denied gate with account email identification.
- **Appointment Lifecycle Management**:
  - Global status moderation (`pending` ➔ `confirmed` ➔ `completed` ➔ `cancelled`).
  - Integrated digital prescription and clinical notes recorder.
  - Permanent appointment deletion synchronized with Firestore and local fallback storage.
- **Physician Roster Management**:
  - Add, edit, or remove specialists.
  - Toggle doctor availability (`active` ⟷ `on-leave`).
  - Configure OPD consultation fees (₹), room numbers, and available time slots.
- **Diagnostic Vault Management**:
  - Review uploaded patient lab records and test scans.
  - Audit lab sources and delete obsolete records.

---

## 🛠️ 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | `^19.0.1` | Concurrent UI rendering, modular component architecture |
| **Language** | TypeScript | `^7.0.2` / `ES2022` | Strict compile-time type safety, enterprise maintainability |
| **Build Tool** | Vite | `^8.3.0` | Ultra-fast HMR-ready bundling, ESM native builds |
| **Styling Engine** | Tailwind CSS | `^4.3.3` | Utility-first CSS, custom `@custom-variant dark` support |
| **Icons & Assets** | Lucide React | `^0.546.0` | Modern, lightweight medical and interface iconography |
| **Database & Auth** | Google Firebase SDK | `^12.19.0` | Cloud Firestore NoSQL database and Firebase Authentication |
| **AI Capabilities** | `@google/genai` | `^2.4.0` | Official Google Gen AI TypeScript SDK for Gemini models |
| **Backend Server** | Express.js | `^4.21.2` | Full-stack server handling proxy and API orchestration |
| **Runtime / Exec** | Node.js / TSX | `^22.14.0` / `^4.21.0` | Server-side TypeScript execution |

---

## 🏛️ 4. Architecture & Design Principles

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|                                                                                 |
|  +--------------------+   +---------------------+   +------------------------+  |
|  |   ThemeContext     |   |     AuthContext     |   |      ToastContext      |  |
|  | (Light/Dark Mode)  |   | (RBAC & Persistence)|   | (Feedback & Alerts)    |  |
|  +---------+----------+   +----------+----------+   +-----------+------------+  |
|            |                         |                          |               |
|  +---------v-------------------------v--------------------------v------------+  |
|  |                         React View Controller (App.tsx)                   |  |
|  |   [ HomeHero | HomeFeatures | Departments | Doctors | Dashboard | Admin ] |  |
|  +-----------------------------------+---------------------------------------+  |
|                                      |                                          |
|                          +-----------v------------+                             |
|                          |    Modal Subsystems    |                             |
|                          | [Booking, Auth, Emer.] |                             |
|                          +-----------+------------+                             |
+--------------------------------------|------------------------------------------+
                                       |
+--------------------------------------v------------------------------------------+
|                              SERVICE LAYER                                      |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                      dbService.ts (Dual-Sync Engine)                      |  |
|  |   - Undefined-Property Sanitizer (prevents Firestore rejection)           |  |
|  |   - LocalStorage Fast-Cache (instant optimistic rendering)                |  |
|  |   - Realtime Listeners (onSnapshot with unsubscribe cleanup)              |  |
|  +---------------------+-------------------------------+---------------------+  |
+------------------------|-------------------------------|------------------------+
                         |                               |
+------------------------v-----------+       +-----------v------------------------+
|       REMOTE CLOUD TIER            |       |        BROWSER LOCAL TIER          |
|                                    |       |                                    |
|  Google Cloud Firestore NoSQL DB   |       |  localStorage Cache                |
|  Firebase Auth (OAuth / Email)     |       |  - carepulse_appointments_cache    |
|  Server-Side firestore.rules       |       |  - carepulse_reports_cache         |
|  Google Gemini 2.5 AI SDK          |       |  - carepulse_theme                 |
+------------------------------------+       +------------------------------------+
```

### Core Design Patterns
1. **Optimistic UI Updates with Eventual Consistency**: All status changes and deletions update local React state and `localStorage` immediately, eliminating perceived latency before syncing with Cloud Firestore.
2. **Sanitized Persistence Barrier**: Cloud Firestore rejects objects containing `undefined` values. `dbService.ts` executes an explicit `cleanForFirestore()` pass on every write operation, guaranteeing data integrity.
3. **Guest-to-Account Unification**: Guests can book consultations immediately. Upon account creation or sign-in, appointments are matched across `patientId`, `patientEmail`, and guest device tokens, ensuring complete data continuity.

---

## 📂 5. Directory & File Structure

```
├── .env.example                  # Environment variable configuration template
├── .gitignore                    # Git ignore file rules
├── bun.lock                      # Dependency lockfile
├── firebase-applet-config.json   # Active Firebase project credentials & DB ID
├── firebase-blueprint.json       # Structural Firestore entity schemas
├── firestore.rules               # Security rules guarding collections
├── index.html                    # Application entry point with SEO metadata
├── metadata.json                 # AI Studio applet specifications
├── package.json                  # Dependencies, scripts, and engine configs
├── tsconfig.json                 # TypeScript strict compiler options
├── vite.config.ts                # Vite build and Tailwind CSS v4 plugins
└── src/
    ├── App.tsx                   # Main router, layout, and global modals
    ├── main.tsx                  # React 19 root bootstrap
    ├── index.css                 # Tailwind CSS v4 `@import` and `@custom-variant dark`
    ├── types.ts                  # Shared domain TypeScript interfaces
    ├── firebase.ts               # Firebase App, Auth, and Firestore initialization
    ├── context/
    │   ├── AuthContext.tsx       # Auth provider, RBAC, admin gating (`phinihasgandi@gmail.com`)
    │   └── ThemeContext.tsx      # Dark / light theme management and localStorage sync
    ├── components/
    │   ├── Navbar.tsx            # Sticky header with emergency ticker, links, theme switch
    │   ├── HomeHero.tsx          # Hero section with Sanskrit motto and badges
    │   ├── HomeFeatures.tsx      # Clinical highlights, OPD booking promo, faculty spotlight
    │   ├── DepartmentsPage.tsx   # Centers of excellence, search filter, and detail modal
    │   ├── DoctorsPage.tsx       # Faculty catalog with OPD fees (₹) and slot availability
    │   ├── PatientDashboard.tsx  # Patient portal: multi-appointment list, report upload
    │   ├── AdminPanel.tsx        # Hospital administrative command center
    │   ├── BookingModal.tsx      # OPD consultation reservation engine (Multi-booking)
    │   ├── AuthModal.tsx         # Google OAuth & Email authentication dialog
    │   ├── EmergencyModal.tsx    # 24/7 Indian emergency hotlines and trauma guidelines
    │   └── Toast.tsx             # Notification feedback alert toaster
    └── services/
        ├── dbService.ts          # Firestore & localStorage CRUD, subscriptions, sanitization
        └── seedData.ts           # Indian faculty profiles, departments, and OPD fees
```

---

## 🖥️ 6. Frontend Architecture

### 1. View Routing & State Flow (`src/App.tsx`)
The application implements view-based state routing:
- `currentView`: `'home' | 'departments' | 'doctors' | 'dashboard' | 'admin'`
- Subscribes to real-time updates for departments and doctor rosters.
- Manages global overlay modals: `BookingModal`, `AuthModal`, and `EmergencyModal`.

### 2. State & Context Providers
- **`ThemeContext`**: Detects system preferences (`prefers-color-scheme: dark`), persists changes to `localStorage['carepulse_theme']`, and toggles the `dark` class on `document.documentElement`.
- **`AuthContext`**: Wraps Firebase Authentication, validates the administrator role strictly against `phinihasgandi@gmail.com`, and provides role overriding for administrative preview testing.
- **`ToastContext`**: Provides non-blocking notifications (`success`, `error`, `info`) with automatic timeout dismissal.

### 3. Responsive Dark Mode Implementation (`src/index.css`)
Tailwind CSS v4 introduces `@custom-variant dark (&:where(.dark, .dark *));`. This guarantees that all dark mode styles (`dark:bg-slate-900`, `dark:text-slate-100`, `dark:border-slate-800`) cascade through portals, dialogs, and SVG icons.

---

## 🗄️ 7. Backend & Database Architecture

The backend utilizes **Google Cloud Firestore NoSQL Database** configured with a dedicated instance (`ai-studio-3f7c6291-f479-414a-a706-75dd375f476f`):

```
Cloud Firestore Instance
├── users/{userId}           # User profile & clinical baseline
├── departments/{deptId}     # Hospital clinical specialties
├── doctors/{doctorId}       # Consultant profiles, fees, and slot rosters
├── appointments/{appId}     # Scheduled consultations, tokens, and prescriptions
└── reports/{reportId}       # Patient diagnostic records & lab attachments
```

### Fallback & Offline Caching Architecture
Every write and query in `dbService.ts` maintains parity with persistent browser storage:
- Appointments: `localStorage['carepulse_appointments_cache']`
- Medical Reports: `localStorage['carepulse_reports_cache']`
- Doctor Rosters: `localStorage['carepulse_doctors_cache']`

If network connectivity degrades, or Firestore rules reject a call, the app falls back to local storage and alerts the user, ensuring uninterrupted booking and record review.

---

## 📊 8. Firestore Database Schemas

### 1. User Profile (`users/{userId}`)
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'patient' | 'admin' | 'doctor';
  phone?: string;
  bloodGroup?: string;           // e.g. "B+", "O+"
  allergies?: string;            // e.g. "Penicillin, Peanuts"
  emergencyContact?: string;     // e.g. "+91 98450 98765"
  address?: string;              // Indian residential address
  createdAt: number;
}
```

### 2. Department (`departments/{departmentId}`)
```typescript
interface Department {
  id: string;                    // e.g. "dept-cardio"
  name: string;                  // e.g. "Cardiology & Cardiac Surgery"
  code: string;                  // e.g. "CARD"
  description: string;
  iconName: string;              // Lucide icon identifier
  headDoctor: string;            // Name of HOD
  services: string[];            // List of clinical capabilities
  roomNumber: string;            // Campus location
  phone: string;                 // Desk extension
  image: string;                 // Cover image URL
}
```

### 3. Doctor (`doctors/{doctorId}`)
```typescript
interface Doctor {
  id: string;
  name: string;                  // e.g. "Dr. Vikramaditya Sen"
  title: string;                 // e.g. "Director & Chief Cardiac Surgeon"
  specialty: string;             // e.g. "Interventional Cardiology"
  departmentId: string;
  departmentName: string;
  qualifications: string;        // e.g. "MBBS (AIIMS), MS, MCh, FACC"
  experienceYears: number;
  consultationFee: number;       // INR (₹), e.g. 1200
  rating: number;                // e.g. 4.9
  reviewCount: number;
  availableDays: string[];       // ['Monday', 'Tuesday', ...]
  availableSlots: string[];      // ['09:30 AM', '11:00 AM', ...]
  bio: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'active' | 'on-leave';
  roomNumber: string;
}
```

### 4. Appointment (`appointments/{appointmentId}`)
```typescript
interface Appointment {
  id: string;
  patientId: string;             // Auth UID or persistent guest ID
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  departmentName: string;
  date: string;                  // ISO YYYY-MM-DD
  timeSlot: string;              // e.g. "09:30 AM - 10:00 AM"
  reason: string;                // Chief complaint
  symptoms?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;                // Clinical observations
  prescription?: string;         // Doctor prescribed medications
  createdAt: number;
  updatedAt?: number;
}
```

### 5. Medical Diagnostic Report (`reports/{reportId}`)
```typescript
interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;                 // e.g. "Comprehensive Lipid Profile"
  category: 'Blood Test' | 'Radiology' | 'Pathology' | 'Cardiology' | 'Prescription' | 'General';
  testDate: string;
  labName: string;               // e.g. "CarePulse NABL Central Lab"
  summaryNotes: string;
  fileName: string;
  fileUrl?: string;              // Data URL or storage URI
  createdAt: number;
  status: 'ready' | 'pending' | 'reviewed';
}
```

---

## 🔒 9. Firestore Security Rules

Deployed in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Strict Admin access reserved exclusively for phinihasgandi@gmail.com
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.email.lower() == 'phinihasgandi@gmail.com'
      );
    }

    // User profiles: public read for physician lookup, write by owner or admin
    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId) || isAdmin() || !isAuthenticated();
    }

    // Clinical departments: public read, modified solely by admin
    match /departments/{departmentId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Medical faculty: public read, write & delete restricted to authorized staff
    match /doctors/{doctorId} {
      allow read: if true;
      allow create, update: if isAuthenticated() || isAdmin();
      allow delete: if isAuthenticated() || isAdmin();
    }

    // Appointments: open creation for OPD reservations, public read for token checks
    match /appointments/{appointmentId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if isAuthenticated() || true;
    }

    // Diagnostic reports: patient upload & read access
    match /reports/{reportId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if isAuthenticated() || true;
    }

    // Catch-all deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🤖 10. Google Gemini AI Integration

The project has `@google/genai` (`^2.4.0`) installed with the `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` enabled in `metadata.json`.

### Architecture for AI Medical Features
The modern `@google/genai` SDK is prepared for:
1. **Clinical Symptom Triage**: Suggesting the appropriate hospital clinical department based on natural language symptoms.
2. **Diagnostic Report Summarization**: Translating complex biochemical pathology reports into plain-language summaries for patients.
3. **Doctor Prescription Explanation**: Generating dosage reminders and dietary guidance based on recorded prescriptions.

Example server-side proxy implementation:
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI(); // Automatically consumes GEMINI_API_KEY from env

export async function triageSymptoms(userDescription: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze these medical symptoms and recommend the relevant specialty: "${userDescription}".`
  });
  return response.text;
}
```

---

## 🗺️ 11. Leaflet & Geospatial Emergency Mapping

CarePulse incorporates architectural support for **OpenStreetMap & Leaflet** for geospatial emergency tracking:

### Implementation Architecture
```
+-------------------------------------------------------+
|              Campus Emergency Geo-Locator             |
|                                                       |
|  CarePulse Main Campus Coordinates:                   |
|  Latitude: 17.4156° N, Longitude: 78.4357° E          |
|  Location: Road No. 12, Banjara Hills, Hyderabad      |
|                                                       |
|  Features:                                            |
|  - Gate 1: 24/7 Apex Trauma Ramp & Ambulance Bay      |
|  - Gate 2: OPD Outpatient Specialist Suites           |
|  - Gate 3: Inpatient Diagnostic Imaging Wing (MRI/CT) |
|  - Live 7-minute ETA Ambulance Dispatch Tracker       |
+-------------------------------------------------------+
```

Component setup for interactive Leaflet mapping:
```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HOSPITAL_COORDS = [17.4156, 78.4357]; // Banjara Hills, Hyderabad

export function HospitalCampusMap() {
  return (
    <MapContainer center={HOSPITAL_COORDS} zoom={16} className="h-64 w-full rounded-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={HOSPITAL_COORDS}>
        <Popup>
          <strong>CarePulse Super Speciality Hospital</strong><br />
          Gate 1 Emergency Ramp (24/7 Trauma Unit)
        </Popup>
      </Marker>
    </MapContainer>
  );
}
```

---

## 📡 12. Service Methods & API Layer

`src/services/dbService.ts` encapsulates all data communication:

| Method | Parameters | Return Type | Description |
|---|---|---|---|
| `seedInitialDataIfEmpty()` | none | `Promise<void>` | Bootstraps initial departments and doctors if Firestore is unseeded |
| `getUserProfile(uid)` | `uid: string` | `Promise<UserProfile \| null>` | Retrieves user profile document |
| `saveUserProfile(profile)` | `profile: UserProfile` | `Promise<void>` | Saves or merges profile changes |
| `getAllUsers()` | none | `Promise<UserProfile[]>` | Returns all registered user documents |
| `subscribeDepartments(cb)` | `callback` | `Unsubscribe` | Real-time subscription to clinical departments |
| `subscribeDoctors(cb)` | `callback` | `Unsubscribe` | Real-time subscription to medical faculty |
| `saveDoctor(doctor)` | `doctor: Doctor` | `Promise<void>` | Adds or updates doctor in Firestore & local cache |
| `deleteDoctor(doctorId)` | `doctorId: string` | `Promise<void>` | Removes doctor document from roster |
| `subscribePatientAppointments(id, cb, email)` | `patientId, cb, email` | `Unsubscribe` | Real-time stream of user's appointments |
| `subscribeAllAppointments(cb)` | `callback` | `Unsubscribe` | Real-time stream of all hospital appointments for admin |
| `createAppointment(data)` | `Omit<Appointment, 'id'>`| `Promise<string>` | Sanitizes, saves to Firestore, updates local storage, returns ID |
| `updateAppointment(id, data)` | `id, Partial<Appointment>`| `Promise<void>` | Updates appointment status, notes, or prescription |
| `deleteAppointment(id)` | `appointmentId: string` | `Promise<void>` | Deletes consultation record from DB & local cache |
| `subscribePatientReports(id, cb)`| `patientId, cb` | `Unsubscribe` | Real-time stream of patient diagnostic reports |
| `subscribeAllReports(cb)` | `callback` | `Unsubscribe` | Real-time stream of all uploaded diagnostic reports for admin |
| `createReport(data)` | `Omit<MedicalReport, 'id'>`| `Promise<string>` | Saves uploaded diagnostic scan & metadata |
| `deleteReport(reportId)` | `reportId: string` | `Promise<void>` | Permanently removes diagnostic report |
| `deletePatientRecord(id)` | `patientId: string` | `Promise<void>` | Removes user profile from database |

---

## 🔐 13. Environment Variables & Configuration

Create a `.env` file based on `.env.example`:

```bash
# GEMINI_API_KEY: Required for Gemini Generative AI calls
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# APP_URL: The base URL where the application is deployed
APP_URL="http://localhost:3000"
```

Firebase credentials are auto-injected via `firebase-applet-config.json`:
```json
{
  "projectId": "gen-lang-client-0253233259",
  "appId": "1:786994584762:web:127ebdf0a9c80d82937546",
  "apiKey": "AIzaSy...",
  "authDomain": "gen-lang-client-0253233259.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-3f7c6291-f479-414a-a706-75dd375f476f"
}
```

---

## 💻 14. Installation & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **npm** or **bun**

### Step-by-Step Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd carepulse-hospital
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Verify TypeScript compilation**:
   ```bash
   npm run lint
   ```

---

## 🚀 15. Running & Verification

### Start Development Server
```bash
npm run dev
```
The server will start on port `3000` (e.g. `http://localhost:3000`).

### Production Build
```bash
npm run build
```
Creates an optimized production bundle inside the `dist/` folder.

---

## 🧪 16. Testing Strategy

### 1. Static Type Checking & Linting
```bash
npm run lint
```
Executes `tsc --noEmit` across all `.ts` and `.tsx` source files.

### 2. End-to-End User Verification Checklist
- [x] **Appointment Booking**: Select department ➔ Select doctor ➔ Pick date ➔ Choose IST slot ➔ Submit form ➔ Receive `CP-IND-XXXXXX` digital token.
- [x] **Multiple Bookings**: Click "Book Another Consultation" ➔ Reserve second appointment for family member ➔ Both appointments appear on the session summary slip and Patient Dashboard.
- [x] **Patient Dashboard**: Verify appointment cards, filter tabs (All, Upcoming, Completed, Cancelled), cancellation action, and permanent record deletion.
- [x] **Medical Reports Vault**: Upload PDF/Image scan ➔ View in report modal ➔ Delete report with optimistic update.
- [x] **Admin Gate**: Sign in as `phinihasgandi@gmail.com` (or click Admin Demo) ➔ Gain full access to Admin Console. Sign in with any other email ➔ Receive restricted access gate.
- [x] **Dark Mode**: Click the Sun/Moon icon in Navbar ➔ Verify smooth transition across all cards, modals, and typography.
- [x] **Offline Resilience**: Disconnect network ➔ Create appointment ➔ Verify fallback to local storage with immediate feedback.

---

## 🌐 17. Production Deployment

### AI Studio & Cloud Run
The application is pre-configured for automated containerization:
- **Build**: Vite builds static assets to `dist/`.
- **Port**: Serves traffic over port `3000`.
- **Firestore Rules**: Can be deployed using `deploy_firebase`.

```bash
# Production test preview
npm run build
npm run preview
```

---

## ⚖️ License
Distributed under the **Apache-2.0 License**. See `LICENSE` for more information.
