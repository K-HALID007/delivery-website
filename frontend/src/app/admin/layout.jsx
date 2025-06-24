"use client";
import { SidebarProvider } from '@/hooks/useSidebar';
import AdminSidebar from '@/components/admin/sidebar';
import AdminLayoutContent from '@/components/admin/AdminLayoutContent';

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </div>
    </SidebarProvider>
  );
} 