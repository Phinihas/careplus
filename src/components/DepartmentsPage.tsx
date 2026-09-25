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
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-emerald-600" />;
      case 'Brain': return <Brain className="w-6 h-6 text-emerald-600" />;
      case 'Baby': return <Baby className="w-6 h-6 text-emerald-600" />;
      case 'Bone': return <Bone className="w-6 h-6 text-emerald-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-emerald-600" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-emerald-600" />;
      case 'Eye': return <Eye className="w-6 h-6 text-emerald-600" />;
      default: return <Stethoscope className="w-6 h-6 text-emerald-600" />;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          Centers of Excellence
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-3">
          Specialized Medical Departments
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From interventional cardiac surgery to pediatric neonatal intensive care, CarePulse houses world-accredited clinical divisions with modern diagnostic suites.
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by department name, condition, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
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
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Department Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dept.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'}
                    alt={dept.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-xs">
                      {dept.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-300" />
                      {deptDocs.length} Specialists
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 shrink-0">
                      {getIcon(dept.iconName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">Head: {dept.headDoctor}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
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
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {service}
                        </span>
                      ))}
                      {dept.services.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                          +{dept.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{dept.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{dept.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDept(dept)}
                  className="py-2 px-3 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => onSelectDepartmentToBook(dept.id)}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-800 max-h-[85vh] flex flex-col">
            
            <div className="relative h-48 bg-emerald-950 shrink-0">
              <img
                src={selectedDept.image}
                alt={selectedDept.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedDept(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  {selectedDept.code}
                </span>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{selectedDept.name}</h3>
                <p className="text-xs text-emerald-200 font-medium">Head of Department: {selectedDept.headDoctor}</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Department Overview</h4>
                <p className="text-xs leading-relaxed text-slate-600">{selectedDept.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Available Clinical Services & Diagnostics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDept.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctors in this department */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Attending Specialists</h4>
                <div className="space-y-2">
                  {doctors.filter(d => d.departmentId === selectedDept.id).map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{doc.name}</p>
                          <p className="text-[11px] text-emerald-700">{doc.title}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDept(null);
                          onViewDoctor(doc);
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">{selectedDept.roomNumber} • {selectedDept.phone}</span>
              <button
                onClick={() => {
                  const id = selectedDept.id;
                  setSelectedDept(null);
                  onSelectDepartmentToBook(id);
                }}
                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
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
