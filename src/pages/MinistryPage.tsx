import React, { useState, useEffect } from 'react';
import { Ministry } from '../types';
import { HeartHandshake, Calendar, Users, BookOpen, Clock, ArrowRight, X, Sparkles } from 'lucide-react';

interface MinistryPageProps {
  initialSlug?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const MinistryPage: React.FC<MinistryPageProps> = ({ initialSlug, onNavigate }) => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMinistries() {
      try {
        const res = await fetch('/api/ministries');
        const data: Ministry[] = await res.json();
        setMinistries(data);

        if (initialSlug) {
          const match = data.find((m) => m.slug === initialSlug);
          if (match) setSelectedMinistry(match);
        }
      } catch (err) {
        console.error('Failed to load ministries:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMinistries();
  }, [initialSlug]);

  const categories = ['All', 'Church', 'Worship', 'Youth & Children', 'Missions & Teaching'];

  const filteredMinistries = ministries.filter((m) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Church') return m.title.includes('Church') || m.title.includes('Discipleship');
    if (activeFilter === 'Worship') return m.title.includes('Worship');
    if (activeFilter === 'Youth & Children') return m.title.includes('Youth') || m.title.includes('Children');
    if (activeFilter === 'Missions & Teaching') return m.title.includes('Missions') || m.title.includes('Teaching') || m.title.includes('Leadership');
    return true;
  });

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Banner Header */}
        <div className="bg-[#30203D] text-white p-8 sm:p-12 rounded-xs relative overflow-hidden shadow-lg border-b-4 border-[#C83338]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C83338]" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                SERVING GOD & COMMUNITY
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight">
              MINISTRIES & OUTREACH
            </h1>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              Equipping adults, youth, and children across Godda, Jharkhand, through biblical teaching, anointed worship, discipleship, and evangelistic missions.
            </p>
          </div>
        </div>

        {/* Filter Bar (Segmented Controls) */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                activeFilter === cat
                  ? 'bg-[#C83338] text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMinistries.map((ministry) => (
            <div
              key={ministry.id}
              className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
                  <img
                    src={ministry.image}
                    alt={ministry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#C83338] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-xs tracking-wider shadow-xs">
                    {ministry.scripture}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-[#252525] group-hover:text-[#C83338] transition-colors">
                    {ministry.title}
                  </h3>
                  <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                    {ministry.tagline}
                  </p>
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {ministry.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                {ministry.schedule && (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium bg-neutral-50 p-2 rounded-xs border border-neutral-200">
                    <Clock className="w-3.5 h-3.5 text-[#C83338] shrink-0" />
                    <span>{ministry.schedule}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => setSelectedMinistry(ministry)}
                    className="text-xs font-bold text-[#C83338] hover:text-[#a62529] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>LEARN MORE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-xs hover:bg-[#C83338] transition-colors"
                  >
                    GET INVOLVED
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Modal for Selected Ministry */}
        {selectedMinistry && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xs max-w-2xl w-full shadow-2xl relative overflow-hidden my-8 max-h-[90vh] flex flex-col">
              
              <div className="relative aspect-16/9 bg-neutral-900 shrink-0">
                <img
                  src={selectedMinistry.image}
                  alt={selectedMinistry.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <button
                  onClick={() => setSelectedMinistry(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                  aria-label="Close ministry modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C83338] bg-white px-2 py-0.5 rounded-xs inline-block mb-1">
                    {selectedMinistry.scripture}
                  </span>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase">
                    {selectedMinistry.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#252525] uppercase tracking-wide">
                    {selectedMinistry.tagline}
                  </h4>
                  <p className="text-sm text-neutral-700 leading-relaxed mt-2">
                    {selectedMinistry.content}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xs border border-neutral-200 text-xs">
                  <div>
                    <span className="text-neutral-500 font-medium block">Department Oversight:</span>
                    <span className="font-semibold text-neutral-900">{selectedMinistry.leader || 'Pastor Samuel Soren'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium block">Schedule / Gathering:</span>
                    <span className="font-semibold text-neutral-900">{selectedMinistry.schedule || 'Weekly at Godda Fellowship'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setSelectedMinistry(null);
                      onNavigate('contact');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors"
                  >
                    Join or Support This Ministry
                  </button>
                  <button
                    onClick={() => setSelectedMinistry(null)}
                    className="w-full sm:w-auto px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-50"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
