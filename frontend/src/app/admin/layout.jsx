"use client";
import { SidebarProvider } from '@/hooks/useSidebar';
import AdminSidebar from '@/components/admin/sidebar';
import AdminLayoutContent from '@/components/admin/AdminLayoutContent';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

export default function AdminLayout({ children }) {
  return (
    <AdminErrorBoundary>
      <AdminAuthGuard>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <AdminLayoutContent>
              {children}
            </AdminLayoutContent>
          </div>
        </SidebarProvider>
      </AdminAuthGuard>
    </AdminErrorBoundary>
  );
} 