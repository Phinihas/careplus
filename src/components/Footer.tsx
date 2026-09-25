import React from 'react';
import { HeartPulse, PhoneCall, MapPin, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '../context/AuthContext';

interface FooterProps {
  onNavigate: (view: 'home' | 'departments' | 'doctors' | 'dashboard' | 'admin') => void;
  onOpenBooking: () => void;
  onOpenEmergency: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenEmergency
}) => {
  const { user } = useAuth();
  const isAuthorizedAdmin = user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      
      {/* Top 24/7 National Emergency Bar */}
      <div className="bg-emerald-950 border-b border-emerald-900/80 py-5 px-4 relative overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 absolute top-0 left-0" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
                24/7 National Emergency & Trauma Ambulance Dispatch
              </p>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Dial 108 (Toll Free) or +91 40 2345 6789 / 1066
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenEmergency}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer shadow-md"
            >
              Emergency & Trauma Center
            </button>
            <button
              onClick={onOpenBooking}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
            >
              Book OPD Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand info with Indian Heritage */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight block">
                  Care<span className="text-emerald-400">Pulse</span> Hospital
                </span>
                <span className="text-[10px] text-amber-300 tracking-wide font-medium">Super Speciality & Research Institute</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Dedicated to clinical excellence, patient affordability, and state-of-the-art medical science. Serving patients across India with dignity and care.
            </p>

            <div className="space-y-1 text-emerald-300 font-semibold text-[11px]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>NABH & NABL Accredited Medical Center</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ayushman Bharat (AB-PMJAY) Empanelled</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Hospital Overview & Features
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('departments')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Clinical Departments & Centers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Find Specialists & OPD Doctors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Patient Portal (ABHA / Reports)
                </button>
              </li>
              {isAuthorizedAdmin && (
                <li>
                  <button onClick={() => onNavigate('admin')} className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1">
                    <span>Admin Console (Authorized)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Clinical Centers */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Super Speciality Centers</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Cardiovascular & Cardiothoracic Surgery (AIIMS)</li>
              <li>Robotic Joint Replacement & Orthopedics</li>
              <li>Comprehensive Medical & Surgical Oncology</li>
              <li>Pediatrics & Neonatal Intensive Care (NICU)</li>
              <li>Advanced Neurology & Spine Surgery</li>
              <li>Dermatology, Aesthetics & Laser Center</li>
            </ul>
          </div>

          {/* Indian Campus Contact */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm mb-3">Hospital Campus</h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>CarePulse Medical Enclave, Road No. 12, Banjara Hills, Hyderabad, Telangana - 500034, India</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hospital Central: +91 40 2345 6789 / 1800-425-9999</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>appointments@carepulseindia.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>OPD Timings: 08:30 AM – 08:00 PM (Mon - Sat)</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CarePulse Super Speciality Hospital & Research Institute. All rights reserved.</p>
          <p className="max-w-md text-center sm:text-right">
            Emergency Notice: For acute life-threatening situations in India, dial <strong className="text-white">108</strong> (Ambulance) or <strong className="text-white">1066</strong>.
          </p>
        </div>
      </div>

    </footer>
  );
};
