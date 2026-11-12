import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, Youtube, Facebook, Instagram, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenDonate?: () => void;
  onOpenAuth?: () => void;
  onOpenAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenSearch,
  onOpenDonate,
  onOpenAuth,
  onOpenAccount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'ministry', label: 'MINISTRY' },
    { id: 'blog', label: 'BLOG' },
    { id: 'shop', label: 'SHOP' },
    { id: 'about', label: 'ABOUT' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-4">
          
          {/* Logo: Site Icon & Samuel Soren strictly in ONE LINE on mobile */}
          <div className="flex items-center min-w-0 shrink">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left group focus:outline-hidden flex-nowrap"
              aria-label="Pastor Samuel Soren Homepage"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-[#C83338] text-white flex items-center justify-center font-bold text-sm sm:text-xl tracking-tighter shadow-xs shrink-0">
                SS
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-heading font-extrabold text-[15px] sm:text-2xl tracking-tight sm:tracking-wider leading-none text-[#252525] whitespace-nowrap">
                  SAMUEL <span className="text-[#C83338]">SOREN</span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-widest text-neutral-500 mt-1">
                  MINISTRY &middot; GODDA
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 text-xs font-bold tracking-wider uppercase transition-colors relative ${
                    isActive
                      ? 'text-[#C83338]'
                      : 'text-neutral-700 hover:text-[#C83338]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C83338]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* Social Icons (Desktop) */}
            <div className="hidden xl:flex items-center space-x-2 text-neutral-500 pr-2 border-r border-neutral-200">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:text-[#C83338] transition-colors"
                aria-label="YouTube Channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:text-[#C83338] transition-colors"
                aria-label="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:text-[#C83338] transition-colors"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-neutral-600 hover:text-[#C83338] transition-colors rounded-sm hover:bg-neutral-100"
              aria-label="Search articles and ministries"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 sm:p-2 text-neutral-600 hover:text-[#C83338] transition-colors rounded-sm hover:bg-neutral-100 relative"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C83338] text-white text-[9px] sm:text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Public Sign-In */}
            {user ? (
              <button
                onClick={onOpenAccount}
                className="p-1 sm:px-2.5 sm:py-1 text-neutral-700 hover:text-[#C83338] transition-colors rounded-md hover:bg-neutral-100 flex items-center space-x-1.5 shrink-0"
                aria-label="My Account"
                title={`Signed in as ${user.name}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#30203D] text-white flex items-center justify-center text-[11px] font-bold uppercase shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden md:inline text-xs font-bold max-w-[70px] truncate text-neutral-800">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-neutral-700 hover:text-[#C83338] transition-colors rounded-md hover:bg-neutral-100 flex items-center space-x-1 shrink-0"
                aria-label="Member Sign In"
                title="Member Sign In / Register"
              >
                <UserIcon className="w-4 h-4 text-neutral-700" />
                <span className="hidden sm:inline text-[11px] font-bold tracking-wider uppercase">
                  Sign In
                </span>
              </button>
            )}

            {/* DONATE BUTTON */}
            {onOpenDonate && (
              <button
                onClick={onOpenDonate}
                className="px-2 py-1.5 sm:px-3 sm:py-1.5 bg-[#C83338] hover:bg-[#b0282d] text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-md shadow-xs transition flex items-center space-x-1 group shrink-0"
                aria-label="Make a Donation or Offering"
              >
                <span className="group-hover:scale-110 transition-transform">❤️</span>
                <span className="hidden sm:inline">DONATE</span>
                <span className="sm:hidden">GIVE</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle - Guaranteed fully visible */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-neutral-800 hover:text-[#C83338] hover:bg-neutral-100 rounded-sm focus:outline-hidden shrink-0 flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-900" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-900" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left px-3 py-2.5 text-sm font-bold tracking-wider uppercase rounded-sm transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-[#C83338]'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-[#C83338]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Mobile Member Sign In / Account Button */}
            {user ? (
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccount?.();
                  }}
                  className="flex items-center space-x-2 text-left py-2 px-3 bg-neutral-100 rounded-md flex-1 mr-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[#30203D] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 truncate">{user.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{user.email}</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-2 text-neutral-500 hover:text-red-600 rounded-md hover:bg-neutral-100"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth?.();
                }}
                className="mt-1 w-full py-2.5 px-3 border border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center space-x-1.5 hover:bg-neutral-50"
              >
                <UserIcon className="w-4 h-4 text-neutral-600" />
                <span>Member Sign In / Register</span>
              </button>
            )}

            {onOpenDonate && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDonate();
                }}
                className="mt-2 w-full py-3 px-4 bg-[#C83338] text-white font-bold text-sm tracking-wider uppercase rounded-md shadow-xs flex items-center justify-center space-x-2"
              >
                <span>❤️</span>
                <span>PARTNER & DONATE NOW</span>
              </button>
            )}
          </nav>
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Follow Ministry:</span>
            <div className="flex items-center space-x-3 text-neutral-600">
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-1 hover:text-[#C83338]">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-1 hover:text-[#C83338]">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-1 hover:text-[#C83338]">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
