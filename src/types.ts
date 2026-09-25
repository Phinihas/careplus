export type UserRole = 'patient' | 'admin' | 'doctor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  address?: string;
  createdAt: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  headDoctor: string;
  services: string[];
  roomNumber: string;
  phone: string;
  doctorCount?: number;
  image?: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  departmentId: string;
  departmentName: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  availableDays: string[];
  availableSlots: string[];
  bio: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'active' | 'on-leave';
  roomNumber: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM"
  reason: string;
  symptoms?: string;
  status: AppointmentStatus;
  notes?: string;
  prescription?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  doctorId?: string;
  doctorName?: string;
  title: string;
  category: 'Blood Test' | 'Radiology' | 'Pathology' | 'Cardiology' | 'Prescription' | 'General';
  testDate: string;
  fileData?: string; // Base64 data URL or dummy blob
  fileName: string;
  fileSize?: string;
  fileType?: string;
  labName: string;
  summaryNotes: string;
  status: 'ready' | 'pending' | 'reviewed';
  createdAt: number;
}
