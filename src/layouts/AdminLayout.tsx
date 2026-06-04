import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import {
  LayoutDashboard, Music, Calendar, FileText, Mail, Settings,
  LogOut, Menu, X, Shirt, Users, Globe, ChevronRight, ExternalLink, ShoppingBag,
} from 'lucide-react';
import { api } from '../lib/api';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/music', label: 'Music', icon: Music },
  { path: '/admin/events', label: 'Events', icon: Calendar },
  { path: '/admin/blog', label: 'Blog', icon: FileText },
  { path: '/admin/contacts', label: 'Contacts', icon: Mail },
  { path: '/admin/fashion', label: 'Fashion', icon: Shirt },
  { path: '/admin/subscribers', label: 'Subscribers', icon: Users },
  { path: '/admin/content', label: 'Site Content', icon: Globe },
  { path: '/admin/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

// TODO: Replace this placeholder with the real Seedads dashboard URL
const SEEDADS_DASHBOARD_URL = '#';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    api.me().then(setAdmin).catch(() => { localStorage.removeItem('admin_token'); navigate('/admin/login'); });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0f172a] text-white flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0d9488] rounded-xl flex items-center justify-center font-bold text-sm">S</div>
          <div>
            <div className="font-bold text-sm leading-tight">Succeed Lawani</div>
            <div className="text-white/40 text-xs">Admin Panel</div>
          </div>
          <button className="ml-auto lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-[#0d9488] text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="opacity-60" />}
              </Link>
            );
          })}

          {/* Seedads Dashboard — external link */}
          <div className="mx-2 mt-3 border-t border-white/10 pt-3">
            <a
              href={SEEDADS_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-[#0d9488] bg-[#0d9488]/10 hover:bg-[#0d9488]/20"
            >
              <ExternalLink size={18} />
              <span className="flex-1">Seedads Dashboard</span>
              <ExternalLink size={12} className="opacity-50" />
            </a>
          </div>
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-[#0d9488] rounded-full flex items-center justify-center text-xs font-bold">
              {admin?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{admin?.name || 'Admin'}</div>
              <div className="text-white/40 text-xs truncate">{admin?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button className="lg:hidden text-[#64748b]" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#0f172a]">
              {navItems.find((n) => n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path))?.label || 'Dashboard'}
            </h1>
          </div>
          <Link to="/" target="_blank" className="text-xs text-[#0d9488] font-semibold hover:underline">
            View Site ↗
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
