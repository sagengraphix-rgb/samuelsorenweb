import React, { useState, useEffect } from 'react';
import { Blog } from '../types';
import { Search, Calendar, User, ArrowLeft, ArrowRight, Share2, BookOpen, Tag, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface BlogPageProps {
  initialSlug?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ initialSlug, onNavigate }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug || null);
  const [singlePostData, setSinglePostData] = useState<{
    blog: Blog;
    prevPost?: { id: string; title: string; slug: string } | null;
    nextPost?: { id: string; title: string; slug: string } | null;
    relatedPosts: Array<{ id: string; title: string; slug: string; featuredImage: string; category: string; publishedAt: string }>;
  } | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const categories = [
    'All',
    'Daily Word',
    'Devotionals',
    'Bible Studies',
    'Faith and Prayer',
    'Worship',
    'Leadership',
    'Youth and Family',
    'Motivation',
    'Ministry News'
  ];

  // Fetch blogs list
  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== 'All') queryParams.append('category', activeCategory);
        if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

        const res = await fetch(`/api/blogs?${queryParams.toString()}`);
        const data = await res.json();
        setBlogs(data);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!activeSlug) {
      loadBlogs();
    }
  }, [activeCategory, searchQuery, activeSlug]);

  // Fetch single post if activeSlug is set
  useEffect(() => {
    if (!activeSlug) {
      setSinglePostData(null);
      return;
    }

    async function loadSinglePost() {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs/${activeSlug}`);
        if (!res.ok) throw new Error('Blog not found');
        const data = await res.json();
        setSinglePostData(data);
      } catch (err) {
        console.error('Failed to load blog post:', err);
        setActiveSlug(null);
      } finally {
        setLoading(false);
      }
    }
    loadSinglePost();
  }, [activeSlug]);

  const handlePostClick = (slug: string) => {
    setActiveSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToArchive = () => {
    setActiveSlug(null);
    setSinglePostData(null);
    onNavigate('blog');
  };

  // Helper to render markdown content with headings, lists, blockquotes, and bible verses
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="font-heading font-black text-xl sm:text-2xl text-[#252525] mt-6 mb-3 uppercase tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={index} className="font-heading font-bold text-base sm:text-lg text-[#252525] mt-5 mb-2 uppercase">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 border-[#C83338] bg-neutral-50 p-4 my-4 rounded-r-xs italic text-neutral-800 text-sm sm:text-base leading-relaxed">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={index} className="text-neutral-700 text-sm sm:text-base leading-relaxed ml-5 list-disc my-1">
            {trimmed.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={index} className="h-3" />;
      }
      return (
        <p key={index} className="text-neutral-700 text-sm sm:text-base leading-relaxed my-2">
          {line}
        </p>
      );
    });
  };

  // ==========================================
  // SINGLE BLOG POST VIEW
  // ==========================================
  if (activeSlug && singlePostData) {
    const { blog, prevPost, nextPost, relatedPosts } = singlePostData;
    return (
      <div className="bg-white min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Back button */}
          <button
            onClick={handleBackToArchive}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#C83338] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL ARTICLES</span>
          </button>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <span className="text-[#C83338] font-bold">{blog.category}</span>
              <span aria-hidden="true">&middot;</span>
              <span>
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {blog.scriptureReference && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="text-neutral-700 font-semibold">{blog.scriptureReference}</span>
                </>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-[#252525] tracking-tight leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center justify-between py-3 border-y border-neutral-200 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C83338] text-white flex items-center justify-center font-bold text-xs">
                  SS
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{blog.author}</p>
                  <p className="text-[10px] text-neutral-500">Pastor &middot; Sacred Assemblies Fellowship</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Article link copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Article</span>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="rounded-xs overflow-hidden border border-neutral-200 aspect-16/9 bg-neutral-100 shadow-sm">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Scripture Highlight Box */}
          {blog.scriptureReference && (
            <div className="bg-red-50/60 border-l-4 border-[#C83338] p-4 rounded-r-xs flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#C83338] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#C83338] uppercase tracking-wider block">
                  Scripture Anchor
                </span>
                <span className="text-sm font-semibold text-neutral-800">
                  {blog.scriptureReference}
                </span>
              </div>
            </div>
          )}

          {/* Formatted Content */}
          <div className="prose prose-neutral max-w-none text-neutral-800">
            {renderFormattedContent(blog.content)}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-neutral-200 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-500 mr-1">Tags:</span>
              {blog.tags.map((t, idx) => (
                <span key={idx} className="text-xs text-neutral-600 font-medium">
                  #{t} {idx < blog.tags.length - 1 ? '·' : ''}
                </span>
              ))}
            </div>
          )}

          {/* Author Box */}
          <div className="p-6 bg-neutral-50 rounded-xs border border-neutral-200 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-[#C83338] text-white flex items-center justify-center font-bold text-xl shrink-0">
              SS
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-base text-[#252525]">
                Pastor Samuel Soren
              </h4>
              <p className="text-xs text-neutral-500 uppercase font-semibold">
                Pastor | Author | Worship Leader | Motivational Speaker
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                Minister of the Gospel at Sacred Assemblies Fellowship Church, Godda, Jharkhand. Committed to empowering adults, youth, and children through biblical truth and transformative worship.
              </p>
            </div>
          </div>

          {/* Prev / Next Article Navigation */}
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-neutral-200" aria-label="Article Navigation">
            {prevPost ? (
              <button
                onClick={() => handlePostClick(prevPost.slug)}
                className="p-4 rounded-xs border border-neutral-200 hover:border-[#C83338] text-left transition-colors group flex items-center gap-3"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-400 group-hover:text-[#C83338] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    Previous Teaching
                  </span>
                  <span className="text-xs font-bold text-neutral-900 group-hover:text-[#C83338] line-clamp-1">
                    {prevPost.title}
                  </span>
                </div>
              </button>
            ) : <div />}

            {nextPost && (
              <button
                onClick={() => handlePostClick(nextPost.slug)}
                className="p-4 rounded-xs border border-neutral-200 hover:border-[#C83338] text-right transition-colors group flex items-center justify-end gap-3 ml-auto w-full"
              >
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    Next Teaching
                  </span>
                  <span className="text-xs font-bold text-neutral-900 group-hover:text-[#C83338] line-clamp-1">
                    {nextPost.title}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#C83338] shrink-0" />
              </button>
            )}
          </nav>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="pt-8 space-y-4">
              <h3 className="font-heading font-bold text-lg text-[#252525] uppercase tracking-wide border-l-2 border-[#C83338] pl-2">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => handlePostClick(rel.slug)}
                    className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      className="w-full aspect-16/10 object-cover rounded-xs mb-2"
                    />
                    <span className="text-[10px] font-bold text-[#C83338] uppercase block">
                      {rel.category}
                    </span>
                    <h5 className="font-heading font-semibold text-xs text-neutral-900 group-hover:text-[#C83338] line-clamp-2 mt-1">
                      {rel.title}
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // BLOG ARCHIVE LIST VIEW
  // ==========================================
  const totalPages = Math.ceil(blogs.length / postsPerPage) || 1;
  const displayedBlogs = blogs.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Banner */}
        <div className="bg-[#30203D] text-white p-8 sm:p-12 rounded-xs relative overflow-hidden shadow-lg border-b-4 border-[#C83338]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C83338]" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                BIBLICAL TEACHINGS & ARTICLES
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight">
              MINISTRY BLOG & SERMONS
            </h1>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              Explore insightful biblical commentaries, faith-building devotionals, worship theology, and leadership reflections authored by Pastor Samuel Soren.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xs border border-neutral-200 shadow-xs">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
              />
            </div>

            <div className="text-xs text-neutral-500 font-semibold">
              Showing {blogs.length} published articles
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#C83338] text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500">
            Loading articles from database...
          </div>
        ) : displayedBlogs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xs border border-neutral-200 space-y-3">
            <BookOpen className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-heading font-bold text-neutral-800">No articles found</h3>
            <p className="text-xs text-neutral-500">
              No articles match your filter &ldquo;{activeCategory}&rdquo; or search query &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#C83338] text-white text-xs font-bold rounded-xs uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedBlogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => handlePostClick(blog.slug)}
                className="bg-white rounded-xs overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      <span className="text-[#C83338] font-bold">{blog.category}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h2 className="font-heading font-bold text-lg text-[#252525] group-hover:text-[#C83338] transition-colors line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between text-xs mt-4">
                  <span className="text-neutral-500 font-medium">{blog.author}</span>
                  <span className="text-[#C83338] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    READ ARTICLE &rarr;
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 border border-neutral-300 rounded-xs disabled:opacity-40 hover:bg-white text-xs font-semibold"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-xs text-xs font-bold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-[#C83338] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 border border-neutral-300 rounded-xs disabled:opacity-40 hover:bg-white text-xs font-semibold"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
