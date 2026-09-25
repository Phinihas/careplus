import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  Clock, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Stethoscope, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Doctor, Department } from '../types';

interface DoctorsPageProps {
  doctors: Doctor[];
  departments: Department[];
  onBookDoctor: (doctorId: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  departments,
  onBookDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDeptId !== 'all' && doc.departmentId !== selectedDeptId) return false;
    if (selectedDay !== 'all' && !doc.availableDays.includes(selectedDay)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSpecialty = doc.specialty.toLowerCase().includes(q);
      const matchQual = doc.qualifications.toLowerCase().includes(q);
      const matchDept = doc.departmentName.toLowerCase().includes(q);
      if (!matchName && !matchSpecialty && !matchQual && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in transition-colors duration-300">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
          Premier Indian Medical Faculty
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
          Meet Our Specialists & Surgeons
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Distinguished medical professors and surgeons from AIIMS, PGI, CMC Vellore, and international fellowships, offering outpatient consultations with transparent OPD fees.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs mb-8 space-y-4 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-700"
            >
              <option value="all">All Specialties & Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Day of week filter */}
          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-700"
            >
              <option value="all">Any Day of the Week</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>Available on {day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Department Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Specialty:
          </span>
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`py-1 px-3 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({doctors.length})
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`py-1 px-3 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedDeptId === dept.id
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dept.name.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Specialists Match Filter Criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search keywords, department selection, or availability day.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDeptId('all'); setSelectedDay('all'); }}
            className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Doctor Avatar Header */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* INR Fee badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold shadow-xs backdrop-blur-xs flex items-center gap-0.5">
                    <span className="text-[10px] text-slate-400 font-normal">OPD</span>
                    <span>₹{doc.consultationFee}</span>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-700/90 text-white text-xs font-bold backdrop-blur-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>{doc.rating}</span>
                    </div>
                    <span className="text-[11px] text-slate-200">({doc.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800 inline-block mb-1">
                    {doc.specialty}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{doc.title}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">{doc.qualifications}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span><strong>{doc.experienceYears} Years</strong> Clinical Practice</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{doc.roomNumber || 'OPD Suite'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{doc.availableDays.slice(0, 3).join(', ')}...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDoctorModal(doc)}
                  className="py-2 px-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onBookDoctor(doc.id)}
                  className="py-2 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book (₹{doc.consultationFee})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCTOR PROFILE MODAL */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            <div className="relative h-44 bg-slate-900">
              <img
                src={selectedDoctorModal.avatar}
                alt={selectedDoctorModal.name}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                  {selectedDoctorModal.specialty}
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-1">{selectedDoctorModal.name}</h3>
                <p className="text-xs text-emerald-200">{selectedDoctorModal.title}</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300 max-h-[60vh] overflow-y-auto">
              <div>
                <strong className="block text-slate-900 dark:text-white text-xs mb-1">Medical Credentials & Background</strong>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">{selectedDoctorModal.qualifications}</p>
                <p className="text-slate-500 dark:text-slate-400">{selectedDoctorModal.experienceYears} Years Clinical Experience</p>
                <p className="text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">{selectedDoctorModal.departmentName}</p>
              </div>

              <div>
                <strong className="block text-slate-900 dark:text-white text-xs mb-1">Clinical Bio & Treatment Approach</strong>
                <p className="leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {selectedDoctorModal.bio}
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 dark:text-white text-xs mb-1">OPD Schedule & Available Time Slots</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedDoctorModal.availableSlots.map(slot => (
                    <span key={slot} className="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-100 dark:border-slate-700">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">₹{selectedDoctorModal.consultationFee}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">OPD Room</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDoctorModal.roomNumber || 'OPD Room 101'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">CarePulse Certified Faculty</span>
              <button
                onClick={() => {
                  const id = selectedDoctorModal.id;
                  setSelectedDoctorModal(null);
                  onBookDoctor(id);
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Book with {selectedDoctorModal.name}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
