import React from 'react';
import { 
  HeartPulse, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Users, 
  Award, 
  ArrowRight, 
  PhoneCall, 
  Sparkles,
  CheckCircle2,
  Stethoscope,
  MapPin
} from 'lucide-react';

interface HomeHeroProps {
  onOpenBooking: () => void;
  onExploreDepartments: () => void;
  onOpenEmergency: () => void;
  onOpenDoctors: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onOpenBooking,
  onExploreDepartments,
  onOpenEmergency,
  onOpenDoctors
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white">
      
      {/* Decorative Warm Indian Gold & Emerald Glows */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle traditional motif top border line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-24 relative z-10">
        
        {/* Sanskrit Motto & Accreditations */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-xs">
            <span className="font-serif italic font-bold">सर्वे सन्तु निरामयाः</span>
            <span className="text-amber-200/70 hidden sm:inline">• "May all be free from illness"</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NABH & NABL Accredited | AB-PMJAY Empanelled</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-amber-400 inline-block"></span>
                Namaste & Welcome to CarePulse Hospital
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight text-white">
                World-Class Clinical Care. <br />
                <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  Indian Compassion & Healing.
                </span>
              </h1>
            </div>

            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
              CarePulse Super Speciality Hospital is one of India's foremost healthcare institutions. We combine internationally trained clinical faculty from AIIMS, PGI & CMC with robotic surgical suites, Ayushman Bharat cashless care, and a secure digital OPD portal.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenBooking}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Book Doctor Appointment (₹)</span>
              </button>

              <button
                onClick={onExploreDepartments}
                className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 cursor-pointer"
              >
                <span>View Departments</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </button>

              <button
                onClick={onOpenEmergency}
                className="py-3.5 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs border border-rose-400/40 transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/50 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span>Emergency 108 / 1066</span>
              </button>
            </div>

            {/* Indian Healthcare Pillars checklist */}
            <div className="pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-200/90 font-medium border-t border-emerald-900/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Ayushman Bharat (AB-PMJAY) Cashless
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Same-Day NABL Lab Reports
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zero-Wait 24/7 Cardiac Triage
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Card with Indian Specialists */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Doctor Card Mockup */}
              <div className="bg-gradient-to-b from-white/15 to-white/5 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                      <HeartPulse className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">CarePulse OPD Roster</h4>
                      <p className="text-[11px] text-amber-200">Hyderabad • Main Campus</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                    OPD Slots Open
                  </span>
                </div>

                <div className="my-4 space-y-2.5">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
                        alt="Dr. Rajesh Sharma"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-300/40"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Dr. Rajesh Sharma</p>
                        <p className="text-[11px] text-emerald-200">Chief Interventional Cardiologist (AIIMS)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-lg border border-amber-500/30 block">
                        ₹900 OPD
                      </span>
                      <span className="text-[10px] text-slate-300">Today 10:30 AM</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1594824813512-88126e7a2b9f?auto=format&fit=crop&w=200&q=80"
                        alt="Dr. Priya Nair"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-300/40"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Dr. Priya Nair</p>
                        <p className="text-[11px] text-emerald-200">Consultant Pediatrician (PGIMER)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-lg border border-amber-500/30 block">
                        ₹750 OPD
                      </span>
                      <span className="text-[10px] text-slate-300">Today 11:30 AM</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-emerald-200 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    50+ Board Specialists Ready
                  </span>
                  <button
                    onClick={onOpenDoctors}
                    className="text-amber-300 font-bold hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <span>Browse All Doctors</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Indian Healthcare Accreditations Banner */}
        <div className="mt-12 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-lg font-black text-amber-300">NABH</p>
            <p className="text-[11px] text-emerald-200">Hospital Accreditation</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-lg font-black text-emerald-300">NABL</p>
            <p className="text-[11px] text-emerald-200">Diagnostics Lab Certified</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-lg font-black text-amber-300">AB-PMJAY</p>
            <p className="text-[11px] text-emerald-200">Ayushman Bharat Empanelled</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-lg font-black text-emerald-300">24/7</p>
            <p className="text-[11px] text-emerald-200">108 & 1066 Emergency Triage</p>
          </div>
        </div>

      </div>
    </div>
  );
};
