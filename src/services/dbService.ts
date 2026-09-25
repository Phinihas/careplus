import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from '../firebase';
import { Department, Doctor, Appointment, MedicalReport, UserProfile } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_DOCTORS } from './seedData';

// Collection names
const DEPARTMENTS_COL = 'departments';
const DOCTORS_COL = 'doctors';
const APPOINTMENTS_COL = 'appointments';
const REPORTS_COL = 'reports';
const USERS_COL = 'users';

// Storage keys for offline / high-reliability local caching
const APPOINTMENTS_STORAGE_KEY = 'carepulse_appointments_cache';
const REPORTS_STORAGE_KEY = 'carepulse_reports_cache';
const DOCTORS_STORAGE_KEY = 'carepulse_doctors_cache';

export function loadStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function persistAppointments(list: Appointment[]) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function loadStoredReports(): MedicalReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function persistReports(list: MedicalReport[]) {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function loadStoredDoctors(): Doctor[] {
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...INITIAL_DOCTORS];
}

export function persistDoctors(list: Doctor[]) {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

// In-memory & localStorage cached fallbacks
let localDoctorsCache: Doctor[] = loadStoredDoctors();
let localAppointmentsCache: Appointment[] = loadStoredAppointments();
let localReportsCache: MedicalReport[] = loadStoredReports();

// Helper to remove any undefined fields before Firestore operations
function cleanForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// Seed initial data if database is empty or needs update
export async function seedInitialDataIfEmpty() {
  try {
    const deptSnap = await getDocs(collection(db, DEPARTMENTS_COL));
    if (deptSnap.empty) {
      console.log('Seeding initial departments to Firestore...');
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, DEPARTMENTS_COL, dept.id), cleanForFirestore(dept));
      }
    }

    const docSnap = await getDocs(collection(db, DOCTORS_COL));
    if (docSnap.empty) {
      console.log('Seeding initial doctors to Firestore...');
      for (const doctor of INITIAL_DOCTORS) {
        await setDoc(doc(db, DOCTORS_COL, doctor.id), cleanForFirestore(doctor));
      }
    }
  } catch (error) {
    console.warn('Seeding fallback (using initial data if offline or restricted):', error);
  }
}

// ----------------- USER PROFILE -----------------
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COL, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, USERS_COL, profile.uid);
    await setDoc(userRef, cleanForFirestore(profile), { merge: true });
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COL));
    const list: UserProfile[] = [];
    snap.forEach(d => list.push(d.data() as UserProfile));
    return list;
  } catch (err) {
    console.warn('Error fetching all users, returning empty array:', err);
    return [];
  }
}

// ----------------- DEPARTMENTS -----------------
export function subscribeDepartments(callback: (departments: Department[]) => void) {
  try {
    return onSnapshot(collection(db, DEPARTMENTS_COL), (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_DEPARTMENTS);
      } else {
        const list: Department[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Department));
        callback(list);
      }
    }, (err) => {
      console.warn('Firestore departments subscription error, using fallback:', err);
      callback(INITIAL_DEPARTMENTS);
    });
  } catch (err) {
    callback(INITIAL_DEPARTMENTS);
    return () => {};
  }
}

// ----------------- DOCTORS -----------------
export function subscribeDoctors(callback: (doctors: Doctor[]) => void) {
  try {
    return onSnapshot(collection(db, DOCTORS_COL), (snapshot) => {
      if (snapshot.empty) {
        callback(localDoctorsCache.length > 0 ? localDoctorsCache : INITIAL_DOCTORS);
      } else {
        const list: Doctor[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Doctor));
        localDoctorsCache = list;
        persistDoctors(list);
        callback(list);
      }
    }, (err) => {
      console.warn('Firestore doctors subscription error, using local fallback:', err);
      callback(localDoctorsCache.length > 0 ? localDoctorsCache : INITIAL_DOCTORS);
    });
  } catch (err) {
    callback(localDoctorsCache.length > 0 ? localDoctorsCache : INITIAL_DOCTORS);
    return () => {};
  }
}

