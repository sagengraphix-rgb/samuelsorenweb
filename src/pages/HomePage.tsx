import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Blog, Ministry, Product, SiteSettings } from '../types';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenDonate?: (cause?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenDonate }) => {
  const { addToCart } = useCart();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [settingsRes, blogsRes, prodsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/blogs?limit=3'),
          fetch('/api/products')
        ]);

        const settingsData = await settingsRes.json();
        const blogsData = await blogsRes.json();
        const prodsData = await prodsRes.json();

        setSettings(settingsData);
        setLatestBlogs(blogsData);
        setFeaturedProducts(prodsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterStatus('loading');
    setNewsletterMsg('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      setNewsletterStatus('success');
      setNewsletterMsg(data.message || 'Thank you for subscribing!');
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterStatus('error');
      setNewsletterMsg(err.message || 'Error subscribing. Please try again.');
    }
  };

  // Fallbacks if database is loading
  const hero = settings?.hero || {
    title: 'FAITH THAT INSPIRES. PURPOSE THAT TRANSFORMS.',
    subtitle: 'PASTOR SAMUEL SOREN',
    description: 'Sharing the Word of God, inspiring lives and equipping the next generation through faith, worship and discipleship.',
    primaryBtnText: 'EXPLORE MINISTRY',
    primaryBtnLink: '/ministry',
    secondaryBtnText: 'READ LATEST BLOGS',
    secondaryBtnLink: '/blog',
    bgImage: 'https://images.unsplash.com/photo-1510525009512-ab7522cabb65?q=80&w=1600&auto=format&fit=crop'
  };

  const church = settings?.churchLocation || {
    churchName: 'Sacred Assemblies Fellowship Church',
    address: 'Guru Nagar, Gangta, Godda, Jharkhand 814133, India',
    schedule: 'Sunday @ 10:00 AM · Wednesday Prayer @ 6:00 PM',
    phone: '+91 94311 23456',
    email: 'contact@samuelsoren.org',
    directionsUrl: 'https://maps.google.com/?q=Godda+Jharkhand+India',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116246.34771696013!2d87.14088959640952!3d24.827258384959245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f04bb2c7302485%3A0x889816bf6a9e144a!2sGodda%2C%20Jharkhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
  };

  const about = settings?.aboutSection || {
    heading: 'A LIFE DEDICATED TO HIS PURPOSE',
    excerpt: 'Pastor Samuel Soren is an author, worship leader, motivational speaker and minister of the Gospel, serving adults, youth and children through biblical teaching, worship, discipleship and ministry leadership.',
    image: '/assets/samsusan.jpg'
  };

  const announcementItems = settings?.announcementStrip?.items || [
    { id: '1', title: 'DAILY WORD', subtitle: 'Walking by Faith, Not Sight (2 Cor 5:7)', link: '/blog' },
    { id: '2', title: 'BIBLE STUDIES', subtitle: 'Thursday Deep Dive · 7:00 PM IST', link: '/ministry' },
    { id: '3', title: 'LATEST BLOGS', subtitle: 'Empowering Youth With Holy Conviction', link: '/blog' },
    { id: '4', title: 'SUNDAY SERVICE', subtitle: 'Godda Fellowship · 10:00 AM IST', link: '/about' }
  ];

  return (
    <div className="space-y-0">
      
      {/* SECTION A: HERO BANNER (Directly matching reference image layout) */}
      <section className="relative min-h-[540px] sm:min-h-[600px] flex items-center bg-[#30203D] text-white overflow-hidden">
        {/* Background photo with deep purple overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={hero.bgImage}
            alt="Pastor Samuel Soren Ministry Congregation"
            className="w-full h-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e1327]/95 via-[#30203D]/85 to-[#30203D]/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            
            {/* Red Kicker Line */}
            <div className="inline-flex items-center gap-2">
              <span className="w-8 h-[3px] bg-[#C83338]" />
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-white/90">
                {hero.subtitle}
              </span>
            </div>

            {/* Main Bold White Heading */}
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] uppercase">
              {hero.title}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-neutral-200 font-normal leading-relaxed max-w-xl">
              {hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('ministry')}
                className="px-6 py-3.5 bg-[#C83338] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>{hero.primaryBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('blog')}
                className="px-6 py-3.5 bg-transparent border-2 border-white text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-white hover:text-[#252525] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{hero.secondaryBtnText}</span>
              </button>

              {onOpenDonate && (
                <button
                  onClick={() => onOpenDonate()}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>GIVE / DONATE</span>
                  <span className="text-sm">❤️</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION B: FEATURED CONTENT & ANNOUNCEMENT STRIP (Full-Width Church Red) */}
      <section className="bg-[#C83338] text-white py-6 border-b border-[#a62529]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full lg:w-auto flex-1">
              {announcementItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => onNavigate(item.link.includes('ministry') ? 'ministry' : item.link.includes('about') ? 'about' : 'blog')}
                  className="cursor-pointer group border-l-2 border-white/40 pl-3 hover:border-white transition-all"
                >
                  <span className="block text-[11px] font-heading font-bold tracking-widest uppercase text-white/80 group-hover:text-white">
                    {item.title}
                  </span>
                  <span className="block text-xs font-semibold text-white/95 line-clamp-1 mt-0.5 group-hover:underline">
                    {item.subtitle}
                  </span>
                </div>
              ))}
            </div>

            {/* More Updates Button */}
            <div className="shrink-0 w-full sm:w-auto text-right">
              <button
                onClick={() => onNavigate('blog')}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#C83338] hover:bg-neutral-100 font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-xs"
              >
                MORE UPDATES
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION C: MINISTRY LOCATION & SERVICE SPLIT (White Section with Google Maps) */}
      <section className="bg-white py-14 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Location Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2">
                <span className="w-5 h-[2px] bg-[#C83338]" />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  CHURCH FELLOWSHIP
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#252525] uppercase tracking-tight">
                {church.churchName}
              </h2>

              <p className="text-sm text-neutral-600 font-medium">
                {church.address}
              </p>

              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs space-y-1 text-xs">
                <div className="flex items-center gap-2 font-semibold text-neutral-800">
                  <Clock className="w-4 h-4 text-[#C83338]" />
                  <span>{church.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-4 h-4 text-[#C83338]" />
                  <span>{church.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="w-4 h-4 text-[#C83338]" />
                  <span>{church.email}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={church.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>DIRECTIONS</span>
                </a>

                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors"
                >
                  PRAYER & INQUIRY
                </button>
              </div>
            </div>

            {/* Right Map Embed */}
            <div className="lg:col-span-7 h-64 sm:h-72 rounded-xs overflow-hidden border border-neutral-200 shadow-sm relative bg-neutral-100">
              <iframe
                title="Sacred Assemblies Fellowship Church Location Godda"
                src={church.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[20%]"
              />
              <div className="absolute bottom-2 left-2 bg-white/95 px-3 py-1.5 rounded-xs shadow-md border border-neutral-200 text-[11px] font-semibold text-neutral-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C83338]" />
                <span>Godda, Jharkhand &middot; Sacred Assemblies Fellowship</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION D: FOUR FEATURED CATEGORIES (Horizontal Grid matching reference) */}
      <section className="bg-neutral-100 py-16 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Solid Church Red Card (WORSHIP) */}
            <div
              onClick={() => onNavigate('ministry', 'worship-ministry')}
              className="bg-[#C83338] text-white p-7 rounded-xs shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group min-h-[220px]"
            >
              <div>
                <span className="w-8 h-[2px] bg-white block mb-4 group-hover:w-12 transition-all" />
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider">
                  WORSHIP
                </h3>
                <p className="text-xs text-white/90 mt-2 leading-relaxed">
                  Worship, anointed praise, choir guidance and spiritual intimacy with the Father.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                <span>EXPLORE WORSHIP</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Photographic Card (BIBLE TEACHING) */}
            <div
              onClick={() => onNavigate('ministry', 'bible-teaching')}
              className="relative overflow-hidden rounded-xs shadow-md hover:shadow-xl transition-all cursor-pointer group min-h-[220px] flex flex-col justify-between p-7 text-white"
            >
              <img
                src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800&auto=format&fit=crop"
                alt="Bible Teaching"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              <div className="relative z-10">
                <span className="w-8 h-[2px] bg-[#C83338] block mb-4 group-hover:w-12 transition-all" />
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider">
                  BIBLE TEACHING
                </h3>
                <p className="text-xs text-neutral-200 mt-2 leading-relaxed">
                  Biblical understanding, theological exposition and solid spiritual grounding.
                </p>
              </div>
              <div className="relative z-10 pt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform text-[#C83338]">
                <span>VIEW SCRIPTURES</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Photographic Card (MINISTRIES) */}
            <div
              onClick={() => onNavigate('ministry')}
              className="relative overflow-hidden rounded-xs shadow-md hover:shadow-xl transition-all cursor-pointer group min-h-[220px] flex flex-col justify-between p-7 text-white"
            >
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop"
                alt="Youth & Children Ministries"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              <div className="relative z-10">
                <span className="w-8 h-[2px] bg-[#C83338] block mb-4 group-hover:w-12 transition-all" />
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider">
                  MINISTRIES
                </h3>
                <p className="text-xs text-neutral-200 mt-2 leading-relaxed">
                  Equipping adults, youth, children, and leadership teams across generations.
                </p>
              </div>
              <div className="relative z-10 pt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform text-[#C83338]">
                <span>SEE ALL MINISTRIES</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Photographic Card (MISSIONS) */}
            <div
              onClick={() => onNavigate('ministry', 'evangelism-missions')}
              className="relative overflow-hidden rounded-xs shadow-md hover:shadow-xl transition-all cursor-pointer group min-h-[220px] flex flex-col justify-between p-7 text-white"
            >
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop"
                alt="Rural Evangelism and Missions"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              <div className="relative z-10">
                <span className="w-8 h-[2px] bg-[#C83338] block mb-4 group-hover:w-12 transition-all" />
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider">
                  MISSIONS
                </h3>
                <p className="text-xs text-neutral-200 mt-2 leading-relaxed">
                  Sharing the Gospel, relief work and rural church planting in Jharkhand communities.
                </p>
              </div>
              <div className="relative z-10 pt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform text-[#C83338]">
                <span>OUR MISSION</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION E: ABOUT PREVIEW (Large photo and editorial split) */}
      <section className="bg-white py-16 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xs overflow-hidden shadow-xl border-4 border-white aspect-4/5">
                <img
                  src={about.image || '/assets/samsusan.jpg'}
                  alt="Pastor Samuel Soren and Susan Soren"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#C83338] text-white p-4 rounded-xs shadow-lg hidden sm:block max-w-[200px]">
                <p className="text-[11px] font-bold uppercase tracking-wider">20+ Years</p>
                <p className="text-xs text-white/90">Preaching, mentoring & worship leadership in India</p>
              </div>
            </div>

            {/* Right Biography Text */}
            <div className="lg:col-span-7 space-y-5 lg:pl-6">
              <div className="inline-flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#C83338]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
                  ABOUT PASTOR SAMUEL SOREN
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#252525] tracking-tight uppercase">
                {about.heading}
              </h2>

              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                {about.excerpt}
              </p>

              <div className="grid grid-cols-2 gap-4 py-2 border-y border-neutral-200">
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase text-neutral-900">
                    CALLING & IDENTITY
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Biblical preaching, anointed worship composition, motivational mentorship.
                  </p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase text-neutral-900">
                    REGIONAL FELLOWSHIP
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Pastor at Sacred Assemblies Fellowship Church, Godda, Jharkhand.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-6 py-3 bg-[#252525] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
                >
                  <span>READ FULL BIOGRAPHY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION F: LATEST BLOGS (Major Dynamic Section from Database) */}
      <section className="bg-neutral-50 py-16 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-neutral-200">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-6 h-[2px] bg-[#C83338]" />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  SPIRITUAL INSIGHTS & ARTICLES
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#252525] uppercase tracking-tight">
                LATEST FROM THE BLOG
              </h2>
            </div>

            <button
              onClick={() => onNavigate('blog')}
              className="px-5 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <span>VIEW ALL ARTICLES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dynamic Blog Grid from Database */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => onNavigate('blog', blog.slug)}
                className="bg-white rounded-xs overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-all flex flex-col cursor-pointer group"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Zero-Pill Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      <span className="text-[#C83338]">{blog.category}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-[#252525] group-hover:text-[#C83338] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">{blog.author}</span>
                    <span className="text-[#C83338] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      READ MORE &rarr;
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION G: FEATURED BOOKS & SHOP PREVIEW */}
      <section className="bg-white py-16 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-neutral-200">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-6 h-[2px] bg-[#C83338]" />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  PUBLICATIONS & MEDIA
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#252525] uppercase tracking-tight">
                FEATURED BOOKS & RESOURCES
              </h2>
            </div>

            <button
              onClick={() => onNavigate('shop')}
              className="px-5 py-2.5 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <span>EXPLORE ALL PRODUCTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-neutral-50 rounded-xs border border-neutral-200 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => onNavigate('shop', prod.slug)}
                  className="aspect-4/3 overflow-hidden bg-white cursor-pointer relative"
                >
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#252525] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs">
                    {prod.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => onNavigate('shop', prod.slug)}
                      className="font-heading font-bold text-sm text-[#252525] group-hover:text-[#C83338] transition-colors cursor-pointer line-clamp-1"
                    >
                      {prod.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="font-heading font-bold text-base text-[#C83338]">
                        ₹{prod.discountPrice || prod.price}
                      </span>
                      {prod.discountPrice && prod.discountPrice < prod.price && (
                        <span className="text-xs text-neutral-400 line-through ml-2">
                          ₹{prod.price}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="px-3.5 py-1.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION H: NEWSLETTER (Stay Connected) */}
      <section className="bg-[#30203D] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 justify-center">
            <span className="w-6 h-[2px] bg-[#C83338]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
              MONTHLY DEVOTIONALS & UPDATES
            </span>
            <span className="w-6 h-[2px] bg-[#C83338]" />
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight">
            STAY CONNECTED WITH OUR MINISTRY
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Subscribe to receive Pastor Samuel Soren&rsquo;s monthly scripture devotionals, ministry crusade alerts, and new book releases directly in your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xs text-sm text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-[#C83338] focus:bg-white/20"
            />
            <button
              type="submit"
              disabled={newsletterStatus === 'loading'}
              className="px-6 py-3 bg-[#C83338] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {newsletterStatus === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
            </button>
          </form>

          {newsletterStatus === 'success' && (
            <div className="p-3 bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs rounded-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{newsletterMsg}</span>
            </div>
          )}

          {newsletterStatus === 'error' && (
            <div className="p-3 bg-red-900/60 border border-red-500/40 text-red-200 text-xs rounded-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{newsletterMsg}</span>
            </div>
          )}

          <p className="text-[11px] text-neutral-400">
            We value your privacy. Unsubscribe at any time. No spam guaranteed.
          </p>
        </div>
      </section>

    </div>
  );
};
