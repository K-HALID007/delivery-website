"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function AdminAuthGuard({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 AdminAuthGuard: Checking authentication...');
        
        // Add a small delay to ensure session storage is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user is authenticated and is admin
        const authenticated = authService.isAuthenticated();
        const isAdmin = authService.isAdmin();
        const currentUser = authService.getCurrentUser();
        
        console.log('🔐 Auth check results:', { 
          authenticated, 
          isAdmin, 
          user: currentUser,
          hasToken: !!sessionStorage.getItem('admin_token') || !!sessionStorage.getItem('user_token')
        });
        
        if (!authenticated) {
          console.log('❌ Not authenticated, redirecting to home');
          router.push('/');
          return;
        }
        
        if (!isAdmin) {
          console.log('❌ Not admin, redirecting to home');
          router.push('/');
          return;
        }
        
        console.log('✅ Admin authentication successful');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = (event) => {
      const { user, isAuthenticated } = event.detail;
      console.log('🔄 Auth change event:', { user, isAuthenticated });
      if (!isAuthenticated || user?.role !== 'admin') {
        console.log('🔄 Auth changed - redirecting to home');
        router.push('/');
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
}