export async function saveDoctor(doctor: Doctor): Promise<void> {
  const current = loadStoredDoctors();
  const existingIdx = current.findIndex(d => d.id === doctor.id);
  if (existingIdx >= 0) {
    current[existingIdx] = doctor;
  } else {
    current.unshift(doctor);
  }
  localDoctorsCache = current;
  persistDoctors(current);

  try {
    const docRef = doc(db, DOCTORS_COL, doctor.id);
    await setDoc(docRef, cleanForFirestore(doctor), { merge: true });
  } catch (err) {
    console.warn('Firestore save doctor error:', err);
  }
}

export async function deleteDoctor(doctorId: string): Promise<void> {
  const current = loadStoredDoctors().filter(d => d.id !== doctorId);
  localDoctorsCache = current;
  persistDoctors(current);

  try {
    const docRef = doc(db, DOCTORS_COL, doctorId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete doctor error:', err);
  }
}

// ----------------- APPOINTMENTS (Multiple Booking Support) -----------------
export function subscribePatientAppointments(
  patientId: string, 
  callback: (apps: Appointment[]) => void, 
  patientEmail?: string
) {
  const storedGuestId = typeof window !== 'undefined' ? localStorage.getItem('carepulse_guest_patient_id') : null;

  const matchesPatientFilter = (item: Appointment) => {
    if (item.patientId === patientId) return true;
    if (storedGuestId && item.patientId === storedGuestId) return true;
    if (patientEmail && item.patientEmail && item.patientEmail.toLowerCase() === patientEmail.toLowerCase()) return true;
    return false;
  };

  // Immediate callback from local storage for instant render without waiting for network
  const initialLocal = loadStoredAppointments().filter(matchesPatientFilter);
  initialLocal.sort((a, b) => b.createdAt - a.createdAt);
  callback(initialLocal);

  try {
    const colRef = collection(db, APPOINTMENTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach(d => {
        const item = { id: d.id, ...d.data() } as Appointment;
        if (matchesPatientFilter(item)) {
          list.push(item);
        }
      });

      // Also merge with locally stored appointments
      const stored = loadStoredAppointments();
      for (const item of stored) {
        if (matchesPatientFilter(item) && !list.some(l => l.id === item.id)) {
          list.push(item);
        }
      }

      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    }, (err) => {
      console.warn('Firestore patient appointments subscription error, using local fallback:', err);
      const stored = loadStoredAppointments().filter(matchesPatientFilter);
      stored.sort((a, b) => b.createdAt - a.createdAt);
      callback(stored);
    });
  } catch (err) {
    const stored = loadStoredAppointments().filter(matchesPatientFilter);
    stored.sort((a, b) => b.createdAt - a.createdAt);
    callback(stored);
    return () => {};
  }
}

export function subscribeAllAppointments(callback: (apps: Appointment[]) => void) {
  // Immediate load from local storage
  const initialLocal = loadStoredAppointments();
  initialLocal.sort((a, b) => b.createdAt - a.createdAt);
  callback(initialLocal);

  try {
    const colRef = collection(db, APPOINTMENTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Appointment);
      });
      // Merge with stored appointments so all newly booked appointments appear
      const stored = loadStoredAppointments();
      for (const item of stored) {
        if (!list.some(l => l.id === item.id)) {
          list.push(item);
        }
      }
      list.sort((a, b) => b.createdAt - a.createdAt);
      localAppointmentsCache = list;
      persistAppointments(list);
      callback(list);
    }, (err) => {
      console.warn('Firestore all appointments subscription fallback:', err);
      const stored = loadStoredAppointments();
      stored.sort((a, b) => b.createdAt - a.createdAt);
      callback(stored);
    });
  } catch (err) {
    const stored = loadStoredAppointments();
    stored.sort((a, b) => b.createdAt - a.createdAt);
    callback(stored);
    return () => {};
  }
}

export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
  const cleanData = cleanForFirestore(appointment);
  let docId = '';

  try {
    const ref = await addDoc(collection(db, APPOINTMENTS_COL), cleanData);
    docId = ref.id;
  } catch (err) {
    console.warn('Firestore create appointment fallback:', err);
    docId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const newObj: Appointment = { id: docId, ...appointment };
  const current = loadStoredAppointments();
  const updated = [newObj, ...current.filter(a => a.id !== docId)];
  localAppointmentsCache = updated;
  persistAppointments(updated);
  return docId;
}

