import { LayoutDashboard, Users, FileText, Calendar, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const logoImage =
  'https://images.unsplash.com/photo-1631549916766-7a2d31a3e9dc?auto=format&fit=crop&w=128&q=80';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/radiology/panel' },
  { icon: Users, label: 'Patients', path: '/radiology/patients' },
  { icon: FileText, label: 'Studies', path: '/radiology/studies' },
  { icon: FileText, label: 'Reports', path: '/radiology/reports' },
  { icon: Calendar, label: 'Appointments', path: '/radiology/appointments' },
  { icon: Settings, label: 'Staff', path: '/radiology/staff' },
  { icon: HelpCircle, label: 'Billing', path: '/radiology/billing' },
];

export default function RadiologySidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logoImage} alt="RadiologyOS" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>RadiologyOS</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span style={{ fontSize: '14px', fontWeight: 700 }}>DR</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ fontSize: '14px', fontWeight: 600 }}>
              Dr. Ramy
            </div>
            <div className="text-gray-400 truncate" style={{ fontSize: '12px' }}>
              Radiologist
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
