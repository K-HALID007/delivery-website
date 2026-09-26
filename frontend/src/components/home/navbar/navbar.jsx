'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, User, LogOut, Package, UserCircle, Menu, X, Truck } from 'lucide-react';
import LoginRegisterModal from './loginregistermodal';
import { authService } from '@/services/auth.service';
import { FaUser, FaSignOutAlt, FaBox, FaUserCircle } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Navbar() {
  const [activeCountry, setActiveCountry] = useState(null);
  const [showCountries, setShowCountries] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownTimeout = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing user session
    const checkUserSession = () => {
      try {
        const currentUser = authService.getCurrentUser();
        console.log('Current user data:', currentUser);
        console.log('Partner link should be visible:', !currentUser);
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();

    // Listen for auth state changes
    const handleAuthChange = (event) => {
      console.log('Auth state changed:', event.detail);
      const { user, isAuthenticated } = event.detail;
      if (isAuthenticated && user) {
        setUser(user);
        setShowModal(false);
        console.log('User logged in - Partner link hidden');
      } else {
        setUser(null);
        setShowModal(false);
        console.log('User logged out - Partner link visible');
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  // Debug log for Partner link visibility
  useEffect(() => {
    console.log('Partner link visibility check:', {
      isLoading,
      user: !!user,
      shouldShowPartnerLink: !user
    });
  }, [isLoading, user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setShowUserMenu(false);
      toast.info('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const handleLoginSuccess = (userData) => {
    console.log('Login success:', userData);
    setUser(userData);
    setShowModal(false);
  };

  const countries = [
    {
      name: 'India',
      path: '/countries/india',
      states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat'],
    },
    {
      name: 'USA',
      path: '/countries/usa',
      states: ['California', 'Texas', 'Florida', 'New York', 'Illinois'],
    },
    {
      name: 'UAE',
      path: '/countries/uae',
      states: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    },
    {
      name: 'Singapore',
      path: '/countries/singapore',
      states: ['Central', 'North-East', 'East'],
    },
    {
      name: 'Australia',
      path: '/countries/australia',
      states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
    },
  ];

  const handleUserMouseEnter = () => {
    if (userDropdownTimeout.current) clearTimeout(userDropdownTimeout.current);
    setUserDropdownOpen(true);
  };
  const handleUserMouseLeave = () => {
    userDropdownTimeout.current = setTimeout(() => setUserDropdownOpen(false), 180);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-800">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-sm">
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Prime Dispatcher</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center space-x-1 lg:space-x-2 font-medium relative">
          <li>
            <Link 
              href="/#hero" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/#tracking" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              Tracking
            </Link>
          </li>
          <li>
            <Link 
              href="/#services" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              Services
            </Link>
          </li>
          <li>
            <Link 
              href="/#pricing" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link 
              href="/#partner" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-sm font-medium"
            >
              <span>Partner</span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.2 rounded font-semibold">
                Earn
              </span>
            </Link>
          </li>
          <li>
            <Link 
              href="/#contact" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              Contact
            </Link>
          </li>

          {/* My Shipments - visible only if logged in */}
          {!isLoading && user && (
            <li>
              <Link 
                href="/my-shipments" 
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors text-sm font-semibold"
              >
                My Shipments
              </Link>
            </li>
          )}

          {/* User Profile or Login Button */}
          {!isLoading && (
            <li
              className="relative ml-2"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{user.name}</span>
                    <ChevronDown size={14} className="text-slate-600" />
                  </button>
                  {/* User Dropdown Menu */}
                  <div className={`absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 transition-opacity duration-200 ${userDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  >
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-slate-900 hover:bg-slate-50 font-semibold text-sm border-b border-slate-100"
                      >
                        <Package className="h-4 w-4 mr-2 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-slate-800 hover:bg-slate-50 font-medium text-sm"
                    >
                      <UserCircle className="h-4 w-4 mr-2 text-slate-600" />
                      Profile
                    </Link>
                    <Link
                      href="/my-shipments"
                      className="flex items-center px-4 py-2 text-slate-800 hover:bg-slate-50 font-medium text-sm"
                    >
                      <Package className="h-4 w-4 mr-2 text-slate-600" />
                      My Shipments
                    </Link>
                    <Link
                      href="/partner/dashboard"
                      className="flex items-center px-4 py-2 text-slate-800 hover:bg-slate-50 font-medium text-sm border-t border-slate-100"
                    >
                      <Truck className="h-4 w-4 mr-2 text-amber-600" />
                      Partner Fleet Console
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-rose-600 hover:bg-rose-50 text-left text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-rose-500" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 text-sm font-medium"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Sign In</span>
                </button>
              )}
            </li>
          )}

          <li className="ml-1">
            <Link
              href="/create-shipment"
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded-lg transition text-sm shadow-sm whitespace-nowrap block"
            >
              Book Courier
            </Link>
          </li>
        </ul>

        {/* Mobile Menu */}
        <div className={`md:hidden fixed inset-0 top-[65px] bg-white border-b border-slate-200 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full bg-white">
            <div className="flex-1 px-5 py-6 space-y-3 overflow-y-auto">
              <Link 
                href="/#hero" 
                className="block text-slate-700 hover:text-slate-950 font-medium py-2.5 text-base border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/#tracking" 
                className="block text-slate-700 hover:text-slate-950 font-medium py-2.5 text-base border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tracking
              </Link>
              <Link 
                href="/#services" 
                className="block text-slate-700 hover:text-slate-950 font-medium py-2.5 text-base border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/#pricing" 
                className="block text-slate-700 hover:text-slate-950 font-medium py-2.5 text-base border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/#partner" 
                className="block text-slate-700 hover:text-slate-950 font-medium py-2.5 text-base border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Partner Network
              </Link>
              <Link 
                href="/#contact" 
                className="block text-slate-700 hover:text-slate-950 font-medium py-2.5 text-base border-b border-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact & Support
              </Link>
              <div className="pt-4">
                <Link
                  href="/create-shipment"
                  className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg text-center block shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Courier
                </Link>
              </div>

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-slate-100">
                {!isLoading && (
                  <>
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="truncate">
                            <div className="text-slate-900 font-semibold text-sm">{user.name}</div>
                            <div className="text-slate-600 font-medium text-xs truncate">{user.email}</div>
                          </div>
                        </div>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-semibold"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-2 text-amber-600" />
                            Admin Console
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          className="flex items-center px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCircle className="h-4 w-4 mr-2 text-slate-600" />
                          Profile
                        </Link>
                        
                        <Link
                          href="/my-shipments"
                          className="flex items-center px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Package className="h-4 w-4 mr-2 text-slate-600" />
                          My Shipments
                        </Link>
                        
                        <Link
                          href="/partner/dashboard"
                          className="flex items-center px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium border-t border-slate-100 pt-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Truck className="h-4 w-4 mr-2 text-amber-600" />
                          Partner Fleet Console
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left text-sm"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium px-4 py-2.5 rounded-lg text-sm transition"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Login/Register Modal */}
      {/* Only show login modal if not on /track-package and after auth check */}
      {!isLoading && showModal && pathname !== '/track-package' && (
        <LoginRegisterModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

          </>
  );
}