export async function updateAppointment(
  appointmentId: string, 
  data: Partial<Appointment>
): Promise<void> {
  const current = loadStoredAppointments();
  const idx = current.findIndex(a => a.id === appointmentId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...data, updatedAt: Date.now() };
    localAppointmentsCache = current;
    persistAppointments(current);
  }

  try {
    const docRef = doc(db, APPOINTMENTS_COL, appointmentId);
    await updateDoc(docRef, cleanForFirestore({
      ...data,
      updatedAt: Date.now()
    }));
  } catch (err) {
    console.warn('Firestore update appointment error:', err);
  }
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const current = loadStoredAppointments().filter(a => a.id !== appointmentId);
  localAppointmentsCache = current;
  persistAppointments(current);

  try {
    const docRef = doc(db, APPOINTMENTS_COL, appointmentId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete appointment error:', err);
  }
}

// ----------------- MEDICAL REPORTS -----------------
export function subscribePatientReports(patientId: string, callback: (reports: MedicalReport[]) => void) {
  const storedGuestId = typeof window !== 'undefined' ? localStorage.getItem('carepulse_guest_patient_id') : null;

  const matchesPatientFilter = (item: MedicalReport) => {
    if (item.patientId === patientId) return true;
    if (storedGuestId && item.patientId === storedGuestId) return true;
    return false;
  };

  const initialLocal = loadStoredReports().filter(matchesPatientFilter);
  initialLocal.sort((a, b) => b.createdAt - a.createdAt);
  callback(initialLocal);

  try {
    const colRef = collection(db, REPORTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: MedicalReport[] = [];
      snapshot.forEach(d => {
        const item = { id: d.id, ...d.data() } as MedicalReport;
        if (matchesPatientFilter(item)) {
          list.push(item);
        }
      });
      // Merge with stored reports
      const stored = loadStoredReports();
      for (const rep of stored) {
        if (matchesPatientFilter(rep) && !list.some(l => l.id === rep.id)) {
          list.push(rep);
        }
      }
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    }, (err) => {
      console.warn('Firestore reports subscription error, using local fallback:', err);
      const stored = loadStoredReports().filter(matchesPatientFilter);
      stored.sort((a, b) => b.createdAt - a.createdAt);
      callback(stored);
    });
  } catch (err) {
    const stored = loadStoredReports().filter(matchesPatientFilter);
    stored.sort((a, b) => b.createdAt - a.createdAt);
    callback(stored);
    return () => {};
  }
}

export function subscribeAllReports(callback: (reports: MedicalReport[]) => void) {
  const initialLocal = loadStoredReports();
  initialLocal.sort((a, b) => b.createdAt - a.createdAt);
  callback(initialLocal);

  try {
    const colRef = collection(db, REPORTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: MedicalReport[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as MedicalReport);
      });
      const stored = loadStoredReports();
      for (const rep of stored) {
        if (!list.some(l => l.id === rep.id)) {
          list.push(rep);
        }
      }
      list.sort((a, b) => b.createdAt - a.createdAt);
      localReportsCache = list;
      persistReports(list);
      callback(list);
    }, (err) => {
      console.warn('Firestore all reports subscription fallback:', err);
      const stored = loadStoredReports();
      stored.sort((a, b) => b.createdAt - a.createdAt);
      callback(stored);
    });
  } catch (err) {
    const stored = loadStoredReports();
    stored.sort((a, b) => b.createdAt - a.createdAt);
    callback(stored);
    return () => {};
  }
}

export async function createReport(report: Omit<MedicalReport, 'id'>): Promise<string> {
  const cleanData = cleanForFirestore(report);
  let docId = '';

  try {
    const ref = await addDoc(collection(db, REPORTS_COL), cleanData);
    docId = ref.id;
  } catch (err) {
    console.warn('Firestore create report fallback:', err);
    docId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const newObj: MedicalReport = { id: docId, ...report };
  const current = loadStoredReports();
  const updated = [newObj, ...current.filter(r => r.id !== docId)];
  localReportsCache = updated;
  persistReports(updated);
  return docId;
}

export async function deleteReport(reportId: string): Promise<void> {
  const current = loadStoredReports().filter(r => r.id !== reportId);
  localReportsCache = current;
  persistReports(current);

  try {
    const docRef = doc(db, REPORTS_COL, reportId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete report error:', err);
  }
}

export async function deletePatientRecord(patientId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COL, patientId);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn('Firestore delete user error:', err);
  }
}
