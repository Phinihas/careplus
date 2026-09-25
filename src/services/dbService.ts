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

// Collections names
const DEPARTMENTS_COL = 'departments';
const DOCTORS_COL = 'doctors';
const APPOINTMENTS_COL = 'appointments';
const REPORTS_COL = 'reports';
const USERS_COL = 'users';

// In-memory fallbacks to guarantee robust local state if Firestore permissions or transient latency occur
let localDoctorsCache: Doctor[] = [...INITIAL_DOCTORS];
let localAppointmentsCache: Appointment[] = [];
let localReportsCache: MedicalReport[] = [];

// Seed initial data if database is empty or needs update
export async function seedInitialDataIfEmpty() {
  try {
    const deptSnap = await getDocs(collection(db, DEPARTMENTS_COL));
    if (deptSnap.empty) {
      console.log('Seeding initial departments to Firestore...');
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, DEPARTMENTS_COL, dept.id), dept);
      }
    }

    const docSnap = await getDocs(collection(db, DOCTORS_COL));
    if (docSnap.empty) {
      console.log('Seeding initial doctors to Firestore...');
      for (const doctor of INITIAL_DOCTORS) {
        await setDoc(doc(db, DOCTORS_COL, doctor.id), doctor);
      }
    }
  } catch (error) {
    console.warn('Seeding fallback (using in-memory initial data if permission denied or offline):', error);
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

export async function saveUserProfile(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  try {
    const ref = doc(db, USERS_COL, profile.uid);
    await setDoc(ref, profile, { merge: true });
  } catch (err) {
    console.warn('Error saving user profile to Firestore:', err);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COL));
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (err) {
    console.error('Error fetching all users:', err);
    return [];
  }
}

// ----------------- DEPARTMENTS -----------------
export function subscribeDepartments(callback: (depts: Department[]) => void) {
  try {
    return onSnapshot(collection(db, DEPARTMENTS_COL), (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_DEPARTMENTS);
      } else {
        const list: Department[] = [];
        snapshot.forEach((d) => list.push(d.data() as Department));
        callback(list);
      }
    }, (err) => {
      console.warn('Firestore departments subscription error, using local fallback:', err);
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
  // Update local cache first
  const existingIdx = localDoctorsCache.findIndex(d => d.id === doctor.id);
  if (existingIdx >= 0) {
    localDoctorsCache[existingIdx] = doctor;
  } else {
    localDoctorsCache.push(doctor);
  }

  // Persist to Firestore
  try {
    const docRef = doc(db, DOCTORS_COL, doctor.id);
    await setDoc(docRef, doctor, { merge: true });
  } catch (err) {
    console.warn('Firestore save doctor error:', err);
    // Even if Firestore has transient error, local state updated
  }
}

export async function deleteDoctor(doctorId: string): Promise<void> {
  // Update local cache
  localDoctorsCache = localDoctorsCache.filter(d => d.id !== doctorId);

  // Delete from Firestore
  try {
    const docRef = doc(db, DOCTORS_COL, doctorId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete doctor error:', err);
  }
}

// ----------------- APPOINTMENTS -----------------
export function subscribePatientAppointments(patientId: string, callback: (apps: Appointment[]) => void) {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COL),
      where('patientId', '==', patientId)
    );
    return onSnapshot(q, (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Appointment);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    }, (err) => {
      console.error('Error subscribing patient appointments:', err);
      // Fallback from cache
      const cached = localAppointmentsCache.filter(a => a.patientId === patientId);
      callback(cached);
    });
  } catch (err) {
    console.error('Error starting appointment subscription:', err);
    const cached = localAppointmentsCache.filter(a => a.patientId === patientId);
    callback(cached);
    return () => {};
  }
}

export function subscribeAllAppointments(callback: (apps: Appointment[]) => void) {
  try {
    const colRef = collection(db, APPOINTMENTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Appointment);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      localAppointmentsCache = list;
      callback(list);
    }, (err) => {
      console.error('Error subscribing all appointments:', err);
      callback(localAppointmentsCache);
    });
  } catch (err) {
    console.error('Error subscribing all appointments:', err);
    callback(localAppointmentsCache);
    return () => {};
  }
}

export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, APPOINTMENTS_COL), appointment);
    const newObj: Appointment = { id: ref.id, ...appointment };
    localAppointmentsCache.unshift(newObj);
    return ref.id;
  } catch (err) {
    console.warn('Firestore create appointment fallback:', err);
    const fallbackId = `app-${Date.now()}`;
    const newObj: Appointment = { id: fallbackId, ...appointment };
    localAppointmentsCache.unshift(newObj);
    return fallbackId;
  }
}

export async function updateAppointment(
  appointmentId: string, 
  data: Partial<Appointment>
): Promise<void> {
  // Update local cache
  const idx = localAppointmentsCache.findIndex(a => a.id === appointmentId);
  if (idx >= 0) {
    localAppointmentsCache[idx] = { ...localAppointmentsCache[idx], ...data, updatedAt: Date.now() };
  }

  try {
    const docRef = doc(db, APPOINTMENTS_COL, appointmentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn('Firestore update appointment error:', err);
  }
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  // Immediately purge from local cache
  localAppointmentsCache = localAppointmentsCache.filter(a => a.id !== appointmentId);

  try {
    const docRef = doc(db, APPOINTMENTS_COL, appointmentId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Firestore delete appointment error:', err);
    throw err;
  }
}

// ----------------- MEDICAL REPORTS -----------------
export function subscribePatientReports(patientId: string, callback: (reports: MedicalReport[]) => void) {
  try {
    const q = query(
      collection(db, REPORTS_COL),
      where('patientId', '==', patientId)
    );
    return onSnapshot(q, (snapshot) => {
      const list: MedicalReport[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as MedicalReport);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    }, (err) => {
      console.error('Error subscribing patient reports:', err);
      const cached = localReportsCache.filter(r => r.patientId === patientId);
      callback(cached);
    });
  } catch (err) {
    console.error('Error subscribing patient reports:', err);
    const cached = localReportsCache.filter(r => r.patientId === patientId);
    callback(cached);
    return () => {};
  }
}

export function subscribeAllReports(callback: (reports: MedicalReport[]) => void) {
  try {
    const colRef = collection(db, REPORTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: MedicalReport[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as MedicalReport);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      localReportsCache = list;
      callback(list);
    }, (err) => {
      console.error('Error subscribing all reports:', err);
      callback(localReportsCache);
    });
  } catch (err) {
    console.error('Error subscribing all reports:', err);
    callback(localReportsCache);
    return () => {};
  }
}

export async function createReport(report: Omit<MedicalReport, 'id'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, REPORTS_COL), report);
    const newRep: MedicalReport = { id: ref.id, ...report };
    localReportsCache.unshift(newRep);
    return ref.id;
  } catch (err) {
    console.warn('Firestore create report fallback:', err);
    const fallbackId = `rep-${Date.now()}`;
    const newRep: MedicalReport = { id: fallbackId, ...report };
    localReportsCache.unshift(newRep);
    return fallbackId;
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  // Purge from local cache
  localReportsCache = localReportsCache.filter(r => r.id !== reportId);

  try {
    const docRef = doc(db, REPORTS_COL, reportId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Firestore delete report error:', err);
    throw err;
  }
}
