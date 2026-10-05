'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, User, LogOut, Package, UserCircle, Menu, X, Truck } from 'lucide-react';
import LoginRegisterModal from './loginregistermodal';
import { authService } from '@/services/auth.service';
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
  const [activeSection, setActiveSection] = useState('hero');

  // Track active section on scroll
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = [
      { id: 'hero', target: 'hero' },
      { id: 'tracking', target: 'tracking' },
      { id: 'services', target: 'services' },
      { id: 'features', target: 'services' },
      { id: 'pricing', target: 'pricing' },
      { id: 'partner', target: 'partner' },
      { id: 'testimonials', target: 'partner' },
      { id: 'faq', target: 'contact' },
      { id: 'contact', target: 'contact' },
    ];

    const handleScroll = () => {
      // Check if user is scrolled to bottom of page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
        setActiveSection('contact');
        return;
      }

      // Check if near top
      if (window.scrollY < 120) {
        setActiveSection('hero');
        return;
      }

      const scrollPos = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(sections[i].target);
            return;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, sectionId) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        const offset = 70;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        setActiveSection(sectionId);
      }
      setMobileMenuOpen(false);
    }
  };

  const getNavLinkClass = (sectionId) => {
    const isActive = (pathname === '/' && activeSection === sectionId);
    return `px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
      isActive
        ? 'text-teal-800 bg-teal-50 border border-teal-200/90 font-bold shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-medium'
    }`;
  };

  const getMobileNavLinkClass = (sectionId) => {
    const isActive = (pathname === '/' && activeSection === sectionId);
    return `block font-medium py-2.5 text-base border-b border-slate-100 transition-all ${
      isActive
        ? 'text-teal-800 font-bold bg-teal-50/70 border-l-4 border-l-teal-600 pl-3 rounded-r-lg'
        : 'text-slate-700 hover:text-slate-900'
    }`;
  };

  useEffect(() => {
    // Check for existing user session
    const checkUserSession = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();

    // Listen for auth state changes
    const handleAuthChange = (event) => {
      const { user, isAuthenticated } = event.detail;
      if (isAuthenticated && user) {
        setUser(user);
        setShowModal(false);
      } else {
        setUser(null);
        setShowModal(false);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setShowUserMenu(false);
      toast.info('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleLoginSuccess = (userData) => {
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Prime Dispatcher</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="public-mobile-menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Desktop Nav Links */}
        <ul className="hidden xl:flex items-center space-x-1 lg:space-x-2 font-medium relative">
          <li>
            <Link 
              href="/#hero" 
              onClick={(e) => handleNavClick(e, 'hero')}
              className={getNavLinkClass('hero')}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/#tracking" 
              onClick={(e) => handleNavClick(e, 'tracking')}
              className={getNavLinkClass('tracking')}
            >
              Tracking
            </Link>
          </li>
          <li>
            <Link 
              href="/#services" 
              onClick={(e) => handleNavClick(e, 'services')}
              className={getNavLinkClass('services')}
            >
              Services
            </Link>
          </li>
          <li>
            <Link 
              href="/#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className={getNavLinkClass('pricing')}
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link 
              href="/#partner" 
              onClick={(e) => handleNavClick(e, 'partner')}
              className={`flex items-center space-x-1.5 ${getNavLinkClass('partner')}`}
            >
              <span>Partner</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                pathname === '/' && activeSection === 'partner'
                  ? 'bg-teal-100 text-teal-900 border border-teal-300'
                  : 'bg-teal-50 text-teal-700 border border-teal-200/80'
              }`}>
                Earn
              </span>
            </Link>
          </li>
          <li>
            <Link 
              href="/#contact" 
              onClick={(e) => handleNavClick(e, 'contact')}
              className={getNavLinkClass('contact')}
            >
              Contact
            </Link>
          </li>

          {/* My Shipments - visible only if logged in */}
          {!isLoading && user && (
            <li>
              <Link 
                href="/my-shipments" 
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname === '/my-shipments'
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/90 font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-medium'
                }`}
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
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-800"
                  >
                    <div className="h-7 w-7 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center text-xs font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{user.name}</span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>
                  {/* User Dropdown Menu */}
                  <div className={`absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 transition-opacity duration-200 ${userDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  >
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-slate-900 hover:bg-slate-50 font-semibold text-sm border-b border-slate-100"
                      >
                        <Package className="h-4 w-4 mr-2 text-teal-600" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm"
                    >
                      <UserCircle className="h-4 w-4 mr-2 text-slate-500" />
                      Profile
                    </Link>
                    <Link
                      href="/my-shipments"
                      className="flex items-center px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm"
                    >
                      <Package className="h-4 w-4 mr-2 text-slate-500" />
                      My Shipments
                    </Link>
                    <Link
                      href="/partner/dashboard"
                      className="flex items-center px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm border-t border-slate-100"
                    >
                      <Truck className="h-4 w-4 mr-2 text-teal-600" />
                      Partner Fleet Console
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-rose-600 hover:bg-rose-50 text-left text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-rose-600" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 text-sm font-medium shadow-2xs"
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
              className={`font-semibold px-4 py-1.5 rounded-lg transition text-sm shadow-sm whitespace-nowrap block ${
                pathname === '/create-shipment'
                  ? 'bg-teal-700 ring-2 ring-teal-400 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              Book Courier
            </Link>
          </li>
        </ul>

        {/* Mobile Menu */}
        <div id="public-mobile-menu" className={`xl:hidden absolute left-0 right-0 top-full h-[calc(100dvh-61px)] bg-white border-b border-slate-200 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}>
          <div className="flex flex-col h-full bg-white">
            <div className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">
              <Link 
                href="/#hero" 
                className={getMobileNavLinkClass('hero')}
                onClick={(e) => handleNavClick(e, 'hero')}
              >
                Home
              </Link>
              <Link 
                href="/#tracking" 
                className={getMobileNavLinkClass('tracking')}
                onClick={(e) => handleNavClick(e, 'tracking')}
              >
                Tracking
              </Link>
              <Link 
                href="/#services" 
                className={getMobileNavLinkClass('services')}
                onClick={(e) => handleNavClick(e, 'services')}
              >
                Services
              </Link>
              <Link 
                href="/#pricing" 
                className={getMobileNavLinkClass('pricing')}
                onClick={(e) => handleNavClick(e, 'pricing')}
              >
                Pricing
              </Link>
              <Link 
                href="/#partner" 
                className={getMobileNavLinkClass('partner')}
                onClick={(e) => handleNavClick(e, 'partner')}
              >
                Partner Network
              </Link>
              <Link 
                href="/#contact" 
                className={getMobileNavLinkClass('contact')}
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                Contact & Support
              </Link>
              <div className="pt-4">
                <Link
                  href="/create-shipment"
                  className={`w-full font-semibold py-2.5 rounded-lg text-center block shadow-sm ${
                    pathname === '/create-shipment'
                      ? 'bg-teal-700 ring-2 ring-teal-400 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Courier
                </Link>
              </div>

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-slate-200">
                {!isLoading && (
                  <>
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="h-8 w-8 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="truncate">
                            <div className="text-slate-900 font-semibold text-sm">{user.name}</div>
                            <div className="text-slate-500 font-medium text-xs truncate">{user.email}</div>
                          </div>
                        </div>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-2 text-teal-600" />
                            Admin Console
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCircle className="h-4 w-4 mr-2 text-slate-500" />
                          Profile
                        </Link>
                        
                        <Link
                          href="/my-shipments"
                          className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Package className="h-4 w-4 mr-2 text-slate-500" />
                          My Shipments
                        </Link>
                        
                        <Link
                          href="/partner/dashboard"
                          className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium border-t border-slate-100 pt-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Truck className="h-4 w-4 mr-2 text-teal-600" />
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
                        className="w-full border border-slate-200 hover:bg-slate-100 text-slate-800 font-medium px-4 py-2.5 rounded-lg text-sm transition shadow-2xs"
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
