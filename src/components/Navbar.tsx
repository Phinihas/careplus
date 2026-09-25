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
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { user, profile, isAdmin, role, overrideRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Check if current user is the authorized admin email
  const isAuthorizedAdmin = user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

  const handleRoleToggle = (targetRole: 'patient' | 'admin') => {
    if (targetRole === 'admin' && !isAuthorizedAdmin) {
      showToast('Access Restricted', `Admin access is restricted to ${AUTHORIZED_ADMIN_EMAIL}.`, 'error');
      return;
    }
    overrideRole(targetRole);
    if (targetRole === 'admin') {
      setCurrentView('admin');
      showToast('Admin Mode Active', 'Hospital management console ready.');
    } else {
      setCurrentView('dashboard');
      showToast('Patient Mode Active', 'Switched to Patient Portal.');
    }
    setIsProfileDropdownOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Specialists' },
    { id: 'dashboard', label: 'Patient Portal' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Top Hotline & Indian Accreditations Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              NABH & NABL Accredited | AB-PMJAY Empanelled
            </span>
            <span className="flex items-center gap-1 text-emerald-200">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>OPD: 08:30 AM – 08:00 PM (Mon-Sat)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 text-rose-300 hover:text-rose-100 font-bold transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 animate-pulse text-rose-400" />
              <span>Emergency: 108 / 1066</span>
            </button>
            <span className="text-emerald-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-slate-300 font-serif italic">सर्वे सन्तु निरामयाः</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo with Indian Saffron & Emerald touch */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-600 to-teal-800 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform duration-300">
              <HeartPulse className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Care<span className="text-emerald-700 dark:text-emerald-400">Pulse</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-0.5">HOSPITAL</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
                Super Speciality & Research Institute
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id as any)}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  currentView === link.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Admin Console link ONLY visible for phinihasgandi@gmail.com */}
            {isAuthorizedAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 shadow-xs'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Action Cluster: Theme Toggle, Booking CTA, User Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 transition-all duration-300 cursor-pointer shadow-xs active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 animate-in spin-in-90 duration-300 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 animate-in spin-in-90 duration-300 text-slate-700" />
              )}
            </button>

            {/* Quick Book Appointment CTA */}
            <button
              onClick={onOpenBooking}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-950" />
              <span>Book Appointment (₹)</span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                    {(profile?.displayName || user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {profile?.displayName || user.displayName || 'Patient'}
                    </p>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-400 capitalize">
                      {isAuthorizedAdmin && role === 'admin' ? 'Admin' : 'Patient'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 text-xs text-slate-700 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {profile?.displayName || user.displayName || 'Signed In'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Patient Portal & Reports</span>
                      </button>

                      {isAuthorizedAdmin && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Admin Console</span>
                        </button>
                      )}
                    </div>

                    {/* Role Switcher for Admin account */}
                    {isAuthorizedAdmin && (
                      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Role Switcher
                        </span>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => handleRoleToggle('patient')}
                            className={`py-1 px-2 rounded-lg text-center font-bold text-[11px] ${
                              role === 'patient'
                                ? 'bg-emerald-800 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            Patient
                          </button>
                          <button
                            onClick={() => handleRoleToggle('admin')}
                            className={`py-1 px-2 rounded-lg text-center font-bold text-[11px] ${
                              role === 'admin'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={async () => {
                          setIsProfileDropdownOpen(false);
                          await logout();
                          showToast('Signed Out', 'You have been safely signed out.');
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth()}
                className="py-2.5 px-4 rounded-xl border border-emerald-700 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold text-xs transition-colors cursor-pointer"
              >
                Sign In / Register
              </button>
            )}

          </div>

          {/* Mobile Right Controls: Dark toggle + Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-900 dark:text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs text-left ${
                  currentView === link.id
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {isAuthorizedAdmin && (
            <button
              onClick={() => {
                setCurrentView('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Admin Console ({AUTHORIZED_ADMIN_EMAIL})</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book OPD Appointment (₹)</span>
            </button>

            {user ? (
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await logout();
                  showToast('Signed Out', 'You have been safely signed out.');
                }}
                className="w-full py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold text-xs text-center"
              >
                Sign Out ({user.displayName || user.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs text-center"
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
