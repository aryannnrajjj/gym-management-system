import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, QrCode, 
  Calendar, Dumbbell, CreditCard, LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  // Role ke hisaab se menu items
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'trainer', 'member'] },
    { path: '/members', label: 'Members', icon: Users, roles: ['admin', 'trainer'] },
    { path: '/attendance', label: 'Attendance', icon: Calendar, roles: ['admin', 'trainer', 'member'] },
    { path: '/qr-scanner', label: 'QR Scanner', icon: QrCode, roles: ['admin', 'trainer'] },
    { path: '/workout', label: 'Workout Plans', icon: Dumbbell, roles: ['admin', 'trainer', 'member'] },
    { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard, roles: ['admin'] },
  ];

  // Sirf allowed menu items dikhao
  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="w-64 min-h-screen bg-gym-card border-r border-gray-700 flex flex-col">
      
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏋️</span>
          <div>
            <h2 className="font-bold text-white text-lg">GymPro</h2>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
              ${isActive 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}