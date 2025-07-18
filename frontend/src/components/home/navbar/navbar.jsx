'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, User, LogOut, Package, UserCircle, Menu, X } from 'lucide-react';
import LoginRegisterModal from './loginregistermodal';
import { authService } from '@/services/auth.service';
import { FaUser, FaSignOutAlt, FaBox, FaUserCircle } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';

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
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 shadow-md bg-slate-800 text-slate-300">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[42px] sm:h-[42px]">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="30%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
              <rect width="42" height="42" rx="8" fill="url(#logoGradient)" />
              <path
                d="M12 28h1.5a2 2 0 104 0h7a2 2 0 104 0H30v-7l-2-3h-4v-2h-5v5h-7v7z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold text-amber-400 hidden xs:block">Prime Dispatcher</span>
          <span className="text-lg font-bold text-amber-400 block xs:hidden">PD</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center space-x-4 lg:space-x-6 font-medium relative">
          <li>
            <Link 
              href="/" 
              className="text-slate-300 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/services" 
              className="text-slate-300 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200"
            >
              Services
            </Link>
          </li>
          <li>
            <Link 
              href="/pricing" 
              className="text-slate-300 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200"
            >
              Pricing
            </Link>
          </li>
          {/* Countries Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setShowCountries(true)}
            onMouseLeave={() => {
              setShowCountries(false);
              setActiveCountry(null);
            }}
          >
            <button className="flex items-center gap-1 text-slate-300 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200 border-none bg-transparent cursor-pointer">
              Countries
              <ChevronDown size={16} />
            </button>
            {showCountries && (
              <ul className="absolute top-8 left-0 w-48 bg-slate-700 text-slate-200 rounded shadow-lg py-2 z-50">
                {countries.map((country) => (
                  <li
                    key={country.name}
                    className="relative group"
                    onMouseEnter={() => setActiveCountry(country.name)}
                    onMouseLeave={() => setActiveCountry(null)}
                  >
                    <Link
                      href={country.path}
                      className="flex justify-between items-center px-4 py-2 hover:bg-slate-600 whitespace-nowrap"
                    >
                      {country.name}
                      <ChevronRight size={16} />
                    </Link>
                    {activeCountry === country.name && (
                      <ul className="absolute top-0 left-full w-56 bg-slate-600 text-white rounded shadow-md z-50">
                        {country.states.map((state) => (
                          <li key={state}>
                            <Link
                              href={`${country.path}/${state.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block px-4 py-2 hover:bg-slate-500 whitespace-nowrap"
                            >
                              {state}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
          {/* My Shipments - visible only if logged in */}
          {!isLoading && user && (
            <li>
              <Link 
                href="/my-shipments" 
                className="text-slate-300 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200"
              >
                My Shipments
              </Link>
            </li>
          )}
          <li>
            <Link 
              href="/contact" 
              className="text-slate-300 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200"
            >
              Contact
            </Link>
          </li>
          {/* Partner link - Enhanced visibility when user is not logged in */}
          {!user && (
            <li>
              <Link 
                href="/partner" 
                className="text-slate-300 hover:text-amber-400 px-4 py-2 rounded transition-colors duration-200 flex items-center space-x-2 group"
              >
                <span>Partner</span>
                <span className="text-xs bg-amber-500 group-hover:bg-amber-400 text-white px-2 py-0.5 rounded-full transition-colors duration-200">
                  Join
                </span>
              </Link>
            </li>
          )}

          {/* User Profile or Login Button */}
          {!isLoading && (
            <li
              className="relative"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center overflow-hidden">
                      {user.name ? (
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <FaUserCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  {/* User Dropdown Menu - open on hover with delay */}
                  <div className={`absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-lg py-2 z-50 transition-opacity duration-200 ${userDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  >
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-slate-200 hover:bg-slate-600"
                    >
                      <UserCircle className="h-5 w-5 mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/my-shipments"
                      className="flex items-center px-4 py-2 text-slate-200 hover:bg-slate-600"
                    >
                      <Package className="h-5 w-5 mr-2" />
                      My Shipments
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-slate-200 hover:bg-slate-600"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </button>
              )}
            </li>
          )}

          <li>
            <button
              onClick={() => {
                if (authService.isAuthenticated()) {
                  router.push('/track-package');
                } else {
                  setShowModal(true);
                }
              }}
              className="bg-amber-500 text-white px-3 lg:px-4 py-2 rounded hover:bg-amber-600 transition text-sm lg:text-base"
            >
              Track Package
            </button>
          </li>
        </ul>

        {/* Mobile Menu */}
        <div className={`md:hidden fixed inset-0 top-[72px] bg-slate-800 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
              {/* Mobile Nav Links */}
              <Link 
                href="/" 
                className="block text-slate-300 hover:text-orange-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                href="/services" 
                className="block text-slate-300 hover:text-orange-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              
              <Link 
                href="/pricing" 
                className="block text-slate-300 hover:text-orange-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              {/* Mobile Countries Dropdown */}
              <div className="space-y-2">
                <button 
                  onClick={() => setShowCountries(!showCountries)}
                  className="flex items-center justify-between w-full text-slate-300 hover:text-orange-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                >
                  Countries
                  <ChevronDown size={20} className={`transform transition-transform ${showCountries ? 'rotate-180' : ''}`} />
                </button>
                {showCountries && (
                  <div className="pl-4 space-y-2">
                    {countries.map((country) => (
                      <Link
                        key={country.name}
                        href={country.path}
                        className="block text-slate-400 hover:text-orange-400 px-4 py-2 rounded transition-colors duration-200"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowCountries(false);
                        }}
                      >
                        {country.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* My Shipments - visible only if logged in */}
              {!isLoading && user && (
                <Link 
                  href="/my-shipments" 
                  className="block text-slate-300 hover:text-orange-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Shipments
                </Link>
              )}
              
              <Link 
                href="/contact" 
                className="block text-slate-300 hover:text-orange-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Partner link - Enhanced visibility when user is not logged in */}
              {!user && (
                <Link 
                  href="/partner" 
                  className="block text-slate-300 hover:text-amber-400 px-4 py-3 rounded transition-colors duration-200 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span>Partner</span>
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                      Join
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile User Section */}
            <div className="border-t border-slate-700 p-4">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 px-4 py-3 bg-slate-700 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center overflow-hidden">
                          {user.name ? (
                            <span className="text-white font-medium text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <FaUserCircle className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-slate-400 text-sm">{user.email}</div>
                        </div>
                      </div>

                      {/* User Menu Items */}
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserCircle className="h-5 w-5 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        href="/my-shipments"
                        className="flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Package className="h-5 w-5 mr-3" />
                        My Shipments
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <User className="w-5 h-5" />
                        <span>Login</span>
                      </button>
                    </div>
                  )}

                  {/* Track Package Button */}
                  <button
                    onClick={() => {
                      if (authService.isAuthenticated()) {
                        router.push('/track-package');
                      } else {
                        setShowModal(true);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition mt-3"
                  >
                    Track Package
                  </button>
                </>
              )}
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
