import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  User, 
  HeartPulse, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  Activity, 
  ShieldAlert, 
  Phone, 
  MapPin, 
  FileCheck,
  Stethoscope,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Printer,
  PlusCircle
} from 'lucide-react';
import { Appointment, MedicalReport, UserProfile } from '../types';
import { 
  subscribePatientAppointments, 
  subscribePatientReports, 
  updateAppointment, 
  deleteAppointment,
  createReport, 
  deleteReport, 
  saveUserProfile 
} from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface PatientDashboardProps {
  onBookNewAppointment: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onBookNewAppointment }) => {
  const { user, profile, updateProfileDetails } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'reports' | 'profile'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [reportFilter, setReportFilter] = useState<string>('all');
  
  // Upload report modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState<MedicalReport['category']>('Blood Test');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState('CarePulse Central Diagnostic Laboratory (NABL Accredited)');
  const [reportNotes, setReportNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Selected report preview modal
  const [viewingReport, setViewingReport] = useState<MedicalReport | null>(null);

  // Selected appointment details modal
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phone: '',
    bloodGroup: '',
    allergies: '',
    emergencyContact: '',
    address: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Determine active patient UID (user.uid or guest device id)
  const activePatientId = user?.uid || (typeof window !== 'undefined' ? localStorage.getItem('carepulse_guest_patient_id') || 'guest_default' : 'guest_default');

  // Realtime subscription for user's appointments and reports
  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        phone: profile.phone || '+91 98765 43210',
        bloodGroup: profile.bloodGroup || 'B+',
        allergies: profile.allergies || 'None reported',
        emergencyContact: profile.emergencyContact || 'Family +91 98765 12345',
        address: profile.address || 'Banjara Hills, Hyderabad, Telangana'
      });
    } else {
      const savedName = localStorage.getItem('carepulse_last_patient_name') || 'Guest Patient';
      const savedPhone = localStorage.getItem('carepulse_last_patient_phone') || '+91 98765 43210';
      setProfileForm(prev => ({
        ...prev,
        displayName: savedName,
        phone: savedPhone
      }));
    }

    const unsubApp = subscribePatientAppointments(activePatientId, (apps) => {
      setAppointments(apps);
    }, user?.email || undefined);

    const unsubRep = subscribePatientReports(activePatientId, (reps) => {
      setReports(reps);
    });

    return () => {
      unsubApp();
      unsubRep();
    };
  }, [user, profile, activePatientId]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment consultation?')) return;
    try {
      setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: 'cancelled' } : a));
      await updateAppointment(appId, { status: 'cancelled' });
      showToast('Appointment Cancelled', 'The consultation has been marked as cancelled.');
    } catch (err: any) {
      showToast('Cancellation Failed', err.message, 'error');
    }
  };

  // Permanently delete appointment record
  const handleDeleteAppointment = async (appId: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment record from your history?')) return;
    try {
      setAppointments(prev => prev.filter(a => a.id !== appId));
      await deleteAppointment(appId);
      showToast('Appointment Deleted', 'The appointment record has been permanently removed.');
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  // Handle report file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Medical Report
  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      showToast('Validation Error', 'Please enter a title for the medical report.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const newReport: Omit<MedicalReport, 'id'> = {
        patientId: activePatientId,
        patientName: profile?.displayName || user?.displayName || profileForm.displayName || 'Patient',
        title: reportTitle.trim(),
        category: reportCategory,
        testDate: testDate,
        labName: labName.trim() || 'CarePulse Diagnostic Labs (NABL)',
        summaryNotes: reportNotes.trim() || 'Diagnostic review recorded in patient health portal.',
        fileName: selectedFileName || 'Report_Document.pdf',
        fileData: fileBase64 || undefined,
        status: 'ready',
        createdAt: Date.now()
      };

      const docId = await createReport(newReport);
      setReports(prev => [{ id: docId, ...newReport }, ...prev]);
      
      showToast('Report Uploaded', 'Medical document saved securely to your patient portal.');
      setIsUploadModalOpen(false);
      setReportTitle('');
      setReportNotes('');
      setSelectedFileName('');
      setFileBase64(null);
    } catch (err: any) {
      showToast('Upload Failed', err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Report with optimistic update
  const handleDeleteReport = async (repId: string) => {
    if (!confirm('Are you sure you want to delete this report from your medical history?')) return;
    try {
      setReports(prev => prev.filter(r => r.id !== repId));
      await deleteReport(repId);
      showToast('Report Removed', 'The file was deleted from your records.');
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      if (user) {
        await updateProfileDetails(profileForm);
      } else {
        localStorage.setItem('carepulse_last_patient_name', profileForm.displayName);
        localStorage.setItem('carepulse_last_patient_phone', profileForm.phone);
      }
      showToast('Profile Updated', 'Your medical records profile has been updated.');
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    if (appointmentFilter === 'all') return true;
    if (appointmentFilter === 'upcoming') return app.status === 'pending' || app.status === 'confirmed';
    if (appointmentFilter === 'completed') return app.status === 'completed';
    if (appointmentFilter === 'cancelled') return app.status === 'cancelled';
    return true;
  });

  // Filtered reports
  const filteredReports = reports.filter((rep) => {
    if (reportFilter === 'all') return true;
    return rep.category.toLowerCase() === reportFilter.toLowerCase();
  });

  const upcomingCount = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in transition-colors duration-300">
      
      {/* Guest Mode Banner if not logged in */}
      {!user && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-sm">Guest Patient Access</span>
              <span>Showing appointments booked on this device. Sign in or register to sync your records permanently.</span>
            </div>
          </div>
          <button
            onClick={onBookNewAppointment}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs"
          >
            + Book Another Consultation
          </button>
        </div>
      )}

      {/* Patient Portal Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 absolute top-0 left-0" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-extrabold text-2xl shadow-inner">
              {(profile?.displayName || user?.displayName || profileForm.displayName || 'P')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {profile?.displayName || user?.displayName || profileForm.displayName || 'Valued Patient'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  {user ? 'ABHA Linked' : 'Active Guest'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1 flex flex-wrap items-center gap-3">
                <span>UHID: <strong className="font-mono text-white">CP-IND-{activePatientId.slice(0, 6).toUpperCase()}</strong></span>
                <span>•</span>
                <span>Total Booked: <strong className="text-amber-300 font-bold">{appointments.length} Consultations</strong></span>
                <span>•</span>
                <span>Blood Group: <strong className="text-white">{profileForm.bloodGroup || 'B+'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={onBookNewAppointment}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Book Doctor Consultation (₹)</span>
            </button>
          </div>
        </div>

        {/* Tab navigation pills */}
        <div className="flex items-center gap-2 mt-8 border-t border-white/10 pt-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-2 px-4 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <span>OPD Appointments</span>
            {appointments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px]">
                {appointments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-4 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <span>Lab & Radiology Reports</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px]">
              {reports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            Health Profile
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Upcoming OPD Visits</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{upcomingCount}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Diagnostic Lab Reports</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{reports.length}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Consultations</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{appointments.length}</h3>
              </div>
            </div>
          </div>

          {/* Next Upcoming Appointment Card */}
          {upcomingCount > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Next Scheduled Consultation
                </span>
                <button
                  onClick={onBookNewAppointment}
                  className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book another appointment</span>
                </button>
              </div>

              {(() => {
                const nextApp = appointments.find(a => a.status === 'pending' || a.status === 'confirmed');
                if (!nextApp) return null;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{nextApp.doctorName}</h4>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">{nextApp.doctorSpecialty}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{nextApp.departmentName}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span className="font-semibold">{nextApp.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>Slot: <strong>{nextApp.timeSlot}</strong></span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Reason: <span className="font-medium text-slate-800 dark:text-slate-200">{nextApp.reason}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-center inline-block ${
                        nextApp.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                      }`}>
                        STATUS: {nextApp.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setViewingAppointment(nextApp)}
                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-center transition-colors cursor-pointer"
                      >
                        View OPD Consultation Slip
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center transition-colors">
              <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Upcoming Consultations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                You have no pending appointments. Browse our specialists to schedule your visit.
              </p>
              <button
                onClick={onBookNewAppointment}
                className="py-2.5 px-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Book Doctor Appointment</span>
              </button>
            </div>
          )}

          {/* Quick Health Summary & Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  Health Record & ABHA Profile
                </h3>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500">Patient Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile?.displayName || user?.displayName || profileForm.displayName || 'Patient'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500">Mobile Number (India)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profileForm.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500">Blood Group</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                    {profileForm.bloodGroup || 'B+'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500">Known Allergies</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{profileForm.allergies || 'None reported'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 dark:text-slate-500">Emergency Contact</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{profileForm.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Recent Reports Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    Recent Diagnostic Records
                  </h3>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {reports.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4">No diagnostic reports uploaded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {reports.slice(0, 3).map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs border border-slate-100 dark:border-slate-700"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{rep.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{rep.category} • {rep.testDate}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingReport(rep)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(rep.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {reports.length > 3 && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className="mt-4 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View all {reports.length} diagnostic reports →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS (Multiple Appointments List) */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button
                onClick={() => setAppointmentFilter('all')}
                className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setAppointmentFilter('upcoming')}
                className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                  appointmentFilter === 'upcoming'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                onClick={() => setAppointmentFilter('completed')}
                className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                  appointmentFilter === 'completed'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setAppointmentFilter('cancelled')}
                className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                  appointmentFilter === 'cancelled'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
              </button>
            </div>

            <button
              onClick={onBookNewAppointment}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Book Another Appointment
            </button>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 transition-colors">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Appointments Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                No appointments matching the selected view. Patients can book multiple appointments with any specialist.
              </p>
              <button
                onClick={onBookNewAppointment}
                className="py-2.5 px-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
              >
                Book Your Consultation Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{app.doctorName}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                              : app.status === 'completed'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300'
                              : app.status === 'cancelled'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold">{app.doctorSpecialty} • {app.departmentName}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          {app.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          {app.timeSlot}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Patient: <strong className="text-slate-800 dark:text-slate-200">{app.patientName}</strong>
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Token: <strong className="font-mono text-emerald-800 dark:text-emerald-400">CP-{app.id.slice(0, 6).toUpperCase()}</strong>
                        </span>
                      </div>

                      {app.reason && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <strong className="text-slate-700 dark:text-slate-300">Chief Complaint:</strong> {app.reason}
                        </p>
                      )}

                      {app.prescription && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
                          <strong className="font-bold block text-emerald-900 dark:text-emerald-300">Physician Prescription & Advice:</strong>
                          <span>{app.prescription}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions including delete and cancel */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setViewingAppointment(app)}
                      className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Slip
                    </button>

                    {(app.status === 'pending' || app.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="py-1.5 px-3 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Permanent Delete Button */}
                    <button
                      onClick={() => handleDeleteAppointment(app.id)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Permanently Delete Appointment Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICAL REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {['all', 'Blood Test', 'Radiology', 'Pathology', 'Cardiology', 'Prescription'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setReportFilter(cat)}
                  className={`py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                    reportFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Diagnostic Categories' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Medical Report
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 transition-colors">
              <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Medical Reports Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                You can upload lab test results, imaging reports (MRI, CT, X-Ray), doctor prescriptions, or blood panels.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
              >
                Upload First Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                        {report.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {report.testDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">{report.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{report.labName}</p>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs mb-4 line-clamp-2">
                      {report.summaryNotes}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">
                      {report.fileName}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingReport(report)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE & MEDICAL INFORMATION */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl animate-in fade-in transition-colors">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Health & Contact Record (ABHA Linked)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These details are encrypted and made accessible to your treating CarePulse clinicians during emergency triage or OPD consultations.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone (+91)</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={profileForm.emergencyContact}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                  placeholder="e.g. Family +91 98765 12345"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Known Medical Allergies (Medications, Food, Latex)
              </label>
              <input
                type="text"
                value={profileForm.allergies}
                onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Peanuts, Sulfa drugs (or 'None reported')"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address (India)</label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Flat / House No., Street, City, State, PIN code"
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="py-2.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSavingProfile ? 'Saving...' : 'Update Health Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: UPLOAD MEDICAL REPORT */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-700 max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            <div className="bg-gradient-to-r from-emerald-950 to-teal-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Upload Diagnostic Report</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReport} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC) Panel, Knee MRI Scan"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Radiology">Radiology (X-Ray / MRI)</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Cardiology">Cardiology (ECG / Echo)</option>
                    <option value="Prescription">Doctor Prescription</option>
                    <option value="General">General Medical Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Test Date</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Laboratory or Diagnostic Center</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="CarePulse Central Diagnostic Laboratory (NABL Accredited)"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnostic Summary / Clinical Notes</label>
                <textarea
                  rows={2}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Key findings, reference range remarks, or doctor suggestions..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700"
                />
              </div>

              {/* File Attachment Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Document (PDF / Image)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="report-file-input"
                  />
                  <label htmlFor="report-file-input" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block">
                      {selectedFileName ? selectedFileName : 'Click to select file from device'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Supports PDF, PNG, JPG up to 10MB
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="py-2 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? 'Saving...' : 'Upload to Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW REPORT SLIP */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            {/* Medical Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-800 text-white rounded-xl">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">CarePulse Super Speciality Hospital</h3>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold">NABL Accredited Diagnostics & Imaging</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingReport(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Document ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white uppercase">REP-IND-{viewingReport.id.slice(0, 8)}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Report Name</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{viewingReport.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400">{viewingReport.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Examination Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingReport.testDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Diagnostic Facility</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{viewingReport.labName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Clinical Findings & Remarks</span>
                <p className="p-3 bg-emerald-50/50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {viewingReport.summaryNotes}
                </p>
              </div>

              {viewingReport.fileData && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">Attached Scan / File</span>
                  {viewingReport.fileData.startsWith('data:image') ? (
                    <img
                      src={viewingReport.fileData}
                      alt="Medical scan"
                      className="max-h-48 rounded-xl object-contain mx-auto border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{viewingReport.fileName}</span>
                      <a
                        href={viewingReport.fileData}
                        download={viewingReport.fileName}
                        className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold">NABL Verified Record</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-1.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW APPOINTMENT SLIP */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            <div className="bg-gradient-to-r from-emerald-950 to-teal-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">OPD Consultation Token</h3>
              </div>
              <button
                onClick={() => setViewingAppointment(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Token ID</span>
                <span className="font-mono font-bold text-emerald-900 dark:text-emerald-400">CP-IND-{viewingAppointment.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Treating Consultant</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{viewingAppointment.doctorName}</h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold">{viewingAppointment.doctorSpecialty} • {viewingAppointment.departmentName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Appointment Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewingAppointment.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Designated Slot</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewingAppointment.timeSlot}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Patient Name & Contact</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{viewingAppointment.patientName} ({viewingAppointment.patientPhone})</p>
              </div>

              {viewingAppointment.reason && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Chief Complaint</span>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">{viewingAppointment.reason}</p>
                </div>
              )}

              {viewingAppointment.prescription && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Physician Prescription & Advice</span>
                  <p className="text-emerald-950 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-medium">
                    {viewingAppointment.prescription}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => setViewingAppointment(null)}
                className="py-1.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
