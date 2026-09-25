import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { HomeFeatures } from './components/HomeFeatures';
import { DepartmentsPage } from './components/DepartmentsPage';
import { DoctorsPage } from './components/DoctorsPage';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminPanel } from './components/AdminPanel';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { EmergencyModal } from './components/EmergencyModal';
import { Footer } from './components/Footer';

import { Department, Doctor } from './types';
import { 
  seedInitialDataIfEmpty, 
  subscribeDepartments, 
  subscribeDoctors 
} from './services/dbService';
import { INITIAL_DEPARTMENTS, INITIAL_DOCTORS } from './services/seedData';

function MainApp() {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<'home' | 'departments' | 'doctors' | 'dashboard' | 'admin'>('home');
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);

  // Modal controls
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | undefined>(undefined);
  const [bookingDeptId, setBookingDeptId] = useState<string | undefined>(undefined);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);

  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Initialize and seed database if necessary
  useEffect(() => {
    seedInitialDataIfEmpty();

    const unsubDept = subscribeDepartments((depts) => {
      setDepartments(depts);
    });

    const unsubDoc = subscribeDoctors((docs) => {
      setDoctors(docs);
    });

    return () => {
      unsubDept();
      unsubDoc();
    };
  }, []);

  // Handlers
  const handleOpenBooking = (docId?: string, deptId?: string) => {
    setBookingDoctorId(docId);
    setBookingDeptId(deptId);
    setIsBookingOpen(true);
  };

  const handleOpenAuth = (notice?: string) => {
    setAuthNotice(notice);
    setIsAuthOpen(true);
  };

  const handleSelectDoctorFromCard = (doctorId: string) => {
    handleOpenBooking(doctorId);
  };

  const handleSelectDeptFromCard = (deptId: string) => {
    handleOpenBooking(undefined, deptId);
  };

  const handleViewDoctor = (doctor: Doctor) => {
    handleOpenBooking(doctor.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={handleOpenAuth}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            <HomeHero
              onOpenBooking={() => handleOpenBooking()}
              onExploreDepartments={() => setCurrentView('departments')}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              onOpenDoctors={() => setCurrentView('doctors')}
            />
            <HomeFeatures
              doctors={doctors}
              departments={departments}
              onOpenBooking={() => handleOpenBooking()}
              onSelectDoctor={handleSelectDoctorFromCard}
              onExploreDepartments={() => setCurrentView('departments')}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
            />
          </div>
        )}

        {currentView === 'departments' && (
          <DepartmentsPage
            departments={departments}
            doctors={doctors}
            onSelectDepartmentToBook={handleSelectDeptFromCard}
            onViewDoctor={handleViewDoctor}
          />
        )}

        {currentView === 'doctors' && (
          <DoctorsPage
            doctors={doctors}
            departments={departments}
            onBookDoctor={handleSelectDoctorFromCard}
          />
        )}

        {currentView === 'dashboard' && (
          <PatientDashboard
            onBookNewAppointment={() => handleOpenBooking()}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            departments={departments}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentView}
        onOpenBooking={() => handleOpenBooking()}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Appointment Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctors={doctors}
        departments={departments}
        initialDoctorId={bookingDoctorId}
        initialDepartmentId={bookingDeptId}
        onOpenAuth={handleOpenAuth}
        onViewDashboard={() => setCurrentView('dashboard')}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        intendedActionNotice={authNotice}
      />

      {/* Emergency Hotline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
