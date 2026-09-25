import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Stethoscope, 
  HeartPulse, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Doctor, Department, Appointment } from '../types';
import { createAppointment } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  departments: Department[];
  initialDoctorId?: string;
  initialDepartmentId?: string;
  onOpenAuth: (notice?: string) => void;
  onViewDashboard?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctors,
  departments,
  initialDoctorId,
  initialDepartmentId,
  onOpenAuth,
  onViewDashboard
}) => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set today as minimum date
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setConfirmedAppointment(null);
      setErrorMsg(null);

      // Pre-fill patient details if authenticated
      if (profile) {
        setPatientName(profile.displayName || '');
        setPatientEmail(profile.email || '');
        setPatientPhone(profile.phone || '+91 98765 43210');
      } else if (user) {
        setPatientName(user.displayName || '');
        setPatientEmail(user.email || '');
        setPatientPhone('+91 98765 43210');
      } else {
        setPatientPhone('+91 98765 43210');
      }

      // Initialize doctor/department selections
      if (initialDoctorId) {
        const docObj = doctors.find(d => d.id === initialDoctorId);
        if (docObj) {
          setSelectedDoctorId(docObj.id);
          setSelectedDeptId(docObj.departmentId);
          if (docObj.availableSlots && docObj.availableSlots.length > 0) {
            setSelectedTimeSlot(docObj.availableSlots[0]);
          }
        }
      } else if (initialDepartmentId) {
        setSelectedDeptId(initialDepartmentId);
        const matchingDoc = doctors.find(d => d.departmentId === initialDepartmentId && d.status === 'active');
        if (matchingDoc) {
          setSelectedDoctorId(matchingDoc.id);
          if (matchingDoc.availableSlots && matchingDoc.availableSlots.length > 0) {
            setSelectedTimeSlot(matchingDoc.availableSlots[0]);
          }
        }
      } else if (doctors.length > 0) {
        setSelectedDoctorId(doctors[0].id);
        setSelectedDeptId(doctors[0].departmentId);
        if (doctors[0].availableSlots && doctors[0].availableSlots.length > 0) {
          setSelectedTimeSlot(doctors[0].availableSlots[0]);
        }
      }

      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setAppointmentDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen, initialDoctorId, initialDepartmentId, profile, user, doctors]);

  if (!isOpen) return null;

  // Filter doctors by selected department if any
  const availableDoctors = selectedDeptId
    ? doctors.filter(d => d.departmentId === selectedDeptId && d.status === 'active')
    : doctors.filter(d => d.status === 'active');

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || availableDoctors[0];

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const firstDoc = doctors.find(d => d.departmentId === deptId && d.status === 'active');
    if (firstDoc) {
      setSelectedDoctorId(firstDoc.id);
      if (firstDoc.availableSlots && firstDoc.availableSlots.length > 0) {
        setSelectedTimeSlot(firstDoc.availableSlots[0]);
      }
    } else {
      setSelectedDoctorId('');
      setSelectedTimeSlot('');
    }
  };

  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const docObj = doctors.find(d => d.id === docId);
    if (docObj) {
      setSelectedDeptId(docObj.departmentId);
      if (docObj.availableSlots && docObj.availableSlots.length > 0) {
        setSelectedTimeSlot(docObj.availableSlots[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      onOpenAuth('Please sign in or register to confirm your OPD appointment booking.');
      return;
    }

    if (!selectedDoctor) {
      setErrorMsg('Please select a specialist doctor for your consultation.');
      return;
    }

    if (!appointmentDate) {
      setErrorMsg('Please choose an appointment date.');
      return;
    }

    if (!selectedTimeSlot) {
      setErrorMsg('Please select an available OPD time slot.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please briefly describe the chief complaint or reason for consultation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newAppointmentData = {
        patientId: user.uid,
        patientName: patientName.trim() || user.displayName || 'Patient',
        patientEmail: patientEmail.trim() || user.email || '',
        patientPhone: patientPhone.trim() || '+91 98765 43210',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        departmentName: selectedDoctor.departmentName,
        date: appointmentDate,
        timeSlot: selectedTimeSlot,
        reason: reason.trim(),
        symptoms: symptoms.trim() || undefined,
        status: 'pending' as const,
        createdAt: Date.now()
      };

      const docId = await createAppointment(newAppointmentData);
      const savedObj: Appointment = {
        id: docId,
        ...newAppointmentData
      };

      setConfirmedAppointment(savedObj);
      showToast('OPD Appointment Reserved!', `Your appointment with ${selectedDoctor.name} has been booked.`);
    } catch (err: any) {
      console.error('Failed to create appointment:', err);
      setErrorMsg(err.message || 'Failed to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden text-slate-800 my-8">
        
        {/* Modal Header with Indian Green & Gold touches */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-5 sm:p-6 text-white relative">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 absolute top-0 left-0" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Book OPD Doctor Consultation</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
                  CarePulse OPD Desk
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                CarePulse Super Speciality Hospital • Transparent Indian Rupee (₹) OPD fee schedule
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {confirmedAppointment ? (
            /* Confirmation Slip */
            <div className="text-center py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-50">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-1">OPD Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                Your medical consultation token has been generated. Please report 15 minutes prior to the scheduled slot at the hospital reception.
              </p>

              {/* Printable-style OPD Slip */}
              <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3 mb-6 shadow-xs">
                <div className="flex justify-between items-center pb-3 border-b border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px]">CAREPULSE OPD TOKEN</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">
                      CP-IND-{confirmedAppointment.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                    Status: {confirmedAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Treating Consultant</span>
                    <span className="font-bold text-slate-900">{confirmedAppointment.doctorName}</span>
                    <span className="text-xs text-emerald-800 font-medium block">{confirmedAppointment.doctorSpecialty}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Department</span>
                    <span className="font-medium text-slate-800">{confirmedAppointment.departmentName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-emerald-200">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold">{confirmedAppointment.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold">{confirmedAppointment.timeSlot}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">OPD Consultation Fee:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{selectedDoctor?.consultationFee || 800} (Payable at OPD counter)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onViewDashboard && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewDashboard();
                    }}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <span>View in Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Booking Alert</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {!user && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Sign in with your phone or email to link this consultation to your digital patient record.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('Sign in to link and manage your appointments')}
                    className="shrink-0 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Department & Doctor Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    1. Select Clinical Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">All Hospital Specialties</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    2. Select Specialist / Consultant
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    required
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {availableDoctors.length === 0 && <option value="">No doctors available</option>}
                    {availableDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialty} (₹{doc.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Doctor Preview Card */}
              {selectedDoctor && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDoctor.avatar}
                      alt={selectedDoctor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{selectedDoctor.name}</p>
                      <p className="text-emerald-800 font-semibold">{selectedDoctor.title}</p>
                      <p className="text-slate-500 text-[11px]">{selectedDoctor.qualifications} • {selectedDoctor.experienceYears} yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">OPD Consultation</span>
                    <span className="text-base font-extrabold text-emerald-950">₹{selectedDoctor.consultationFee}</span>
                  </div>
                </div>
              )}

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    3. Preferred Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={appointmentDate}
                    required
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    4. Available OPD Slot (IST)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoctor && selectedDoctor.availableSlots?.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient Contact Info */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  5. Patient Details & Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Mobile Number (India)</label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Email ID</label>
                    <input
                      type="email"
                      required
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Reason / Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6. Chief Health Complaint / Reason for Visit
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your health symptoms (e.g., chest discomfort, joint pain, routine pediatric checkup)..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Ayushman Bharat / TPA Cashless counter available
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Confirming Reservation...' : 'Confirm OPD Consultation (₹)'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
