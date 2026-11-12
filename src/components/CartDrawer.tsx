import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigate: (page: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    setIsCheckoutOpen
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const hasPhysical = cart.some((i) => i.product.productType === 'physical');
  const shipping = hasPhysical ? (subtotal >= 500 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C83338]" />
              <h2 className="font-heading font-bold text-lg text-[#252525]">
                YOUR CART ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-sm hover:bg-neutral-200"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-semibold text-neutral-800">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Explore Pastor Samuel Soren’s books, devotional journals, and worship recordings.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('shop');
                  }}
                  className="px-5 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors"
                >
                  Browse Shop
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice =
                  item.effectivePrice !== undefined
                    ? item.effectivePrice
                    : item.product.discountPrice !== undefined && item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price;

                const itemKey = item.variationId ? `${item.product.id}_${item.variationId}` : item.product.id;

                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-3 bg-neutral-50 rounded-sm border border-neutral-200"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-16 h-20 object-cover rounded-xs border border-neutral-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-heading font-semibold text-xs text-neutral-900 line-clamp-2">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.variationId)}
                            className="text-neutral-400 hover:text-red-600 p-1 shrink-0"
                            aria-label={`Remove ${item.product.title} from cart`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                            {item.product.productType === 'digital' ? 'Digital Download' : 'Physical'}
                          </span>
                          {item.selectedAttributes &&
                            Object.entries(item.selectedAttributes).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] bg-red-50 text-[#C83338] px-1.5 py-0.2 rounded font-semibold"
                              >
                                {k}: {v}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-neutral-300 rounded-xs bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variationId)}
                            className="p-1 hover:bg-neutral-100 text-neutral-600"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variationId)}
                            className="p-1 hover:bg-neutral-100 text-neutral-600"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-heading font-bold text-sm text-[#C83338]">
                            ₹{unitPrice * item.quantity}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-neutral-400">
                              ₹{unitPrice} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-neutral-900">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {hasPhysical && subtotal < 500 && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded-xs">
                    Add ₹{500 - subtotal} more for Free Shipping in India!
                  </p>
                )}
                <div className="flex justify-between text-base font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span className="text-[#C83338]">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-[#C83338] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
