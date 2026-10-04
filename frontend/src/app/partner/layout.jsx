'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PartnerProvider, usePartner } from '../../contexts/PartnerContext.js';
import { ToastProvider } from '../../contexts/ToastContext.js';
import partnerService from '../../services/partner.service.js';
import {
  LayoutDashboard, Package, BarChart2, User, LogOut,
  Menu, X
} from 'lucide-react';

/* ─── Nav items ─────────────────────────────────────────────── */
const NAV = [
  { name: 'Dashboard',  href: '/partner/dashboard',  icon: LayoutDashboard },
  { name: 'Deliveries', href: '/partner/deliveries', icon: Package },
  { name: 'Earnings',   href: '/partner/earnings',   icon: BarChart2, badgeKey: null },
  { name: 'Account',    href: '/partner/profile',    icon: User },
];

/* ─── Sidebar (desktop) ─────────────────────────────────────── */
function Sidebar({ onLogout }) {
  const { partner, onlineStatus, toggleOnlineStatus, stats } = usePartner();
  const router = useRouter();
  const pathname = usePathname();
  const toggle = async () => { try { await toggleOnlineStatus(); } catch (e) {} };

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200">

      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-sm tracking-tight">Prime Dispatcher</span>
          </div>
      </div>

      {/* Partner pill */}
        <div className="px-3 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-semibold text-sm">
                {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${onlineStatus ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-semibold truncate">{partner?.name || 'Partner'}</p>
              <p className="text-slate-500 text-xs truncate">{partner?.email}</p>
            </div>
          </div>
          {/* Online toggle */}
          <button
            onClick={toggle}
            className={`mt-2 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              onlineStatus
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlineStatus ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            {onlineStatus ? 'Online' : 'Go Online'}
          </button>
        </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ name, href, icon: Icon, badgeKey }) => {
          const isActive = pathname === href || (href !== '/partner/dashboard' && pathname.startsWith(href));
          const badge = badgeKey ? stats?.[badgeKey] : null;
          return (
            <button
              key={name}
              onClick={() => router.push(href)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-800 border border-teal-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{name}</span>
              {badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">{badge > 99 ? '99+' : badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

/* ─── Mobile drawer ─────────────────────────────────────────── */
function MobileDrawer({ isOpen, onClose, onLogout }) {
  const { partner, onlineStatus, toggleOnlineStatus, stats } = usePartner();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = async () => { try { await toggleOnlineStatus(); } catch (e) {} };
  const go = (href) => { router.push(href); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-sm">Prime Dispatcher</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Partner */}
        <div className="px-3 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-semibold text-sm">
                {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${onlineStatus ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-semibold truncate">{partner?.name}</p>
              <p className="text-slate-500 text-xs truncate">{partner?.email}</p>
            </div>
          </div>
          <button onClick={toggle} className={`mt-2 w-full py-1.5 rounded-lg text-xs font-semibold border transition-all ${onlineStatus ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            {onlineStatus ? '🟢 Online' : '⚫ Offline'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/partner/dashboard' && pathname.startsWith(href));
            return (
              <button key={name} onClick={() => go(href)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{name}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-slate-100">
          <button onClick={() => { onLogout(); onClose(); }} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Layout content ────────────────────────────────────────── */
function PartnerLayoutContent({ children }) {
  const { loading, logout } = usePartner();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (['/partner', '/partner/login', '/partner/register'].includes(pathname)) return;
    if (!partnerService.isLoggedIn()) router.push('/partner');
  }, [pathname, router]);

  const handleLogout = () => { logout(); router.push('/partner'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/partner') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />

      {/* Content */}
      <div className="md:pl-64 transition-all duration-200">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200">
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-sm">Prime Dispatcher</span>
          </div>
          <div className="w-8"></div>
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

/* ─── Root export ───────────────────────────────────────────── */
export default function PartnerLayout({ children }) {
  return (
    <PartnerProvider>
      <ToastProvider>
        <PartnerLayoutContent>{children}</PartnerLayoutContent>
      </ToastProvider>
    </PartnerProvider>
  );
}
