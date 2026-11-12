import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Heart, Youtube, Facebook, Instagram, Twitter, ExternalLink, X, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenDonate?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDonate }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#252525] text-neutral-300 pt-16 pb-12 border-t-4 border-[#C83338]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-neutral-700/60">
          
          {/* Column 1: Ministry Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xs bg-[#C83338] text-white flex items-center justify-center font-bold text-lg">
                SS
              </div>
              <span className="font-heading font-extrabold text-xl text-white tracking-wide">
                SAMUEL <span className="text-[#C83338]">SOREN</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium tracking-wider uppercase text-[#C83338]">
              PASTOR &middot; AUTHOR &middot; WORSHIP LEADER &middot; SPEAKER
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              &ldquo;Faith That Inspires. Purpose That Transforms.&rdquo; Serving adults, youth and children across Godda, Jharkhand and beyond through Christ-centered discipleship and anointed worship.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-neutral-400">
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#C83338] hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#C83338] hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#C83338] hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#C83338] hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white border-l-2 border-[#C83338] pl-2">
              QUICK NAVIGATION
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white hover:translate-x-1 transition-all text-neutral-300">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ministry')} className="hover:text-white hover:translate-x-1 transition-all text-neutral-300">
                  Ministries & Outreach
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white hover:translate-x-1 transition-all text-neutral-300">
                  Blog & Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white hover:translate-x-1 transition-all text-neutral-300">
                  Books & Resources Shop
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white hover:translate-x-1 transition-all text-neutral-300">
                  About Pastor Samuel Soren
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white hover:translate-x-1 transition-all text-neutral-300">
                  Contact & Prayer Requests
                </button>
              </li>
              {onOpenDonate && (
                <li>
                  <button
                    onClick={onOpenDonate}
                    className="hover:text-white hover:translate-x-1 transition-all text-[#C83338] font-bold flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 fill-[#C83338]" />
                    <span>Give / Tithes & Offerings</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Ministry Focus */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white border-l-2 border-[#C83338] pl-2">
              MINISTRY PILLARS
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C83338]" />
                <span>Sacred Assemblies Fellowship</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C83338]" />
                <span>Anointed Praise & Worship</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C83338]" />
                <span>Rural Jharkhand Missions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C83338]" />
                <span>Ignite Youth Fellowship</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C83338]" />
                <span>Kingdom Kids Sunday School</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C83338]" />
                <span>Expository Bible Teaching</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Church Fellowship & Location */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white border-l-2 border-[#C83338] pl-2">
              FELLOWSHIP GATHERINGS
            </h3>
            <div className="text-sm space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C83338] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Sacred Assemblies Fellowship Church<br />
                  Guru Nagar, Gangta, Godda, Jharkhand 814133
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C83338] shrink-0 mt-0.5" />
                <span>
                  <strong>Sunday:</strong> 09:00 AM IST<br />
                  <strong>Wednesday:</strong> 6:00 PM Prayer
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C83338] shrink-0" />
                <a href="tel:+919671960792" className="hover:text-white transition-colors">
                  +91 96719 60792
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C83338] shrink-0" />
                <a href="mailto:sorensam84@gmail.com" className="hover:text-white transition-colors">
                  sorensam84@gmail.com 
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Pastor Samuel Soren. All rights reserved. 
          </p>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setModalType('privacy')}
              className="hover:text-neutral-200 transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalType('terms')}
              className="hover:text-neutral-200 transition-colors underline-offset-4 hover:underline"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-neutral-200 transition-colors underline-offset-4 hover:underline"
            >
              Prayer Request
            </button>
            {onOpenDonate && (
              <button
                onClick={onOpenDonate}
                className="text-[#C83338] hover:text-white font-bold transition-colors underline-offset-4 hover:underline flex items-center gap-1"
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Donate</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
              title="Pastor Samuel Soren Administration"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-sm max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-1 text-neutral-500 hover:text-neutral-900"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            {modalType === 'privacy' ? (
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-xl text-[#252525]">Privacy Policy</h2>
                <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
                  <p>
                    <strong>Confidentiality of Prayer Requests & Submissions:</strong> At Pastor Samuel Soren Ministries, your personal trust and privacy are sacred. All contact messages, counseling inquiries, and prayer requests submitted through this website are stored strictly in private, protected database collections accessible only by authenticated pastoral leadership.
                  </p>
                  <p>
                    <strong>Information Collection:</strong> We collect names and email addresses only when provided voluntarily through our contact form, shop checkout, or newsletter subscription. We never sell, rent, or distribute personal data to third parties.
                  </p>
                  <p>
                    <strong>Security:</strong> All administrative interfaces are protected with server-verified credentials, encryption, and strict role-based access controls.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-xl text-[#252525]">Terms & Conditions</h2>
                <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
                  <p>
                    <strong>Ministry Resources & Content:</strong> The sermons, blog teachings, musical works, and books authored by Pastor Samuel Soren are provided for spiritual edification and Christian discipleship.
                  </p>
                  <p>
                    <strong>Shop & Orders:</strong> Physical books are dispatched within 2-3 working days via postal courier. Digital e-books and audio albums are delivered instantly upon server verification of payment.
                  </p>
                  <p>
                    <strong>Church Affiliation:</strong> Pastor Samuel Soren ministers in fellowship with Sacred Assemblies Fellowship Church, Guru Nagar, Godda, Jharkhand, India.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-200 mt-6 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-[#C83338] text-white text-xs font-bold rounded-xs hover:bg-[#a62529]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
