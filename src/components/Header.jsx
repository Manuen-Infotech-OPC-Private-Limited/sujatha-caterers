import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logos/logo-nobg.png';
import { toast } from 'react-toastify';
import { useAuthContext } from '../utils/AuthContext';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact Us', path: '/contact' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuthContext();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel on navigation and lock scroll while it's open.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const linkClass = (path) =>
    `relative rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
      isActive(path)
        ? 'text-brand-600'
        : 'text-sand-700 hover:bg-sand-100 hover:text-sand-900'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 font-sans transition-all duration-300 ${
        scrolled
          ? 'border-b border-sand-200 bg-sand-50/85 backdrop-blur-md'
          : 'border-b border-transparent bg-sand-50/60 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <button
          onClick={() => handleNavigate('/')}
          aria-label="Sujatha Caterers — home"
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <img src={logo} alt="Sujatha Caterers" className="h-10 w-auto" />
        </button>

        {/* ---------- desktop nav ---------- */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, path }) => (
            <button key={path} onClick={() => handleNavigate(path)} className={linkClass(path)}>
              {label}
              {isActive(path) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-500" />
              )}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <button onClick={() => handleNavigate('/profile')} className={linkClass('/profile')}>
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border-2 border-sand-300 px-4 py-2 text-[0.9375rem] font-semibold text-sand-800 transition-colors hover:border-sand-400 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavigate('/login')}
              className="rounded-lg bg-brand-500 px-5 py-2 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Log in
            </button>
          )}
        </div>

        {/* ---------- mobile toggle ---------- */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-sand-800 transition-colors hover:bg-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 md:hidden"
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span
              className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute top-1/2 left-0 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-all duration-200 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
              }`}
            />
          </span>
        </button>
      </nav>

      {/* ---------- mobile panel ---------- */}
      <div
        className={`overflow-hidden border-t border-sand-200 bg-sand-50/95 backdrop-blur-md transition-all duration-300 md:hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {NAV_LINKS.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className={`rounded-lg px-3 py-3 text-left text-base font-medium transition-colors ${
                isActive(path)
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-sand-700 hover:bg-sand-100'
              }`}
            >
              {label}
            </button>
          ))}

          <div className="mt-2 border-t border-sand-200 pt-3">
            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-sand-700 transition-colors hover:bg-sand-100"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-3 py-3 text-left text-base font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full rounded-xl bg-brand-500 px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
