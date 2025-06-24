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
  Truck
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useSidebar } from '@/hooks/useSidebar';

export default function AdminSidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile } = useSidebar();
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();

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
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/partners')) return 'partners';
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
    { href: '/admin/analytics', icon: TrendingUp, label: 'Analytics', key: 'analytics' },
    { href: '/admin/shipments', icon: Package, label: 'Shipments', key: 'shipments' },
    { href: '/admin/users', icon: Users, label: 'Users', key: 'users' },
    { href: '/admin/partners', icon: Truck, label: 'Partners', key: 'partners' },
    { href: '/admin/reports', icon: FileText, label: 'Reports', key: 'reports' },
    { href: '/admin/notifications', icon: Bell, label: 'Notifications', key: 'notifications' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', key: 'settings' },
  ], []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md shadow-lg hover:bg-slate-700 transition-colors duration-150 will-change-transform"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-200"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-slate-800 text-white z-40 
          transition-all duration-300 ease-out will-change-transform
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col shadow-xl
        `}
      >
        {/* Header */}
        <div className={`
          border-b border-slate-700 transition-all duration-300 ease-out relative
          ${isCollapsed ? 'p-0' : 'p-4 px-6'}
        `}>
          {/* Collapsed State - Clean Empty Header (No Logo) */}
          {isCollapsed && (
            <div className="h-12 w-full"></div>
          )}

          {/* Expanded State - Logo + Title + Button */}
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              {/* Logo/Title Section */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Logo Icon */}
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                
                {/* Title Text */}
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent whitespace-nowrap">
                  Admin Panel
                </h1>
              </div>
              
              {/* Enhanced Collapse Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:block p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 will-change-transform flex-shrink-0 group"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          )}

          {/* Clean Expand Button - Top Position */}
          {isCollapsed && (
            <div className="hidden lg:block absolute -right-0 top-4 z-50">
              <button
                onClick={toggleCollapse}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-r-md flex items-center justify-center transition-colors duration-200 shadow-lg border-r border-slate-600"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-3 h-3 text-slate-300 hover:text-white transition-colors duration-200" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMobile}
                className={`
                  group flex items-center rounded-lg 
                  transition-all duration-200 ease-out will-change-transform
                  ${isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'hover:bg-slate-700 hover:text-amber-400 hover:transform hover:scale-[1.01]'
                  }
                  ${isCollapsed ? 'justify-center py-3 px-3' : 'gap-3 py-3 px-3'}
                `}
                title={isCollapsed ? item.label : ''}
              >
                {/* Icon - Always visible and properly positioned */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <Icon className={`
                    w-5 h-5 transition-transform duration-200 ease-out will-change-transform
                    ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                  `} />
                </div>
                
                {/* Label Text - Only visible when expanded */}
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2" />
                    )}
                  </div>
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
                <p className="text-sm font-medium text-white truncate whitespace-nowrap">Admin User</p>
                <p className="text-xs text-slate-400 truncate whitespace-nowrap">admin@courier.com</p>
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