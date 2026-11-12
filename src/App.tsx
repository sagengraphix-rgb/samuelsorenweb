import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { DonationModal } from './components/DonationModal';
import { HomePage } from './pages/HomePage';
import { MinistryPage } from './pages/MinistryPage';
import { BlogPage } from './pages/BlogPage';
import { ShopPage } from './pages/ShopPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'ministry' | 'blog' | 'shop' | 'about' | 'contact' | 'admin'>('home');
  const [pageParam, setPageParam] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [donateCause, setDonateCause] = useState<string | undefined>(undefined);

  // Parse path on initial load if user visited /admin or /blog etc.
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'admin') {
      setCurrentPage('admin');
    } else if (path === 'blog') {
      setCurrentPage('blog');
    } else if (path === 'shop') {
      setCurrentPage('shop');
    } else if (path === 'ministry') {
      setCurrentPage('ministry');
    } else if (path === 'about') {
      setCurrentPage('about');
    } else if (path === 'contact') {
      setCurrentPage('contact');
    }
  }, []);

  const handleNavigate = (page: string, param?: string) => {
    setCurrentPage(page as any);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL history without reload
    const cleanUrl = param ? `/${page}/${param}` : page === 'home' ? '/' : `/${page}`;
    window.history.pushState({}, '', cleanUrl);
  };

  const handleOpenDonate = (cause?: string) => {
    setDonateCause(cause);
    setIsDonateOpen(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-800 antialiased selection:bg-[#C83338] selection:text-white">
          
          {/* Header - Shown on all pages except full admin */}
          {currentPage !== 'admin' && (
            <Header
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenDonate={() => handleOpenDonate()}
            />
          )}

          {/* Main Content Router */}
          <main className="flex-1">
            {currentPage === 'home' && (
              <HomePage
                onNavigate={handleNavigate}
                onOpenDonate={(cause) => handleOpenDonate(cause)}
              />
            )}
            {currentPage === 'ministry' && <MinistryPage initialSlug={pageParam} onNavigate={handleNavigate} />}
            {currentPage === 'blog' && <BlogPage initialSlug={pageParam} onNavigate={handleNavigate} />}
            {currentPage === 'shop' && <ShopPage initialSlug={pageParam} onNavigate={handleNavigate} />}
            {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
            {currentPage === 'contact' && <ContactPage />}
            {currentPage === 'admin' && (
              <div>
                {/* Admin Header with quick return to public website */}
                <div className="bg-neutral-900 text-neutral-400 px-4 py-2 text-xs flex justify-between items-center border-b border-neutral-800">
                  <span>Pastor Samuel Soren Ministries &middot; Management System</span>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="text-white hover:text-[#C83338] font-bold underline-offset-4 hover:underline"
                  >
                    &larr; View Public Ministry Website
                  </button>
                </div>
                <AdminDashboard />
              </div>
            )}
          </main>

          {/* Footer - Shown on public pages */}
          {currentPage !== 'admin' && (
            <Footer
              onNavigate={handleNavigate}
              onOpenDonate={() => handleOpenDonate()}
            />
          )}

          {/* Global Modals & Drawers */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onNavigate={handleNavigate}
          />
          <CartDrawer onNavigate={handleNavigate} />
          <CheckoutModal />

          {/* Donation / Giving Modal */}
          <DonationModal
            isOpen={isDonateOpen}
            onClose={() => setIsDonateOpen(false)}
            initialCause={donateCause}
          />

        </div>
      </CartProvider>
    </AuthProvider>
  );
}
