"use client";
import { useSidebar } from '@/hooks/useSidebar';

export default function AdminLayoutContent({ children }) {
  const { isCollapsed } = useSidebar();

  return (
    <main className={`
      transition-all duration-300 ease-in-out min-h-screen
      ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      pt-16 lg:pt-0
    `}>
      <div className="p-4 lg:p-8">
        {children}
      </div>
    </main>
  );
}