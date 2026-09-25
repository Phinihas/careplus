import React from 'react';
import { X, PhoneCall, Ambulance, AlertTriangle, MapPin, Heart, ShieldAlert, Clock } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/60 max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Ambulance className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-rose-100 text-[11px] font-bold uppercase tracking-wider">
                Level 1 Apex Trauma Center
              </span>
              <h2 className="text-xl font-extrabold tracking-tight mt-0.5">24/7 Indian Emergency Services</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 text-center">
            <span className="text-xs text-rose-800 dark:text-rose-300 font-bold uppercase tracking-wider block">
              National Ambulance & Trauma Dispatch
            </span>
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400 hover:text-rose-800 mt-1 cursor-pointer"
            >
              <PhoneCall className="w-6 h-6 animate-bounce" />
              <span>108 / 1066</span>
            </a>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 font-semibold">Hospital Emergency Direct: +91 40 2345 6789</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Average ICU Ambulance Response in Metro: ~7 minutes</p>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-white block text-xs">Emergency Bay & Trauma Ramp:</strong>
                <span>CarePulse Medical Enclave, Gate 1 Emergency Entrance, Road No. 12, Banjara Hills, Hyderabad</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-white block text-xs">Immediate Triage Capabilities:</strong>
                <span>Cath Lab for Acute Heart Attacks (Zero-Wait Protocol), Stroke Code TPA, Pediatric Emergency, 24/7 Blood Bank</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-white block text-xs">National Poison Info Centre (AIIMS):</strong>
                <span>1800-116-117 (Direct connection to clinical toxicologists)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Emergency Guide
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
