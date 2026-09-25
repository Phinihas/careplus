import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Stethoscope, 
  Sparkles, 
  Award, 
  Check, 
  PhoneCall, 
  Ambulance, 
  HeartHandshake,
  Star
} from 'lucide-react';
import { Doctor, Department } from '../types';

interface HomeFeaturesProps {
  doctors: Doctor[];
  departments: Department[];
  onOpenBooking: () => void;
  onSelectDoctor: (doctorId: string) => void;
  onExploreDepartments: () => void;
  onOpenEmergency: () => void;
}

export const HomeFeatures: React.FC<HomeFeaturesProps> = ({
  doctors,
  departments,
  onOpenBooking,
  onSelectDoctor,
  onExploreDepartments,
  onOpenEmergency
}) => {
  const topDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-20 py-14 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. Quick Emergency & Service Highlight Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20 relative z-20">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Eminent Medical Faculty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Consult with veteran medical professors from premier Indian institutions (AIIMS, CMC Vellore, PGIMER, Tata Memorial) across all superspecialities.
              </p>
            </div>
            <button
              onClick={onExploreDepartments}
              className="mt-6 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore 7+ Clinical Departments</span>
              <span>→</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Instant Online OPD Booking</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select your preferred doctor, time slot (Morning / Evening OPD), and book single or multiple appointments with transparent Indian Rupee (₹) fees.
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="mt-6 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Book Appointment Now</span>
              <span>→</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-rose-900 via-red-900 to-rose-950 text-white rounded-3xl p-7 shadow-xl border border-rose-800 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4">
                <Ambulance className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">24/7 Emergency & Trauma</h3>
              <p className="text-xs text-rose-100 leading-relaxed">
                Immediate life-support trauma units, dedicated pediatric emergency, rapid cath-lab activation, and GPS-enabled ambulance fleet.
              </p>
            </div>
            <button
              onClick={onOpenEmergency}
              className="mt-6 text-xs font-bold text-white bg-white/20 hover:bg-white/30 py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>National Helpline: 108 / 1066</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Featured Indian Specialists Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Senior Clinical Consultants
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Featured Doctors & Surgeons
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Distinguished practitioners recognized for surgical precision, academic research, and empathetic patient care.
            </p>
          </div>

          <button
            onClick={onExploreDepartments}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View all medical specialties</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  
                  {/* Indian Rupee consultation fee */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold shadow-xs">
                    ₹{doc.consultationFee} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">OPD</span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-700/90 text-white text-xs font-semibold backdrop-blur-xs">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block mb-1">
                    {doc.specialty}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.qualifications}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">{doc.departmentName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{doc.experienceYears} Years Clinical Experience</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => onSelectDoctor(doc.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-emerald-800 dark:text-emerald-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Book Consultation (₹{doc.consultationFee})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Why Choose CarePulse Hospital - Indian Healthcare Pillars */}
      <div className="bg-emerald-50/70 dark:bg-slate-900/60 py-16 border-y border-emerald-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              NABH & NABL Accredited Institution
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 mb-2">
              Why Patients Across India Trust CarePulse
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Modern medical infrastructure, ethical clinical protocols, transparent Indian Rupee billing, and compassionate nursing care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Robotic & Minimal Access Surgery</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Equipped with fourth-generation Da Vinci Xi robotic surgery platforms for cardiac, oncology, and orthopedic procedures with quicker recovery.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Digital Health Record & ABHA</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instant access to verified electronic prescriptions, NABL lab test reports, and imaging scans linked with your Ayushman Bharat Health Account.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">NABL Certified Same-Day Labs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated high-throughput diagnostic hematology, biochemistry, molecular pathology, and 3T MRI diagnostics with fast-track digital reporting.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Cashless TPA & PM-JAY</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Empanelled with Star Health, HDFC ERGO, ICICI Lombard, Max Bupa, Care Health, Ayushman Bharat PM-JAY, CGHS, and ECHS for hassle-free cashless claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Patient Stories & Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Patient Stories & Gratitude
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
            Real Voices of Hope & Healing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
              "The care my father received from Dr. Rajesh Sharma at the Cardiology Department was truly exemplary. From online OPD scheduling to the primary angioplasty, the entire staff treated us like family."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                RS
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">Rajeshwer Rao</p>
                <p className="text-[11px] text-slate-400">Hyderabad • Cardiology Care</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
              "Dr. Priya Nair is remarkably gentle and patient with children. My 5-year-old was terrified of hospitals, but CarePulse's colorful pediatric wing and digital prescriptions on my mobile made it smooth."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs">
                AS
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">Ananya Sen</p>
                <p className="text-[11px] text-slate-400">Bengaluru • Pediatric Parent</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
              "Underwent robotic total knee replacement under Dr. Vikramaditya Reddy. I was back walking within 48 hours and discharged with full Ayushman Bharat cashless approval."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                HS
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">Harpreet Singh</p>
                <p className="text-[11px] text-slate-400">New Delhi • Joint Replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
