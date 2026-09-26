"use client";
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  BarChart2, 
  Package, 
  Users, 
  UserCircle, 
  LogOut, 
  Settings,
  TrendingUp,
  FileText,
  Bell,
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Truck,
  MessageSquare,
  PlusCircle
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useSidebar } from '@/hooks/useSidebar';

export default function AdminSidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile } = useSidebar();
  const [scrollY, setScrollY] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoized active key calculation
  const activeKey = useMemo(() => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname.includes('/analytics')) return 'analytics';
    if (pathname.includes('/shipments')) return 'shipments';
    if (pathname.includes('/create-shipment')) return 'create-shipment';
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/partners')) return 'partners';
    if (pathname.includes('/complaints')) return 'complaints';
    if (pathname.includes('/reports')) return 'reports';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  }, [pathname]);

  // Memoized logout handler
  const handleLogout = useCallback(() => {
    authService.logout();
    window.location.href = '/';
  }, []);

  // Memoized menu items
  const menuItems = useMemo(() => [
    { href: '/admin', icon: BarChart2, label: 'Dashboard', key: 'dashboard' },
    { href: '/admin/shipments', icon: Package, label: 'Shipments', key: 'shipments' },
    { href: '/admin/create-shipment', icon: PlusCircle, label: 'Book Courier', key: 'create-shipment' },
    { href: '/admin/partners', icon: Truck, label: 'Partners Fleet', key: 'partners' },
    { href: '/admin/users', icon: Users, label: 'User Directory', key: 'users' },
    { href: '/admin/complaints', icon: MessageSquare, label: 'Complaints', key: 'complaints' },
    { href: '/admin/analytics', icon: TrendingUp, label: 'Analytics', key: 'analytics' },
    { href: '/admin/reports', icon: FileText, label: 'Audit Reports', key: 'reports' },
    { href: '/admin/notifications', icon: Bell, label: 'Alerts', key: 'notifications' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', key: 'settings' },
  ], []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-slate-900 text-slate-300 z-40 
          transition-all duration-300 ease-out border-r border-slate-800
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-2xl
        `}
      >
        {/* Header */}
        <div className={`
          border-b border-slate-800/80 transition-all duration-300 relative
          ${isCollapsed ? 'p-0 h-16' : 'p-4 px-5 h-16'}
          flex items-center
        `}>
          {/* Expanded State */}
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0 text-slate-950 font-extrabold shadow-sm">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-white tracking-tight block">
                    Prime Dispatcher
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Command Console
                  </span>
                </div>
              </Link>
              
              <button
                onClick={toggleCollapse}
                className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Collapsed Expand Button */}
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="w-full h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobile}
                className={`
                  group flex items-center rounded-xl text-xs font-semibold
                  transition-all duration-150
                  ${isActive 
                    ? 'bg-slate-800 text-white border-l-2 border-amber-400 shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                  ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-3 py-2.5 px-3.5'}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <div className="flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`} />
                </div>
                
                {!isCollapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {/* User Profile */}
          <div className={`
            flex items-center p-3 rounded-lg bg-slate-700/50
            transition-all duration-300 ease-out
            ${isCollapsed ? 'justify-center' : 'gap-3'}
          `}>
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate whitespace-nowrap">{currentUser?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-400 truncate whitespace-nowrap">{currentUser?.email || 'admin@gmail.com'}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center py-3 px-3 rounded-lg
              text-red-400 hover:bg-red-500/10 hover:text-red-300
              transition-all duration-200 ease-out group will-change-transform
              hover:transform hover:scale-[1.01]
              ${isCollapsed ? 'justify-center' : 'gap-3'}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 group-hover:scale-105 transition-transform duration-200 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className={`
          absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-16 
          bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-full
          transition-opacity duration-300 ease-out will-change-transform
          ${scrollY > 100 ? 'opacity-100' : 'opacity-0'}
        `} />
      </aside>
    </>
  );
}