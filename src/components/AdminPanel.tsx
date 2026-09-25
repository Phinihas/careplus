import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  UserPlus, 
  ShieldCheck, 
  XCircle,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Appointment, Doctor, Department, MedicalReport, UserProfile } from '../types';
import { 
  subscribeAllAppointments, 
  subscribeDoctors, 
  subscribeAllReports, 
  getAllUsers, 
  updateAppointment, 
  deleteAppointment, 
  saveDoctor, 
  deleteDoctor,
  deleteReport,
  deletePatientRecord
} from '../services/dbService';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from './Toast';

interface AdminPanelProps {
  departments: Department[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ departments }) => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'patients' | 'reports'>('appointments');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [patients, setPatients] = useState<UserProfile[]>([]);

  // Filtering states for appointments
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appDeptFilter, setAppDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Doctor modal state
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({
    name: '',
    title: '',
    specialty: '',
    departmentId: '',
    departmentName: '',
    qualifications: '',
    experienceYears: 10,
    consultationFee: 1000,
    rating: 4.9,
    reviewCount: 150,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    phone: '+91 (080) 4122-4400',
    email: '',
    status: 'active',
    roomNumber: 'Dhanvantari Wing - Suite 201'
  });

  // Prescription / Clinical notes modal
  const [clinicalModalApp, setClinicalModalApp] = useState<Appointment | null>(null);
  const [clinicalPrescription, setClinicalPrescription] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Fetch all data with realtime subscriptions
  useEffect(() => {
    const unsubApp = subscribeAllAppointments((apps) => {
      setAppointments(apps);
    });

    const unsubDoc = subscribeDoctors((docs) => {
      setDoctors(docs);
    });

    const unsubRep = subscribeAllReports((reps) => {
      setReports(reps);
    });

    // Fetch all users
    getAllUsers().then(users => {
      setPatients(users);
    });

    return () => {
      unsubApp();
      unsubDoc();
      unsubRep();
    };
  }, []);

  // Strict Admin Gate check: only phinihasgandi@gmail.com can view this panel
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl text-center transition-colors">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Restricted Hospital Command Access</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mb-4">
          This administrative control console is strictly restricted to the Chief Hospital Medical Director 
          at <strong className="text-emerald-800 dark:text-emerald-400 font-mono">{AUTHORIZED_ADMIN_EMAIL}</strong>.
        </p>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm mx-auto text-xs text-slate-500 dark:text-slate-400 mb-6">
          <span>Current Account: </span>
          <strong className="text-slate-800 dark:text-slate-200">{user?.email || 'Not logged in'}</strong>
        </div>
        <p className="text-xs text-slate-400">
          Please sign in with the authorized director email account or use the Admin Demo button in the sign-in modal.
        </p>
      </div>
    );
  }

  // Handle appointment status change
  const handleUpdateStatus = async (appId: string, status: Appointment['status']) => {
    try {
      setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      await updateAppointment(appId, { status });
      showToast('Status Updated', `Appointment marked as ${status}`);
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  // Handle clinical notes and prescription save
  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalModalApp) return;

    try {
      await updateAppointment(clinicalModalApp.id, {
        prescription: clinicalPrescription,
        notes: clinicalNotes,
        status: 'completed'
      });
      setAppointments(prev => prev.map(a => a.id === clinicalModalApp.id ? {
        ...a,
        prescription: clinicalPrescription,
        notes: clinicalNotes,
        status: 'completed'
      } : a));
      showToast('Prescription Saved', 'Clinical advice recorded and consultation marked completed.');
      setClinicalModalApp(null);
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    }
  };

  // Open prescription modal
  const openPrescriptionModal = (app: Appointment) => {
    setClinicalModalApp(app);
    setClinicalPrescription(app.prescription || '');
    setClinicalNotes(app.notes || '');
  };

  // Handle Appointment Deletion - Working correctly with immediate UI update
  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      setAppointments(prev => prev.filter(a => a.id !== appId));
      await deleteAppointment(appId);
      showToast('Appointment Deleted', 'Record was removed from hospital database.');
    } catch (err: any) {
      showToast('Delete Failed', err.message || 'Unable to delete appointment', 'error');
    }
  };

  // Toggle Doctor Active / Leave status
  const handleToggleDoctorStatus = async (doc: Doctor) => {
    const nextStatus = doc.status === 'active' ? 'on-leave' : 'active';
    try {
      setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, status: nextStatus } : d));
      await saveDoctor({ ...doc, status: nextStatus });
      showToast('Doctor Status Updated', `${doc.name} is now ${nextStatus}`);
    } catch (err: any) {
      showToast('Status Change Failed', err.message, 'error');
    }
  };

  // Open Doctor Modal for Add or Edit
  const openDoctorModal = (doctorToEdit?: Doctor) => {
    if (doctorToEdit) {
      setEditingDoctor(doctorToEdit);
      setDoctorForm({ ...doctorToEdit });
    } else {
      setEditingDoctor(null);
      const defaultDept = departments[0];
      setDoctorForm({
        name: '',
        title: 'Senior Consultant Specialist',
        specialty: defaultDept?.name.split('&')[0].trim() || 'General Medicine',
        departmentId: defaultDept?.id || '',
        departmentName: defaultDept?.name || '',
        qualifications: 'MBBS, MD, DNB',
        experienceYears: 12,
        consultationFee: 1000,
        rating: 4.9,
        reviewCount: 45,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
        bio: 'Dedicated medical professional committed to high standard clinical patient care.',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        phone: '+91 (080) 4122-4400',
        email: 'doctor@carepulse.hospital',
        status: 'active',
        roomNumber: 'Dhanvantari Wing - Suite 102'
      });
    }
    setIsDoctorModalOpen(true);
  };

  // Save Doctor
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorForm.name?.trim()) {
      showToast('Name Required', 'Please enter physician name', 'error');
      return;
    }

    try {
      const docId = editingDoctor ? editingDoctor.id : `doc-${Date.now()}`;
      const deptObj = departments.find(d => d.id === doctorForm.departmentId);
      
      const completeDoctor: Doctor = {
        id: docId,
        name: doctorForm.name.trim(),
        title: doctorForm.title || 'Senior Consultant Specialist',
        specialty: doctorForm.specialty || 'General Medicine',
        departmentId: doctorForm.departmentId || departments[0]?.id || 'dept-genmed',
        departmentName: deptObj?.name || doctorForm.departmentName || 'General Medicine',
        qualifications: doctorForm.qualifications || 'MBBS, MD',
        experienceYears: Number(doctorForm.experienceYears) || 10,
        consultationFee: Number(doctorForm.consultationFee) || 1000,
        rating: Number(doctorForm.rating) || 4.9,
        reviewCount: Number(doctorForm.reviewCount) || 50,
        availableDays: doctorForm.availableDays || ['Monday', 'Wednesday', 'Friday'],
        availableSlots: doctorForm.availableSlots || ['09:30 AM', '11:00 AM', '02:30 PM'],
        bio: doctorForm.bio || '',
        avatar: doctorForm.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        phone: doctorForm.phone || '+91 (080) 4122-4400',
        email: doctorForm.email || 'doctor@carepulse.hospital',
        status: doctorForm.status || 'active',
        roomNumber: doctorForm.roomNumber || 'Dhanvantari Wing 101'
      };

      await saveDoctor(completeDoctor);
      setDoctors(prev => {
        const idx = prev.findIndex(d => d.id === completeDoctor.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = completeDoctor;
          return updated;
        }
        return [completeDoctor, ...prev];
      });
      showToast(
        editingDoctor ? 'Doctor Updated' : 'Doctor Added',
        `${completeDoctor.name} record saved to hospital roster.`
      );
      setIsDoctorModalOpen(false);
    } catch (err: any) {
      showToast('Doctor Save Failed', err.message, 'error');
    }
  };

  // Delete Doctor - Working correctly with immediate UI update
  const handleDeleteDoctor = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${docName} from the hospital medical roster?`)) return;
    try {
      setDoctors(prev => prev.filter(d => d.id !== docId));
      await deleteDoctor(docId);
      showToast('Doctor Removed', `${docName} was removed from the roster.`);
    } catch (err: any) {
      showToast('Delete Failed', err.message || 'Unable to delete doctor', 'error');
    }
  };

  // Delete Diagnostic Report - Working correctly
  const handleDeleteReport = async (repId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete medical report: "${title}"?`)) return;
    try {
      setReports(prev => prev.filter(r => r.id !== repId));
      await deleteReport(repId);
      showToast('Report Deleted', 'Diagnostic report was removed from hospital vault.');
    } catch (err: any) {
      showToast('Delete Failed', err.message || 'Unable to delete report', 'error');
    }
  };

  // Delete Patient Record
  const handleDeletePatient = async (patientId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove patient profile for "${name}"?`)) return;
    try {
      setPatients(prev => prev.filter(p => p.uid !== patientId));
      await deletePatientRecord(patientId);
      showToast('Patient Removed', 'Patient profile removed from registry.');
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((app) => {
    if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false;
    if (appDeptFilter !== 'all' && app.departmentName !== appDeptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPatient = app.patientName?.toLowerCase().includes(q);
      const matchDoctor = app.doctorName?.toLowerCase().includes(q);
      const matchReason = app.reason?.toLowerCase().includes(q);
      const matchRef = app.id.toLowerCase().includes(q);
      if (!matchPatient && !matchDoctor && !matchReason && !matchRef) return false;
    }
    return true;
  });

  const pendingApps = appointments.filter(a => a.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in transition-colors duration-300">
      
      {/* Admin Top Header - Indian Hospital Command Aesthetics */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Hospital Command Desk
              </span>
              <span className="text-xs text-emerald-400 font-mono">LIVE CLOUD FIRESTORE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              CarePulse Hospital Administration
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized Director: <strong className="text-amber-300 font-mono">{AUTHORIZED_ADMIN_EMAIL}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openDoctorModal()}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Add Physician</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Total Consultations
            </span>
            <p className="text-2xl font-bold text-white mt-0.5">{appointments.length}</p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pending Triage
            </span>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{pendingApps.length}</p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              Empanelled Doctors
            </span>
            <p className="text-2xl font-bold text-white mt-0.5">{doctors.length}</p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Registered Patients
            </span>
            <p className="text-2xl font-bold text-white mt-0.5">{patients.length || 1}</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'appointments'
              ? 'border-emerald-700 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments Management ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'doctors'
              ? 'border-emerald-700 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors Roster ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'patients'
              ? 'border-emerald-700 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patient Registry ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'border-emerald-700 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Diagnostic Reports Vault ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS MANAGEMENT */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient, doctor, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Triage ({pendingApps.length})</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={appDeptFilter}
                onChange={(e) => setAppDeptFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
              Showing {filteredAppointments.length} of {appointments.length} consultations
            </span>
          </div>

          {/* Appointments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Ref Code</th>
                    <th className="py-3.5 px-4">Patient Details</th>
                    <th className="py-3.5 px-4">Attending Doctor</th>
                    <th className="py-3.5 px-4">Date & Slot (IST)</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No appointments found matching filter criteria
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          CP-{app.id.slice(0, 6).toUpperCase()}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{app.patientName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.patientEmail}</p>
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium">{app.patientPhone}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{app.doctorName}</p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">{app.doctorSpecialty}</p>
                          <p className="text-[11px] text-slate-400">{app.departmentName}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 dark:text-white">{app.date}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{app.timeSlot}</p>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="truncate font-medium text-slate-800 dark:text-slate-200">{app.reason}</p>
                          {app.symptoms && (
                            <p className="text-[11px] text-slate-400 truncate">{app.symptoms}</p>
                          )}
                          {app.prescription && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-medium text-[10px] border border-emerald-200 dark:border-emerald-800">
                              Rx Attached
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              app.status === 'confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : app.status === 'completed'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                : app.status === 'cancelled'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                                className="py-1 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors shadow-xs cursor-pointer"
                                title="Confirm Appointment"
                              >
                                Confirm
                              </button>
                            )}

                            <button
                              onClick={() => openPrescriptionModal(app)}
                              className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Add Prescription / Rx Notes"
                            >
                              Rx Slip
                            </button>

                            {app.status !== 'completed' && app.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'completed')}
                                className="py-1 px-2 rounded-lg bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Mark Completed"
                              >
                                Done
                              </button>
                            )}

                            {/* Delete Appointment button */}
                            <button
                              onClick={() => handleDeleteApp(app.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Appointment Record"
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

      {/* TAB 2: DOCTORS ROSTER */}
      {activeTab === 'doctors' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Empanelled Doctors & Surgeons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage clinical specialists, OPD consult fees (₹), clinic suites, and leave status</p>
            </div>
            <button
              onClick={() => openDoctorModal()}
              className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-emerald-100 dark:border-slate-700"
                    />
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          doc.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        ₹{doc.consultationFee} OPD Fee
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{doc.name}</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{doc.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.departmentName}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{doc.qualifications} • {doc.experienceYears} yrs experience</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <p><strong>Room:</strong> {doc.roomNumber || 'OPD Suite'}</p>
                    <p><strong>Available Days:</strong> {doc.availableDays.join(', ')}</p>
                    <p><strong>Phone:</strong> {doc.phone}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                  <button
                    onClick={() => handleToggleDoctorStatus(doc)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer"
                  >
                    Toggle {doc.status === 'active' ? 'Leave' : 'Active'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openDoctorModal(doc)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Doctor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {/* Delete Doctor button */}
                    <button
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Doctor from Roster"
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

      {/* TAB 3: PATIENT REGISTRY */}
      {activeTab === 'patients' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center transition-colors">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">CarePulse Registered Patients (EHR)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated user medical identities, emergency contacts, and blood groups</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {patients.length} Registered Patients
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Patient Profile</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Blood Group</th>
                    <th className="py-3.5 px-4">Known Allergies</th>
                    <th className="py-3.5 px-4">Emergency Contact</th>
                    <th className="py-3.5 px-4 text-right">Consultations / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {patients.map((pat) => {
                    const patApps = appointments.filter(a => a.patientId === pat.uid);
                    return (
                      <tr key={pat.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                              {pat.displayName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{pat.displayName}</p>
                              <span className="font-mono text-[10px] text-slate-400">UID: {pat.uid.slice(0, 6)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {pat.email}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {pat.phone || '+91 98450 12345'}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            {pat.bloodGroup || 'B+'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {pat.allergies || 'None reported'}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {pat.emergencyContact || '+91 98450 98765'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{patApps.length} visits</span>
                            <button
                              onClick={() => handleDeletePatient(pat.uid, pat.displayName || pat.email)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIAGNOSTIC REPORTS HUB */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center transition-colors">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Hospital Pathology & Diagnostic Vault</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cross-department patient records, blood work, and imaging scans</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {reports.length} Total Reports
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                      {rep.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{rep.testDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rep.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Patient: <strong className="text-slate-800 dark:text-slate-200">{rep.patientName}</strong></p>
                  <p className="text-[11px] text-slate-400 mt-1">{rep.labName}</p>

                  <p className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {rep.summaryNotes}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-3">
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">{rep.fileName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">Ready</span>
                    {/* Delete Report button */}
                    <button
                      onClick={() => handleDeleteReport(rep.id, rep.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1 cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DOCTOR */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full overflow-hidden text-slate-800 dark:text-slate-100 my-8 transition-colors">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingDoctor ? 'Edit Doctor Profile' : 'Add New Clinical Specialist'}
                </h3>
              </div>
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    placeholder="e.g. Dr. Raghavan Nair"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Title</label>
                  <input
                    type="text"
                    value={doctorForm.title}
                    onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                    placeholder="e.g. Senior Consultant Cardiologist"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={doctorForm.departmentId}
                    onChange={(e) => {
                      const sel = departments.find(d => d.id === e.target.value);
                      setDoctorForm({
                        ...doctorForm,
                        departmentId: e.target.value,
                        departmentName: sel?.name || ''
                      });
                    }}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    placeholder="e.g. Interventional Cardiologist"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={doctorForm.qualifications}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                    placeholder="MBBS, MD, DM, AIIMS"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={doctorForm.experienceYears}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: Number(e.target.value) })}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={doctorForm.consultationFee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    placeholder="dr.name@carepulse.hospital"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Direct Phone</label>
                  <input
                    type="tel"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    placeholder="+91 (080) 4122-4400"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinic Room / OPD Location</label>
                <input
                  type="text"
                  value={doctorForm.roomNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, roomNumber: e.target.value })}
                  placeholder="Dhanvantari Wing - OPD Suite 305"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Biography & Credentials</label>
                <textarea
                  rows={3}
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  placeholder="Physician expertise, specialized surgical procedures, patient care philosophy..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLINICAL PRESCRIPTION & NOTES */}
      {clinicalModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Add Clinical Notes & Prescription (Rx)</h3>
              </div>
              <button
                onClick={() => setClinicalModalApp(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1 text-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700">
                <p><strong>Patient:</strong> {clinicalModalApp.patientName} ({clinicalModalApp.patientEmail})</p>
                <p><strong>Attending:</strong> {clinicalModalApp.doctorName} • {clinicalModalApp.departmentName}</p>
                <p><strong>Chief Complaint:</strong> {clinicalModalApp.reason}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physician Prescription & Dosage (Rx)
                </label>
                <textarea
                  rows={3}
                  required
                  value={clinicalPrescription}
                  onChange={(e) => setClinicalPrescription(e.target.value)}
                  placeholder="e.g. 1. Tab Paracetamol 650mg TDS x 3 days&#10;2. Tab Pantoprazole 40mg OD before breakfast x 5 days&#10;3. Adequate hydration & follow up after 1 week"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Clinical Notes & Follow-up Plan
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Vitals stable. BP: 120/80 mmHg. Advised CBC and ultrasound abdomen if pain persists."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClinicalModalApp(null)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Save & Complete Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
