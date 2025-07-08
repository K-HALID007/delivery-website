"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function AdminLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const checkAuth = async () => {
      try {
        console.log('🔐 Checking admin authentication...');
        
        // Small delay to ensure session storage is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const authenticated = authService.isAuthenticated();
        const isAdmin = authService.isAdmin();
        const user = authService.getCurrentUser();
        
        console.log('🔐 Auth results:', { authenticated, isAdmin, user });
        
        if (!authenticated || !isAdmin) {
          console.log('❌ Not authenticated as admin, redirecting to home');
          router.push('/');
          return;
        }
        
        console.log('✅ Admin authentication successful');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth error:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}