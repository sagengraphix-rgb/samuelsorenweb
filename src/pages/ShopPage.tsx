import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingBag, Search, Check, Download, Book, Music, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ShopPageProps {
  initialSlug?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialSlug, onNavigate }) => {
  const { addToCart, setIsCheckoutOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Books', 'Devotionals', 'Music', 'Digital Resources'];

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data: Product[] = await res.json();
        setProducts(data);

        if (initialSlug) {
          const match = data.find((p) => p.slug === initialSlug);
          if (match) setSelectedProduct(match);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [initialSlug]);

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBuyNow = (product: Product) => {
    addToCart(product, 1);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Banner */}
        <div className="bg-[#30203D] text-white p-8 sm:p-12 rounded-xs relative overflow-hidden shadow-lg border-b-4 border-[#C83338]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C83338]" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                OFFICIAL MINISTRY RESOURCES
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight">
              BOOKS & WORSHIP SHOP
            </h1>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              Equip your spiritual library with Pastor Samuel Soren’s printed books, audio recordings, daily journals, and digital guides. Free delivery across India on orders over ₹500.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xs border border-neutral-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search publications, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
              />
            </div>

            <div className="text-xs text-neutral-500 font-semibold">
              {filteredProducts.length} items available
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
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

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500">Loading shop inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xs border border-neutral-200 space-y-3">
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-heading font-bold text-neutral-800">No resources found</h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div
                    onClick={() => setSelectedProduct(prod)}
                    className="relative aspect-4/3 overflow-hidden bg-neutral-100 cursor-pointer"
                  >
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#252525] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs">
                      {prod.category}
                    </div>
                    {prod.productType === 'digital' && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs flex items-center gap-1">
                        <Download className="w-3 h-3" /> Digital
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3
                      onClick={() => setSelectedProduct(prod)}
                      className="font-heading font-bold text-base sm:text-lg text-[#252525] group-hover:text-[#C83338] transition-colors cursor-pointer line-clamp-1"
                    >
                      {prod.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div className="flex items-baseline justify-between border-t border-neutral-100 pt-3">
                    <div>
                      <span className="font-heading font-black text-xl text-[#C83338]">
                        ₹{prod.discountPrice || prod.price}
                      </span>
                      {prod.discountPrice && prod.discountPrice < prod.price && (
                        <span className="text-xs text-neutral-400 line-through ml-2">
                          ₹{prod.price}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {prod.productType === 'digital' ? 'Instant Download' : `${prod.stock} in stock`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="w-full py-2.5 border-2 border-[#C83338] text-[#C83338] hover:bg-[#C83338] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => handleBuyNow(prod)}
                      className="w-full py-2.5 bg-[#C83338] text-white hover:bg-[#a62529] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xs max-w-2xl w-full shadow-2xl relative overflow-hidden my-8">
              
              <div className="p-4 bg-neutral-900 text-white flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C83338]">
                  Product Details
                </span>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 text-neutral-400 hover:text-white"
                  aria-label="Close product details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full aspect-3/4 object-cover rounded-xs border border-neutral-200 shadow-sm"
                  />
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C83338] bg-red-50 px-2 py-0.5 rounded-xs inline-block">
                      {selectedProduct.category} &middot; {selectedProduct.productType.toUpperCase()}
                    </span>
                    <h2 className="font-heading font-black text-xl text-[#252525]">
                      {selectedProduct.title}
                    </h2>
                    <div className="flex items-baseline gap-2 py-1">
                      <span className="font-heading font-black text-2xl text-[#C83338]">
                        ₹{selectedProduct.discountPrice || selectedProduct.price}
                      </span>
                      {selectedProduct.discountPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{selectedProduct.price}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-neutral-200">
                    <div className="text-[11px] text-neutral-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Authorized publication by Pastor Samuel Soren</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Secure verified checkout (UPI / Cards / Net Banking)</span>
                      </p>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct, 1);
                          setSelectedProduct(null);
                        }}
                        className="flex-1 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="px-4 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
