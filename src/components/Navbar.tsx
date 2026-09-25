import React, { useState } from 'react';
import { 
  HeartPulse, 
  Menu, 
  X, 
  User, 
  Calendar, 
  LogOut, 
  ShieldCheck, 
  PhoneCall, 
  Clock, 
  ChevronDown,
  Activity,
  MapPin,
  Lock
} from 'lucide-react';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from './Toast';

interface NavbarProps {
  currentView: 'home' | 'departments' | 'doctors' | 'dashboard' | 'admin';
  setCurrentView: (view: 'home' | 'departments' | 'doctors' | 'dashboard' | 'admin') => void;
  onOpenBooking: () => void;
  onOpenAuth: (notice?: string) => void;
  onOpenEmergency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenBooking,
  onOpenAuth,
  onOpenEmergency
}) => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    showToast('Signed Out', 'You have been safely signed out from CarePulse Hospital portal.');
    if (currentView === 'dashboard' || currentView === 'admin') {
      setCurrentView('home');
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors & Specialists' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      
      {/* Indian Healthcare Micro-bar with Tricolor subtle accent */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>

      <div className="bg-emerald-950 text-emerald-100 px-4 py-1.5 text-[11px] font-medium hidden sm:flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              NABH & NABL Accredited Multi-Speciality Hospital
            </span>
            <span className="text-emerald-400/40">|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              OPD Timings: Mon – Sat 08:30 AM – 08:30 PM IST
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-rose-400" />
              National Emergency Ambulance: <strong className="text-white font-mono ml-0.5">108 / 1066</strong>
            </span>
            <button
              onClick={onOpenEmergency}
              className="text-amber-300 hover:text-amber-200 font-bold transition-colors underline"
            >
              24/7 Trauma Bay
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo with Indian Green Medical styling */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform border border-emerald-500/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Care<span className="text-emerald-700">Pulse</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-300/60">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 -mt-0.5">Multi-Speciality Healthcare & Research</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id as any)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === link.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {user && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Patient Portal</span>
              </button>
            )}

            {/* Admin Console strictly visible to phinihasgandi@gmail.com */}
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Action Buttons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-800/20 flex items-center gap-1.5 active:scale-95 border border-emerald-600"
            >
              <Calendar className="w-4 h-4 text-emerald-200" />
              <span>Book Appointment</span>
            </button>

            {user ? (
              /* User Profile Menu */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors bg-white"
                >
                  <img
                    src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || 'User')}`}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-lg object-cover bg-emerald-50"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block max-w-[110px] truncate leading-tight">
                      {profile?.displayName || user.displayName || 'Account'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      {isAdmin ? 'Chief Admin' : 'Patient'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="font-bold text-slate-900 truncate">{profile?.displayName || user.displayName || 'Patient'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isAdmin ? 'Chief Hospital Administrator' : 'Verified Patient'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-slate-700 flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Patient Dashboard & Lab Reports</span>
                    </button>

                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-900 font-semibold flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-700" />
                        <span>Hospital Admin Console</span>
                      </button>
                    ) : (
                      <div className="px-4 py-1.5 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Admin console restricted to {AUTHORIZED_ADMIN_EMAIL}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth()}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="py-1.5 px-3 rounded-xl bg-emerald-700 text-white font-semibold text-xs"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-xl text-left text-sm font-semibold ${
                  currentView === link.id
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {user && (
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl text-left text-sm font-semibold text-emerald-700 bg-emerald-50/50 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                <span>My Patient Dashboard</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl text-left text-sm font-semibold text-slate-900 bg-slate-100 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Admin Console</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-rose-600 text-left text-sm font-semibold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 bg-emerald-700 text-white rounded-xl text-center text-sm font-semibold shadow-xs"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
