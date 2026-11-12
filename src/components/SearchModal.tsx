import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, HeartHandshake, ShoppingBag, ArrowRight } from 'lucide-react';
import { Blog, Ministry, Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, param?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setBlogs([]);
      setMinistries([]);
      setProducts([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setBlogs([]);
      setMinistries([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [blogRes, minRes, prodRes] = await Promise.all([
          fetch(`/api/blogs?search=${encodeURIComponent(query)}`),
          fetch('/api/ministries'),
          fetch('/api/products')
        ]);

        const blogData = await blogRes.json();
        const minData: Ministry[] = await minRes.json();
        const prodData: Product[] = await prodRes.json();

        setBlogs(blogData);
        setMinistries(
          minData.filter(
            (m) =>
              m.title.toLowerCase().includes(query.toLowerCase()) ||
              m.description.toLowerCase().includes(query.toLowerCase())
          )
        );
        setProducts(
          prodData.filter(
            (p) =>
              p.title.toLowerCase().includes(query.toLowerCase()) ||
              p.description.toLowerCase().includes(query.toLowerCase())
          )
        );
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = blogs.length + ministries.length + products.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-sm max-w-2xl w-full shadow-2xl overflow-hidden border border-neutral-200">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-neutral-200 flex items-center gap-3 bg-neutral-50">
          <Search className="w-5 h-5 text-[#C83338] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search sermons, teachings, ministries, books, and articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent border-none outline-hidden text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-sm"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {loading && (
            <div className="py-8 text-center text-xs text-neutral-500">
              Searching ministry resources...
            </div>
          )}

          {!loading && query.trim() && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-neutral-500">
              No results found for &ldquo;{query}&rdquo;. Try another spiritual topic or book title.
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="py-6 text-center text-xs text-neutral-400">
              Popular searches: <span className="text-[#C83338] cursor-pointer" onClick={() => setQuery('Faith')}>Faith</span> &middot; <span className="text-[#C83338] cursor-pointer" onClick={() => setQuery('Worship')}>Worship</span> &middot; <span className="text-[#C83338] cursor-pointer" onClick={() => setQuery('Youth')}>Youth</span> &middot; <span className="text-[#C83338] cursor-pointer" onClick={() => setQuery('Purpose')}>Purpose</span> &middot; <span className="text-[#C83338] cursor-pointer" onClick={() => setQuery('Godda')}>Godda Church</span>
            </div>
          )}

          {/* Blogs */}
          {blogs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                <BookOpen className="w-3.5 h-3.5 text-[#C83338]" /> Articles & Sermons ({blogs.length})
              </h4>
              <div className="space-y-1.5">
                {blogs.map((blog) => (
                  <button
                    key={blog.id}
                    onClick={() => {
                      onClose();
                      onNavigate('blog', blog.slug);
                    }}
                    className="w-full text-left p-2.5 rounded-xs hover:bg-neutral-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-heading font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#C83338] transition-colors">
                        {blog.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{blog.excerpt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C83338] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ministries */}
          {ministries.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C83338]" /> Ministries ({ministries.length})
              </h4>
              <div className="space-y-1.5">
                {ministries.map((min) => (
                  <button
                    key={min.id}
                    onClick={() => {
                      onClose();
                      onNavigate('ministry', min.slug);
                    }}
                    className="w-full text-left p-2.5 rounded-xs hover:bg-neutral-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-heading font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#C83338] transition-colors">
                        {min.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{min.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C83338] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                <ShoppingBag className="w-3.5 h-3.5 text-[#C83338]" /> Books & Resources ({products.length})
              </h4>
              <div className="space-y-1.5">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      onClose();
                      onNavigate('shop', prod.slug);
                    }}
                    className="w-full text-left p-2.5 rounded-xs hover:bg-neutral-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-heading font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#C83338] transition-colors">
                        {prod.title}
                      </p>
                      <span className="text-[11px] text-[#C83338] font-bold">
                        ₹{prod.discountPrice || prod.price}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C83338] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
