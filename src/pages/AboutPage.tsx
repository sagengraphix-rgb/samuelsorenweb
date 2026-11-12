import React from 'react';
import { ArrowRight, BookOpen, Music, Users, HeartHandshake, MapPin, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const ministryMilestones = [
    { year: '2004', title: 'The Calling in the Wilderness', desc: 'Received a clear mandate to proclaim Christ’s uncompromising Gospel, disciple the youth, and restore biblical worship across Jharkhand.' },
    { year: '2010', title: 'Sacred Assemblies Fellowship', desc: 'Planted the local church fellowship in Godda, creating a sanctuary for prayer, scripture exposition, and cross-cultural community healing.' },
    { year: '2016', title: 'Ignite Youth Rallies & Music', desc: 'Composed live worship anthems and pioneered youth leadership retreats drawing students and young professionals across eastern India.' },
    { year: '2022', title: 'Author & National Mentorship', desc: 'Published "Walking in Divine Purpose" and established leadership training curriculum for pastors and village missionaries.' }
  ];

  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1510525009512-ab7522cabb65?q=80&w=800&auto=format&fit=crop', caption: 'Corporate Worship & Intercession' },
    { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop', caption: 'Pastor Samuel Teaching the Word' },
    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop', caption: 'Ignite Youth Fellowship Camp' },
    { url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop', caption: 'Children Sunday School & Discipleship' },
    { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop', caption: 'Rural Jharkhand Mission Outreach' },
    { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop', caption: 'Praise & Worship Team Practice' },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Banner */}
        <div className="bg-[#30203D] text-white p-8 sm:p-12 rounded-xs relative overflow-hidden shadow-lg border-b-4 border-[#C83338]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C83338]" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                BIOGRAPHY & CALLING
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight">
              ABOUT PASTOR SAMUEL SOREN
            </h1>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              Pastor | Author | Worship Leader | Motivational Speaker serving the Lord Jesus Christ and equipping the body of believers at Sacred Assemblies Fellowship Church, Godda, Jharkhand.
            </p>
          </div>
        </div>

        {/* Editorial Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white p-8 sm:p-12 rounded-xs border border-neutral-200 shadow-sm">
          <div className="lg:col-span-5">
            <div className="relative rounded-xs overflow-hidden shadow-xl border-4 border-white aspect-3/4">
              <img
                src="/assets/samsusan.jpg"
                alt="Pastor Samuel Soren and Susan Soren"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C83338]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
                A LIFE DEDICATED TO HIS PURPOSE
              </span>
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#252525] uppercase tracking-tight">
              &ldquo;Faith That Inspires. Purpose That Transforms.&rdquo;
            </h2>

            <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
              <p>
                Pastor Samuel Soren is an author, worship leader, motivational speaker, and minister of the Gospel. For more than twenty years, he has ministered with unwavering fidelity to the Word of God, mentoring youth, nurturing local assemblies, and releasing anointing through heartfelt praise.
              </p>
              <p>
                Deeply rooted in Godda, Jharkhand, his ministry at Sacred Assemblies Fellowship Church bridges cultural traditions with sound biblical theology. Through weekly worship services, rural missionary expeditions, and intensive leadership cohorts, he empowers believers to conquer spiritual apathy and align their lives with eternity.
              </p>
              <p>
                As an author, his books &mdash; including <em>Walking in Divine Purpose</em> and <em>Sacred Worship</em> &mdash; provide practical spiritual roadmaps for believers seeking deeper fellowship with the Holy Spirit and breakthrough in prayer.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors"
              >
                Connect With Pastor Samuel
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-100 transition-colors"
              >
                View Published Books
              </button>
            </div>
          </div>
        </div>

        {/* Vision, Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xs border border-neutral-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xs bg-red-50 text-[#C83338] flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-lg text-[#252525] uppercase">
              OUR VISION
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              To see communities across Jharkhand and the nations revived by the uncompromised Word of God, filled with the Holy Spirit, and walking in purposeful kingdom destiny.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xs border border-neutral-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xs bg-red-50 text-[#C83338] flex items-center justify-center font-bold">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-lg text-[#252525] uppercase">
              OUR MISSION
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Equipping every believer through biblical discipleship, cultivating an atmosphere of deep spiritual worship, and sending forth empowered ambassadors into society.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xs border border-neutral-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xs bg-red-50 text-[#C83338] flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-lg text-[#252525] uppercase">
              CORE VALUES
            </h3>
            <ul className="text-xs text-neutral-600 space-y-1.5 leading-relaxed">
              <li>&middot; <strong>Biblical Truth:</strong> Scripture as our absolute authority.</li>
              <li>&middot; <strong>Intimacy in Worship:</strong> Sincere adoration before God.</li>
              <li>&middot; <strong>Youth Discipleship:</strong> Preparing generation next.</li>
              <li>&middot; <strong>Servant Leadership:</strong> Christlike humility.</li>
            </ul>
          </div>
        </div>

        {/* Ministry Milestones Timeline */}
        <div className="bg-white p-8 sm:p-12 rounded-xs border border-neutral-200 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
              CHRONOLOGY
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#252525] uppercase tracking-tight mt-1">
              THE MINISTRY JOURNEY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ministryMilestones.map((m, idx) => (
              <div key={idx} className="border-l-2 border-[#C83338] pl-4 space-y-2">
                <span className="font-heading font-black text-2xl text-[#C83338]">
                  {m.year}
                </span>
                <h4 className="font-heading font-bold text-sm text-[#252525]">
                  {m.title}
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
                FELLOWSHIP IN ACTION
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#252525] uppercase tracking-tight mt-1">
                PHOTO GALLERY
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs group">
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 text-center border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-800">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
