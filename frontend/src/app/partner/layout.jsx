'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PartnerProvider, usePartner } from '../../contexts/PartnerContext.js';
import { ToastProvider } from '../../contexts/ToastContext.js';

// Enhanced Sidebar Component
function Sidebar() {
  const { partner, onlineStatus, toggleOnlineStatus, logout, stats } = usePartner();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleOnline = async () => {
    try {
      await toggleOnlineStatus();
    } catch (error) {
      console.error('Error toggling online status:', error);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/partner/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      badge: null
    },
    {
      name: 'Deliveries',
      href: '/partner/deliveries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: stats?.activeDeliveries || null,
      badgeColor: 'bg-yellow-500'
    },
    {
      name: 'Profile',
      href: '/partner/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      badge: null
    }
  ];

  
  return (
    <div className={`hidden md:flex ${isCollapsed ? 'md:w-20' : 'md:w-72'} md:flex-col md:fixed md:inset-y-0 transition-all duration-300`}>
      <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl border-r border-yellow-400/20">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {!isCollapsed && (
                <span className="ml-3 text-white font-bold text-xl">
                  <span className="text-yellow-400">Prime</span> Dispatcher
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-yellow-400 p-1 rounded-md hover:bg-slate-700 transition-colors"
            >
              <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Partner Info */}
          <div className="mt-6 px-4">
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-yellow-400/20">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-slate-800 font-bold text-lg">
                      {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-700 ${
                    onlineStatus ? 'bg-yellow-400' : 'bg-slate-400'
                  }`}></div>
                </div>
                {!isCollapsed && (
                  <div className="ml-4 flex-1">
                    <p className="text-white text-sm font-semibold truncate">{partner?.name || 'Partner'}</p>
                    <p className="text-slate-300 text-xs truncate">{partner?.email}</p>
                  </div>
                )}
              </div>
              
              {/* Online Status Toggle */}
              {!isCollapsed && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-slate-300 text-sm font-medium">Status:</span>
                  <button
                    onClick={handleToggleOnline}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      onlineStatus
                        ? 'bg-yellow-400 text-slate-800 shadow-lg shadow-yellow-400/25'
                        : 'bg-slate-500 text-white shadow-lg shadow-slate-500/25'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      onlineStatus ? 'bg-slate-800' : 'bg-slate-300'
                    }`}></div>
                    <span>{onlineStatus ? 'Online' : 'Offline'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          
          {/* Navigation */}
          <nav className="mt-6 flex-1 px-3 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0]);
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl w-full transition-all duration-200 ${
                    isActive ? 'transform scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">{item.name}</span>
                      {item.badge !== null && (
                        <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                          isActive 
                            ? 'bg-slate-800 text-yellow-400' 
                            : 'text-white ' + (item.badgeColor || 'bg-slate-500')
                        }`}>
                          {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Logout Button */}
        <div className="flex-shrink-0 border-t border-yellow-400/20 p-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile Sidebar
function MobileSidebar({ isOpen, onClose }) {
  const { partner, onlineStatus, toggleOnlineStatus, logout } = usePartner();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggleOnline = async () => {
    try {
      await toggleOnlineStatus();
    } catch (error) {
      console.error('Error toggling online status:', error);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/partner/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      name: 'Deliveries',
      href: '/partner/deliveries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Profile',
      href: '/partner/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 flex z-40">
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75" onClick={onClose}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-yellow-400/20">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={onClose}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-400"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="ml-2 text-white font-bold text-lg">
                  <span className="text-yellow-400">Prime</span> Dispatcher
                </span>
              </div>
            </div>

            {/* Partner Info */}
            <div className="mt-5 px-4">
              <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/20">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-slate-800 font-medium text-sm">
                      {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-white text-sm font-medium">{partner?.name || 'Partner'}</p>
                    <p className="text-slate-300 text-xs">{partner?.email}</p>
                  </div>
                </div>
                
                {/* Online Status Toggle */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Status:</span>
                  <button
                    onClick={handleToggleOnline}
                    className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${
                      onlineStatus
                        ? 'bg-yellow-400 text-slate-800'
                        : 'bg-slate-500 text-white'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      onlineStatus ? 'bg-slate-800' : 'bg-slate-300'
                    }`}></div>
                    <span>{onlineStatus ? 'Online' : 'Offline'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      onClose();
                    }}
                    className={`${
                      isActive
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="flex-shrink-0 flex border-t border-yellow-400/20 p-4">
            <button
              onClick={logout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div className="text-slate-300 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-white">
                    Logout
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerLayoutContent({ children }) {
  const { loading, logout } = usePartner();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public partner auth pages
    if (['/partner', '/partner/login', '/partner/register'].includes(pathname)) {
      return;
    }

    // For all other partner routes, check authentication
    const checkAuth = async () => {
      const partnerService = (await import('../../services/partner.service.js')).default;
      if (!partnerService.isLoggedIn()) {
        router.push('/partner');
        return;
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    logout();
    router.push('/partner');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If on main partner page, don't show sidebar
  if (pathname === '/partner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-72">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-slate-800 shadow-sm border-b border-yellow-400/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-slate-300 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-400"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function PartnerLayout({ children }) {
  return (
    <PartnerProvider>
      <ToastProvider>
        <PartnerLayoutContent>{children}</PartnerLayoutContent>
      </ToastProvider>
    </PartnerProvider>
  );
}