import React, { useState } from 'react';
import { 
  HeartPulse, 
  Brain, 
  Baby, 
  Bone, 
  ShieldAlert, 
  Sparkles, 
  Stethoscope, 
  Eye, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Calendar,
  Users
} from 'lucide-react';
import { Department, Doctor } from '../types';

interface DepartmentsPageProps {
  departments: Department[];
  doctors: Doctor[];
  onSelectDepartmentToBook: (deptId: string) => void;
  onViewDoctor: (doctor: Doctor) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  doctors,
  onSelectDepartmentToBook,
  onViewDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'Brain': return <Brain className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'Baby': return <Baby className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'Bone': return <Bone className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      case 'Eye': return <Eye className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
      default: return <Stethoscope className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />;
    }
  };

  const filteredDepts = departments.filter((dept) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.description.toLowerCase().includes(q) ||
      dept.services.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in transition-colors duration-300">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
          Centers of Clinical Excellence
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
          Specialized Clinical Departments
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          From AIIMS-led interventional cardiac suites to pediatric neonatal intensive care, CarePulse houses NABH-accredited superspecialities with modern diagnostic infrastructure.
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by department, condition, or clinical service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => {
          const deptDocs = doctors.filter(d => d.departmentId === dept.id);
          return (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Department Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={dept.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'}
                    alt={dept.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/90 text-white text-[11px] font-bold backdrop-blur-xs">
                      {dept.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-300" />
                      {deptDocs.length} Faculty
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shrink-0">
                      {getIcon(dept.iconName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Head: {dept.headDoctor}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {dept.description}
                  </p>

                  {/* Top clinical services tags */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Key Clinical Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                        >
                          {service}
                        </span>
                      ))}
                      {dept.services.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                          +{dept.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{dept.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{dept.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDept(dept)}
                  className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => onSelectDepartmentToBook(dept.id)}
                  className="py-2 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPARTMENT DETAIL MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full overflow-hidden text-slate-800 dark:text-slate-100 max-h-[85vh] flex flex-col transition-colors">
            
            <div className="relative h-48 bg-emerald-950 shrink-0">
              <img
                src={selectedDept.image}
                alt={selectedDept.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedDept(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                  {selectedDept.code}
                </span>
                <h3 className="text-2xl font-black tracking-tight mt-1">{selectedDept.name}</h3>
                <p className="text-xs text-emerald-200 font-medium">Head of Department: {selectedDept.headDoctor}</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Department Overview</h4>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selectedDept.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Available Clinical Services & Diagnostics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDept.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors in this department */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Attending Specialists</h4>
                <div className="space-y-2">
                  {doctors.filter(d => d.departmentId === selectedDept.id).map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-100 dark:border-slate-600"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{doc.name}</p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">{doc.title}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDept(null);
                          onViewDoctor(doc);
                        }}
                        className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">{selectedDept.roomNumber} • {selectedDept.phone}</span>
              <button
                onClick={() => {
                  const id = selectedDept.id;
                  setSelectedDept(null);
                  onSelectDepartmentToBook(id);
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Schedule Consultation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
