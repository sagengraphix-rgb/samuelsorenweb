import React, { useState, useEffect } from 'react';
import { X, LogOut, Heart, ShoppingBag, MessageSquare, ShieldCheck, User as UserIcon, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Donation, Order } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdmin: () => void;
  onOpenDonate: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAdmin,
  onOpenDonate
}) => {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'orders'>('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.email) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Fetch user donations & orders from backend API
      const [donationsRes, ordersRes] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/orders')
      ]);

      if (donationsRes.ok) {
        const allDonations: Donation[] = await donationsRes.json();
        // Filter by user's email
        const userDonations = allDonations.filter(
          (d) => d.email.toLowerCase() === user?.email.toLowerCase()
        );
        setDonations(userDonations);
      }

      if (ordersRes.ok) {
        const allOrders: Order[] = await ordersRes.json();
        const userOrders = allOrders.filter(
          (o) => o.email.toLowerCase() === user?.email.toLowerCase()
        );
        setOrders(userOrders);
      }
    } catch (err) {
      console.warn('Could not load user activity data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const totalGiven = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#30203D] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-300 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-[#C83338] text-white flex items-center justify-center font-bold text-lg border-2 border-white/20">
              {user.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold font-heading">{user.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  {user.role === 'superadmin' ? 'Super Admin' : user.role === 'editor' ? 'Ministry Editor' : 'Church Member'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex space-x-2 mt-5 border-t border-white/10 pt-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                activeTab === 'overview'
                  ? 'bg-white text-[#30203D]'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Account Summary
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1 ${
                activeTab === 'donations'
                  ? 'bg-white text-[#30203D]'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>Giving ({donations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center space-x-1 ${
                activeTab === 'orders'
                  ? 'bg-white text-[#30203D]'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <span>Orders ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-neutral-500 flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#C83338] mb-2" />
              <span className="text-xs">Loading your activity records...</span>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-4">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-xs text-neutral-500 font-semibold uppercase">Total Giving</div>
                  <div className="text-xl font-extrabold text-[#C83338] mt-1">₹{totalGiven.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{donations.length} recorded contribution(s)</div>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-xs text-neutral-500 font-semibold uppercase">Store Orders</div>
                  <div className="text-xl font-extrabold text-[#30203D] mt-1">{orders.length}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Books & ministry resources</div>
                </div>
              </div>

              {/* Admin Access Banner if user is admin */}
              {isAdmin && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-purple-900 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Administrator Account Detected</span>
                    </div>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      You have pastoral staff and management rights for this website.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToAdmin();
                    }}
                    className="px-3 py-1.5 bg-[#30203D] hover:bg-neutral-800 text-white text-xs font-bold rounded-md transition shadow-2xs whitespace-nowrap ml-2"
                  >
                    Open Admin &rarr;
                  </button>
                </div>
              )}

              {/* Quick Action: Make a Donation */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-neutral-800">Support Godda Mission & Ministry</div>
                  <p className="text-[11px] text-neutral-500">Contribute tithes, offerings, or village outreach funds.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenDonate();
                  }}
                  className="px-3 py-1.5 bg-[#C83338] hover:bg-[#b0282d] text-white text-xs font-bold rounded-md transition shadow-2xs whitespace-nowrap ml-2"
                >
                  Give Now ❤️
                </button>
              </div>
            </div>
          ) : activeTab === 'donations' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Your Giving Records</h3>
                <button
                  onClick={() => {
                    onClose();
                    onOpenDonate();
                  }}
                  className="text-xs font-bold text-[#C83338] hover:underline"
                >
                  + Give Offering
                </button>
              </div>
              {donations.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-lg">
                  <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-medium">No donations recorded under {user.email} yet.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDonate();
                    }}
                    className="mt-3 px-3 py-1.5 bg-[#C83338] text-white text-xs font-bold rounded-md"
                  >
                    Partner with us today
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {donations.map((d) => (
                    <div key={d.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-md flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-neutral-800">{d.cause}</div>
                        <div className="text-[11px] text-neutral-500 flex items-center space-x-2 mt-0.5">
                          <span className="capitalize">{d.paymentMethod === 'upi' ? 'UPI (samuelsoren2@ybl)' : 'Razorpay QR'}</span>
                          <span>&bull;</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-[#C83338] text-sm">₹{d.amount.toLocaleString('en-IN')}</div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          d.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {d.status === 'verified' ? 'Verified' : 'Processing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Your Bookstore Orders</h3>
              {orders.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-lg">
                  <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-medium">No bookstore orders recorded under {user.email} yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div key={o.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs">
                      <div className="flex justify-between items-center font-bold text-neutral-800 mb-1">
                        <span>Order #{o.id.substring(0, 8)}</span>
                        <span className="text-[#30203D]">₹{o.total.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {o.items.map((it) => `${it.title} (x${it.quantity})`).join(', ')}
                      </div>
                      <div className="mt-2 flex justify-between items-center text-[10px] text-neutral-400 border-t border-neutral-200 pt-1">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="uppercase font-bold text-neutral-600">{o.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with prominent Log Out button */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex justify-between items-center">
          <span className="text-[11px] text-neutral-500">
            Connected via Firebase Authentication
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold rounded-md transition flex items-center space-x-1.5 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
