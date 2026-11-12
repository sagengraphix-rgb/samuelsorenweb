import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Plus,
  HeartHandshake,
  ShoppingBag,
  Inbox,
  Mail,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  Save,
  X,
  AlertCircle,
  FileText,
  UserCheck,
  Key,
  RefreshCw,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Blog, Ministry, Product, Order, ContactSubmission, NewsletterSubscriber, SiteSettings, Donation } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user, token, login, logout, isSuperAdmin, isEditor, loginWithPassword, sendPasswordReset } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Reset state (Unauthenticated)
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [generatedCodeDisplay, setGeneratedCodeDisplay] = useState('');

  // Change Password state (Authenticated)
  const [currentPass, setCurrentPass] = useState('');
  const [changeNewPass, setChangeNewPass] = useState('');
  const [changeConfirmPass, setChangeConfirmPass] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'blogs' | 'add-blog' | 'ministries' | 'products' | 'orders' | 'donations' | 'contacts' | 'subscribers' | 'settings' | 'security'
  >('overview');

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Entities state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Filter/Search states
  const [contactSearch, setContactSearch] = useState('');
  const [contactCategory, setContactCategory] = useState('All');
  const [contactStatusFilter, setContactStatusFilter] = useState('All');
  const [selectedContactModal, setSelectedContactModal] = useState<ContactSubmission | null>(null);

  // Donation Filter states
  const [donationSearch, setDonationSearch] = useState('');
  const [donationCauseFilter, setDonationCauseFilter] = useState('All');
  const [selectedDonationModal, setSelectedDonationModal] = useState<Donation | null>(null);

  // Blog Editor State
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Faith and Prayer');
  const [blogTags, setBlogTags] = useState('');
  const [blogScripture, setBlogScripture] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogStatus, setBlogStatus] = useState<'published' | 'draft'>('published');
  const [blogSeoTitle, setBlogSeoTitle] = useState('');
  const [blogSeoDesc, setBlogSeoDesc] = useState('');
  const [blogSaveSuccess, setBlogSaveSuccess] = useState('');
  const [blogSaveError, setBlogSaveError] = useState('');

  // Settings Editor State
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');

  // Helper fetch with Auth Header
  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
  };

  // Load data based on current tab
  useEffect(() => {
    if (!token || !user) return;

    // Load stats
    authFetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);

    // Load entities depending on tab or initially
    authFetch('/api/admin/blogs')
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .catch(console.error);

    authFetch('/api/admin/ministries')
      .then((res) => res.json())
      .then((data) => setMinistries(data))
      .catch(console.error);

    authFetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);

    if (isSuperAdmin) {
      authFetch('/api/admin/orders')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setOrders(data))
        .catch(console.error);

      authFetch('/api/admin/contacts')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setContacts(data))
        .catch(console.error);

      authFetch('/api/admin/subscribers')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setSubscribers(data))
        .catch(console.error);

      authFetch('/api/admin/donations')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setDonations(data))
        .catch(console.error);

      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => setSiteSettings(data))
        .catch(console.error);
    }
  }, [token, user, isSuperAdmin, activeTab]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await loginWithPassword(loginEmail, loginPassword);
      if (!result.success) throw new Error(result.error || 'Login failed');
      setActiveTab('overview');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const quickFillPastorSamuel84 = () => {
    setLoginEmail('sorensam84@gmail.com');
    setLoginPassword('admin123');
  };

  const quickFillPastorSamuel = () => {
    setLoginEmail('sorensam@gmail.com');
    setLoginPassword('admin123');
  };

  const quickFillAdmin = () => {
    setLoginEmail('admin@samuelsoren.org');
    setLoginPassword('admin123');
  };

  const quickFillEditor = () => {
    setLoginEmail('editor@samuelsoren.org');
    setLoginPassword('editor123');
  };

  // Password Reset Handlers
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    setGeneratedCodeDisplay('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your administrator email address.');
      setResetLoading(false);
      return;
    }

    try {
      const result = await sendPasswordReset(resetEmail.trim());
      if (!result.success) throw new Error(result.message || 'Failed to dispatch reset email.');

      setResetSuccess(result.message);
      if (result.simulatedCode) {
        setGeneratedCodeDisplay(result.simulatedCode);
        setResetCode(result.simulatedCode); // auto-populate for ease of use
      }
      setResetStep('verify');
    } catch (err: any) {
      setResetError(err.message || 'Error requesting reset code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    if (!resetCode.trim()) {
      setResetError('Please enter the verification reset code.');
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          resetCode: resetCode.trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setResetSuccess('Your password has been reset successfully! You can now log in.');
      setLoginEmail(resetEmail.trim());
      setLoginPassword(newPassword);
      setTimeout(() => {
        setIsResetMode(false);
        setResetStep('request');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Error resetting password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Change Password Handler (Authenticated)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeLoading(true);
    setChangeError('');
    setChangeSuccess('');

    if (!currentPass || !changeNewPass) {
      setChangeError('Please provide both current and new passwords.');
      setChangeLoading(false);
      return;
    }

    if (changeNewPass.length < 6) {
      setChangeError('New password must be at least 6 characters long.');
      setChangeLoading(false);
      return;
    }

    if (changeNewPass !== changeConfirmPass) {
      setChangeError('New passwords do not match.');
      setChangeLoading(false);
      return;
    }

    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: changeNewPass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setChangeSuccess('Password updated successfully! Please use your new password next time.');
      setCurrentPass('');
      setChangeNewPass('');
      setChangeConfirmPass('');
    } catch (err: any) {
      setChangeError(err.message || 'Error changing password.');
    } finally {
      setChangeLoading(false);
    }
  };

  // Blog CRUD actions
  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogCategory(blog.category);
    setBlogTags(blog.tags.join(', '));
    setBlogScripture(blog.scriptureReference || '');
    setBlogExcerpt(blog.excerpt);
    setBlogContent(blog.content);
    setBlogImage(blog.featuredImage);
    setBlogStatus(blog.status === 'draft' ? 'draft' : 'published');
    setBlogSeoTitle(blog.seoTitle || blog.title);
    setBlogSeoDesc(blog.seoDescription || blog.excerpt);
    setBlogSaveSuccess('');
    setBlogSaveError('');
    setActiveTab('add-blog');
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogCategory('Faith and Prayer');
    setBlogTags('');
    setBlogScripture('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogImage('');
    setBlogStatus('published');
    setBlogSeoTitle('');
    setBlogSeoDesc('');
    setBlogSaveSuccess('');
    setBlogSaveError('');
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogSaveSuccess('');
    setBlogSaveError('');

    if (!blogTitle.trim() || !blogContent.trim()) {
      setBlogSaveError('Title and blog content are required.');
      return;
    }

    try {
      const payload = {
        title: blogTitle,
        category: blogCategory,
        tags: blogTags,
        scriptureReference: blogScripture,
        excerpt: blogExcerpt || blogTitle,
        content: blogContent,
        featuredImage: blogImage || 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=1000&auto=format&fit=crop',
        status: blogStatus,
        seoTitle: blogSeoTitle || blogTitle,
        seoDescription: blogSeoDesc || blogExcerpt
      };

      const url = editingBlogId ? `/api/admin/blogs/${editingBlogId}` : '/api/admin/blogs';
      const method = editingBlogId ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save blog post');

      setBlogSaveSuccess(editingBlogId ? 'Article updated successfully!' : 'New article published successfully!');
      
      // Refresh blogs
      const refresh = await authFetch('/api/admin/blogs');
      setBlogs(await refresh.json());
      
      if (!editingBlogId) resetBlogForm();
    } catch (err: any) {
      setBlogSaveError(err.message || 'Error saving blog post');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await authFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err) {
      alert('Failed to delete blog post');
    }
  };

  // Contact actions (Super Admin ONLY)
  const handleUpdateContactStatus = async (id: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    try {
      const res = await authFetch(`/api/admin/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setContacts(contacts.map((c) => (c.id === id ? { ...c, status } : c)));
        if (selectedContactModal?.id === id) {
          setSelectedContactModal({ ...selectedContactModal, status });
        }
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Delete this confidential submission?')) return;
    try {
      await authFetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
      setContacts(contacts.filter((c) => c.id !== id));
      if (selectedContactModal?.id === id) setSelectedContactModal(null);
    } catch (err) {
      alert('Failed to delete submission');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/contacts/export', '_blank');
  };

  const handleExportDonationsCSV = () => {
    window.open('/api/admin/donations/export', '_blank');
  };

  const handleUpdateDonationStatus = async (donationId: string, status: string) => {
    try {
      const res = await authFetch(`/api/admin/donations/${donationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setDonations(donations.map((d) => (d.id === donationId ? { ...d, status: status as any } : d)));
      }
    } catch (err) {
      alert('Failed to update donation status');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus })
      });
      if (res.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, orderStatus: orderStatus as any } : o)));
      }
    } catch (err) {
      alert('Failed to update order');
    }
  };

  // Save Homepage Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) {
        setSettingsSaveMsg('Settings updated successfully!');
        setTimeout(() => setSettingsSaveMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  // ==========================================
  // VIEW: NOT LOGGED IN (Secure Login Screen)
  // ==========================================
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xs max-w-md w-full shadow-2xl overflow-hidden border-t-4 border-[#C83338]">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#C83338] text-white rounded-xs mx-auto flex items-center justify-center font-black text-xl">
                SS
              </div>
              <h2 className="font-heading font-black text-2xl text-[#252525] uppercase tracking-tight">
                STAFF ADMIN PORTAL
              </h2>
              <p className="text-xs text-neutral-500">
                Pastor Samuel Soren Ministry Administration &middot; Godda
              </p>
            </div>

            {/* Conditional: Login View vs Reset Password View */}
            {!isResetMode ? (
              <>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sorensam84@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(loginEmail || 'sorensam84@gmail.com');
                          setIsResetMode(true);
                          setResetStep('request');
                          setResetError('');
                          setResetSuccess('');
                        }}
                        className="text-xs text-[#C83338] hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
                  </button>
                </form>

                {/* Quick-fill credentials for testing */}
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block text-center">
                    Select Account Credentials:
                  </span>
                  
                  {/* Primary Super Admin: sorensam84@gmail.com */}
                  <button
                    type="button"
                    onClick={quickFillPastorSamuel84}
                    className="w-full p-2.5 border-2 border-[#C83338] rounded-xs text-left text-xs bg-red-50 hover:bg-red-100/60 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-neutral-900">Pastor Samuel Soren</p>
                        <span className="bg-[#C83338] text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-xs">Super Admin</span>
                      </div>
                      <p className="text-[11px] text-neutral-800 font-mono font-bold mt-0.5">sorensam84@gmail.com</p>
                    </div>
                    <span className="text-[11px] text-[#C83338] font-bold">Use &rarr;</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={quickFillPastorSamuel}
                      className="p-2 border border-neutral-300 hover:border-neutral-900 rounded-xs text-left text-xs bg-neutral-50 hover:bg-neutral-100"
                    >
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-neutral-900">Super Admin</p>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">sorensam@gmail.com</p>
                      <span className="text-[9px] text-[#C83338] font-semibold">Full Access</span>
                    </button>
                    <button
                      type="button"
                      onClick={quickFillAdmin}
                      className="p-2 border border-neutral-300 hover:border-neutral-900 rounded-xs text-left text-xs bg-neutral-50 hover:bg-neutral-100"
                    >
                      <p className="font-bold text-neutral-900">Staff Admin</p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">admin@samuelsoren.org</p>
                      <span className="text-[9px] text-neutral-600 font-semibold">Full Access</span>
                    </button>

                    <button
                      type="button"
                      onClick={quickFillEditor}
                      className="p-2 border border-neutral-300 hover:border-neutral-900 rounded-xs text-left text-xs bg-neutral-50 hover:bg-neutral-100"
                    >
                      <p className="font-bold text-neutral-900">Editor</p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">editor@samuelsoren.org</p>
                      <span className="text-[9px] text-neutral-600 font-semibold">Content Only</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Password Reset Flow */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#C83338]" />
                    <span className="text-xs font-bold uppercase text-neutral-900">Reset Account Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold"
                  >
                    Back to Login
                  </button>
                </div>

                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                {resetStep === 'request' ? (
                  <form onSubmit={handleRequestResetCode} className="space-y-4">
                    <p className="text-xs text-neutral-600">
                      Enter your registered administrator email address (e.g. <strong>sorensam84@gmail.com</strong> or <strong>sorensam@gmail.com</strong>). A 6-digit verification code will be generated to reset your password.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sorensam84@gmail.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setResetEmail('sorensam84@gmail.com')}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-red-100 hover:bg-red-200 text-red-900 rounded-xs border border-red-200"
                      >
                        Use sorensam84@gmail.com
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetEmail('sorensam@gmail.com')}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-xs text-neutral-700"
                      >
                        Use sorensam@gmail.com
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {resetLoading ? 'Generating Code...' : 'Send Verification Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    {generatedCodeDisplay && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <Key className="w-3.5 h-3.5 text-amber-700" />
                          <span>Generated Verification Code:</span>
                        </div>
                        <p className="font-mono text-base font-black text-amber-950 tracking-widest">
                          {generatedCodeDisplay}
                        </p>
                        <p className="text-[10px] text-amber-700">
                          (Valid for 1 hour. In production, this code is also dispatched via secure email to {resetEmail}.)
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        New Password (minimum 6 characters)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new strong password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setResetStep('request')}
                        className="px-3 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-100"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {resetLoading ? 'Resetting Password...' : 'Save New Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      
      {/* Top Admin Bar */}
      <div className="bg-[#252525] text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b-2 border-[#C83338]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-[#C83338] text-white flex items-center justify-center font-bold text-sm">
            SS
          </div>
          <div>
            <span className="font-heading font-black text-sm tracking-wide text-white">
              ADMIN CONTROL PANEL
            </span>
            <span className="hidden sm:inline text-neutral-400 text-xs ml-2">
              &middot; {siteSettings?.branding?.siteTitle || 'Pastor Samuel Soren'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-neutral-800 px-2.5 py-1 rounded-xs border border-neutral-700">
            {isSuperAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-semibold">{user.name}</span>
            <span className="text-[10px] uppercase font-bold text-neutral-400">({user.role})</span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-neutral-400 hover:text-red-400 rounded-xs hover:bg-neutral-800 transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-neutral-200 p-4 space-y-6 shrink-0" aria-label="Admin Sidebar">
          
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'blogs'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Blog Management</span>
            </button>

            <button
              onClick={() => {
                resetBlogForm();
                setActiveTab('add-blog');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'add-blog'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Blog</span>
            </button>

            <button
              onClick={() => setActiveTab('ministries')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'ministries'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Ministries</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Products & Shop</span>
            </button>
          </div>

          {/* Super Admin Restricted Sections */}
          <div className="space-y-1 pt-4 border-t border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 block">
              Confidential & Admin
            </span>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Contact Messages</span>
              </div>
              {contacts.filter((c) => c.status === 'new').length > 0 && isSuperAdmin && (
                <span className="bg-[#C83338] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {contacts.filter((c) => c.status === 'new').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('donations')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'donations'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>Donations & Tithes</span>
              </div>
              {donations.length > 0 && isSuperAdmin && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'donations' ? 'bg-white text-[#C83338]' : 'bg-red-100 text-[#C83338]'}`}>
                  {donations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Orders & Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'subscribers'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Subscribers</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>
          </div>

          {/* Account & Security Section */}
          <div className="space-y-1 pt-4 border-t border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 block">
              Account & Credentials
            </span>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                activeTab === 'security'
                  ? 'bg-[#C83338] text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Password & Security</span>
            </button>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                  MINISTRY DASHBOARD OVERVIEW
                </h1>
                <p className="text-xs text-neutral-500">
                  Real-time status of published content, incoming prayer requests, and community engagement.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-xs font-bold uppercase">Total Blogs</span>
                    <BookOpen className="w-4 h-4 text-[#C83338]" />
                  </div>
                  <p className="font-heading font-black text-2xl text-[#252525]">
                    {stats?.totalBlogs || blogs.length}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {stats?.publishedBlogs || blogs.filter((b) => b.status === 'published').length} published &middot; {stats?.draftBlogs || blogs.filter((b) => b.status === 'draft').length} drafts
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-xs font-bold uppercase">Ministries</span>
                    <HeartHandshake className="w-4 h-4 text-[#C83338]" />
                  </div>
                  <p className="font-heading font-black text-2xl text-[#252525]">
                    {stats?.totalMinistries || ministries.length}
                  </p>
                  <p className="text-[11px] text-neutral-500">Active fellowship areas</p>
                </div>

                <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-xs font-bold uppercase">New Messages</span>
                    <Inbox className="w-4 h-4 text-[#C83338]" />
                  </div>
                  <p className="font-heading font-black text-2xl text-[#252525]">
                    {isSuperAdmin ? stats?.newContacts ?? contacts.filter((c) => c.status === 'new').length : 'Protected'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isSuperAdmin ? 'Confidential prayer requests' : 'Super Admin only'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-xs font-bold uppercase">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#C83338]" />
                  </div>
                  <p className="font-heading font-black text-2xl text-[#252525]">
                    {isSuperAdmin ? stats?.totalOrders ?? orders.length : 'Protected'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isSuperAdmin ? 'Verified books & orders' : 'Super Admin only'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-xs font-bold uppercase">Funds Raised</span>
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </div>
                  <p className="font-heading font-black text-2xl text-[#C83338]">
                    {isSuperAdmin ? `₹${(stats?.totalFundsRaised ?? donations.reduce((acc, d) => acc + (d.amount || 0), 0)).toLocaleString('en-IN')}` : 'Protected'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isSuperAdmin ? 'UPI & QR donations total' : 'Super Admin only'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-xs font-bold uppercase">Donations</span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="font-heading font-black text-2xl text-[#252525]">
                    {isSuperAdmin ? (stats?.totalDonations ?? donations.length) : 'Protected'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {isSuperAdmin ? 'Contributions received' : 'Super Admin only'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-sm text-[#252525] uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      resetBlogForm();
                      setActiveTab('add-blog');
                    }}
                    className="px-4 py-2 bg-[#C83338] text-white text-xs font-bold rounded-xs hover:bg-[#a62529] inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish New Blog Post</span>
                  </button>

                  {isSuperAdmin && (
                    <button
                      onClick={() => setActiveTab('contacts')}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xs hover:bg-neutral-800 inline-flex items-center gap-1.5"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Open Contact Messages Inbox</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Blogs Table */}
              <div className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-sm text-[#252525] uppercase tracking-wider">
                  Recent Published Articles
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-neutral-600">
                    <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                      <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Published Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {blogs.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-neutral-50">
                          <td className="p-3 font-semibold text-neutral-900">{b.title}</td>
                          <td className="p-3">{b.category}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                b.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : 'Draft'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleEditBlog(b)}
                              className="text-[#C83338] hover:underline font-bold"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BLOG MANAGEMENT */}
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                    BLOG MANAGEMENT
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Create, edit, publish, schedule, or archive sermon articles and devotionals.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetBlogForm();
                    setActiveTab('add-blog');
                  }}
                  className="px-4 py-2 bg-[#C83338] text-white text-xs font-bold uppercase rounded-xs hover:bg-[#a62529] inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Post</span>
                </button>
              </div>

              <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-neutral-600">
                    <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                      <tr>
                        <th className="p-3">Featured Image</th>
                        <th className="p-3">Title & Excerpt</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Published Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {blogs.map((b) => (
                        <tr key={b.id} className="hover:bg-neutral-50">
                          <td className="p-3 w-16">
                            <img
                              src={b.featuredImage}
                              alt=""
                              className="w-14 h-10 object-cover rounded-xs border border-neutral-200"
                            />
                          </td>
                          <td className="p-3 max-w-xs">
                            <p className="font-bold text-neutral-900 line-clamp-1">{b.title}</p>
                            <p className="text-[11px] text-neutral-500 line-clamp-1">{b.excerpt}</p>
                          </td>
                          <td className="p-3 font-semibold text-neutral-700">{b.category}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                b.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : 'Draft'}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditBlog(b)}
                              className="p-1 text-neutral-600 hover:text-[#C83338]"
                              title="Edit post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(b.id)}
                              className="p-1 text-neutral-400 hover:text-red-600"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD / EDIT BLOG POST (Rich Editor) */}
          {activeTab === 'add-blog' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                    {editingBlogId ? 'EDIT BLOG POST' : 'WRITE NEW BLOG POST'}
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Use headings (###), quotes (&gt;), bullet lists (-), and scripture anchors.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('blogs')}
                  className="px-3 py-1.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xs hover:bg-neutral-50"
                >
                  Back to List
                </button>
              </div>

              {blogSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{blogSaveSuccess}</span>
                </div>
              )}

              {blogSaveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{blogSaveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveBlog} className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Walking in Divine Purpose: Discovering Your Calling"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden font-heading font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                      Category *
                    </label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden bg-white"
                    >
                      <option value="Daily Word">Daily Word</option>
                      <option value="Devotionals">Devotionals</option>
                      <option value="Bible Studies">Bible Studies</option>
                      <option value="Christian Living">Christian Living</option>
                      <option value="Faith and Prayer">Faith and Prayer</option>
                      <option value="Worship">Worship</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Youth and Family">Youth and Family</option>
                      <option value="Motivation">Motivation</option>
                      <option value="Ministry News">Ministry News</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                      Scripture Reference (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Matthew 17:20"
                      value={blogScripture}
                      onChange={(e) => setBlogScripture(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={blogStatus}
                      onChange={(e: any) => setBlogStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden bg-white"
                    >
                      <option value="published">Published (Visible Publicly)</option>
                      <option value="draft">Draft (Private to Admin)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={blogImage}
                    onChange={(e) => setBlogImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Short Excerpt *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Summary visible in preview cards and search results..."
                    value={blogExcerpt}
                    onChange={(e) => setBlogExcerpt(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Article Body & Markdown Content *
                  </label>
                  <textarea
                    rows={12}
                    required
                    placeholder="### Heading 1&#10;&#10;Paragraph text...&#10;&#10;> Bible verse or quotation&#10;&#10;- Bullet point"
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Faith, Prayer, Victory"
                      value={blogTags}
                      onChange={(e) => setBlogTags(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      placeholder="Custom page title for search engines"
                      value={blogSeoTitle}
                      onChange={(e) => setBlogSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('blogs')}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-bold uppercase rounded-xs hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingBlogId ? 'Update Article' : 'Publish Article'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MINISTRIES MANAGEMENT */}
          {activeTab === 'ministries' && (
            <div className="space-y-6">
              <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                MINISTRY OUTREACH DIRECTORY
              </h1>
              <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left text-neutral-600">
                  <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                    <tr>
                      <th className="p-3">Ministry Title</th>
                      <th className="p-3">Scripture</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {ministries.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-50">
                        <td className="p-3 font-bold text-neutral-900">{m.title}</td>
                        <td className="p-3">{m.scripture}</td>
                        <td className="p-3">{m.schedule || 'Weekly'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                SHOP & RESOURCE INVENTORY
              </h1>
              <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left text-neutral-600">
                  <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="p-3 font-bold text-neutral-900">{p.title}</td>
                        <td className="p-3">{p.category}</td>
                        <td className="p-3 font-bold text-[#C83338]">₹{p.discountPrice || p.price}</td>
                        <td className="p-3 uppercase text-[10px] font-semibold">{p.productType}</td>
                        <td className="p-3 font-medium">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT INBOX (CRITICAL: SUPER ADMIN ONLY) */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {!isSuperAdmin ? (
                <div className="p-8 bg-red-50 border-2 border-red-300 rounded-xs text-center space-y-3">
                  <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
                  <h3 className="font-heading font-black text-xl text-red-900">
                    ACCESS RESTRICTED: CONFIDENTIAL SUBMISSIONS
                  </h3>
                  <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
                    Personal prayer requests, counseling messages, and private inquiries are protected under ministerial privacy regulations. Only the Super Administrator has authorization to view this inbox.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                        CONFIDENTIAL CONTACT & PRAYER INBOX
                      </h1>
                      <p className="text-xs text-neutral-500">
                        Private incoming inquiries, ministerial requests, and pastoral intercession needs.
                      </p>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase rounded-xs hover:bg-[#C83338] transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Submissions (CSV)</span>
                    </button>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="bg-white p-4 rounded-xs border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by name, email, subject, or message..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden"
                      />
                    </div>

                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="px-3 py-2 text-xs border border-neutral-200 rounded-xs bg-white outline-hidden"
                    >
                      <option value="All">All Categories</option>
                      <option value="Prayer Request">Prayer Request</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Speaking Invitation">Speaking Invitation</option>
                      <option value="Ministry Inquiry">Ministry Inquiry</option>
                    </select>

                    <select
                      value={contactStatusFilter}
                      onChange={(e) => setContactStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs border border-neutral-200 rounded-xs bg-white outline-hidden"
                    >
                      <option value="All">All Statuses</option>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Contacts Table */}
                  <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-neutral-600">
                        <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                          <tr>
                            <th className="p-3">Status</th>
                            <th className="p-3">Sender Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Subject & Preview</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {contacts
                            .filter((c) => {
                              const matchCat = contactCategory === 'All' || c.category === contactCategory;
                              const matchStat = contactStatusFilter === 'All' || c.status === contactStatusFilter;
                              const matchQ =
                                !contactSearch ||
                                c.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                c.subject.toLowerCase().includes(contactSearch.toLowerCase()) ||
                                c.message.toLowerCase().includes(contactSearch.toLowerCase());
                              return matchCat && matchStat && matchQ;
                            })
                            .map((c) => (
                              <tr key={c.id} className={`hover:bg-neutral-50 ${c.status === 'new' ? 'bg-red-50/20 font-medium' : ''}`}>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      c.status === 'new'
                                        ? 'bg-red-100 text-[#C83338]'
                                        : c.status === 'read'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-neutral-100 text-neutral-700'
                                    }`}
                                  >
                                    {c.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <p className="font-bold text-neutral-900">{c.fullName}</p>
                                  <p className="text-[10px] text-neutral-500 font-mono">{c.email}</p>
                                </td>
                                <td className="p-3 font-semibold text-neutral-700">{c.category}</td>
                                <td className="p-3 max-w-xs">
                                  <p className="font-semibold text-neutral-900 line-clamp-1">{c.subject}</p>
                                  <p className="text-[11px] text-neutral-500 line-clamp-1">{c.message}</p>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedContactModal(c);
                                      if (c.status === 'new') handleUpdateContactStatus(c.id, 'read');
                                    }}
                                    className="px-2.5 py-1 bg-neutral-100 hover:bg-[#C83338] hover:text-white rounded-xs text-[11px] font-bold"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContact(c.id)}
                                    className="p-1 text-neutral-400 hover:text-red-600"
                                    title="Delete submission"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: DONATIONS & TITHES (Super Admin & Pastor Only) */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              {!isSuperAdmin ? (
                <div className="p-8 bg-red-50 border-2 border-red-300 rounded-xs text-center space-y-3">
                  <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
                  <h3 className="font-heading font-black text-xl text-red-900">
                    ACCESS RESTRICTED: FINANCIAL LEDGER
                  </h3>
                  <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
                    Donations, tithes, and donor prayer requests are confidential. Only Pastor Samuel Soren and Super Administrators have access.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="font-heading font-black text-2xl text-[#252525] uppercase flex items-center gap-2">
                        <Heart className="w-6 h-6 text-[#C83338] fill-current" />
                        <span>MINISTRY DONATIONS & TITHES LEDGER</span>
                      </h1>
                      <p className="text-xs text-neutral-500">
                        Real-time tracking of UPI (<code className="font-mono text-[#C83338]">samuelsoren2@ybl</code>) and Razorpay QR code contributions.
                      </p>
                    </div>

                    <button
                      onClick={handleExportDonationsCSV}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase rounded-xs hover:bg-[#C83338] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Donations (CSV)</span>
                    </button>
                  </div>

                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-1">
                      <span className="text-xs font-bold uppercase text-neutral-500">Total Funds Raised</span>
                      <p className="font-heading font-black text-2xl text-[#C83338]">
                        ₹{donations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-neutral-400">Across all ministry causes</p>
                    </div>

                    <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-1">
                      <span className="text-xs font-bold uppercase text-neutral-500">Total Contributions</span>
                      <p className="font-heading font-black text-2xl text-neutral-900">
                        {donations.length}
                      </p>
                      <p className="text-[10px] text-neutral-400">Verified transaction receipts</p>
                    </div>

                    <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-1">
                      <span className="text-xs font-bold uppercase text-neutral-500">Monthly Partners</span>
                      <p className="font-heading font-black text-2xl text-emerald-600">
                        {donations.filter((d) => d.frequency === 'monthly').length}
                      </p>
                      <p className="text-[10px] text-neutral-400">Recurring ministry supporters</p>
                    </div>

                    <div className="bg-white p-5 rounded-xs border border-neutral-200 shadow-xs space-y-1">
                      <span className="text-xs font-bold uppercase text-neutral-500">Average Offering</span>
                      <p className="font-heading font-black text-2xl text-neutral-900">
                        ₹{donations.length > 0 ? Math.round(donations.reduce((s, d) => s + (d.amount || 0), 0) / donations.length).toLocaleString('en-IN') : '0'}
                      </p>
                      <p className="text-[10px] text-neutral-400">Per donation gift</p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="bg-white p-4 rounded-xs border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search donor name, email, or UTR / reference number..."
                        value={donationSearch}
                        onChange={(e) => setDonationSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xs focus:ring-1 focus:ring-[#C83338] outline-hidden"
                      />
                    </div>

                    <select
                      value={donationCauseFilter}
                      onChange={(e) => setDonationCauseFilter(e.target.value)}
                      className="px-3 py-2 text-xs border border-neutral-200 rounded-xs bg-white outline-hidden"
                    >
                      <option value="All">All Ministry Causes</option>
                      <option value="Rural Jharkhand Tribal Missions & Gospel Crusades">Tribal Missions</option>
                      <option value="Sacred Assemblies Fellowship Church Building & Worship Sound">Church Building</option>
                      <option value="Kingdom Kids Sunday School & Youth Discipleship">Sunday School & Youth</option>
                      <option value="Literature & Biblical Teaching Free Distribution">Free Literature</option>
                      <option value="General Ministry Tithes, Offerings & Pastor Support">General Tithes</option>
                    </select>
                  </div>

                  {/* Donations Table */}
                  <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-neutral-600">
                        <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                          <tr>
                            <th className="p-3">Receipt ID</th>
                            <th className="p-3">Donor Name</th>
                            <th className="p-3">Designated Cause</th>
                            <th className="p-3">Amount (INR)</th>
                            <th className="p-3">Frequency</th>
                            <th className="p-3">Method & UTR</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Prayer Request</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {donations
                            .filter((d) => {
                              const matchCause = donationCauseFilter === 'All' || d.cause.toLowerCase().includes(donationCauseFilter.toLowerCase());
                              const q = donationSearch.toLowerCase();
                              const matchSearch =
                                !donationSearch ||
                                d.donorName.toLowerCase().includes(q) ||
                                d.email.toLowerCase().includes(q) ||
                                (d.transactionId && d.transactionId.toLowerCase().includes(q)) ||
                                (d.phone && d.phone.includes(q));
                              return matchCause && matchSearch;
                            })
                            .map((d) => (
                              <tr key={d.id} className="hover:bg-neutral-50">
                                <td className="p-3 font-mono font-bold text-neutral-900">{d.id}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-neutral-900">{d.donorName}</span>
                                    {d.isAnonymous && (
                                      <span className="bg-neutral-100 text-neutral-600 text-[9px] font-semibold px-1.5 py-0.2 rounded-xs">
                                        Anon
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-neutral-500 font-mono">{d.email}</p>
                                  {d.phone && <p className="text-[10px] text-neutral-400">{d.phone}</p>}
                                </td>
                                <td className="p-3 font-semibold text-neutral-800 max-w-xs line-clamp-2">
                                  {d.cause}
                                </td>
                                <td className="p-3 font-extrabold text-[#C83338] text-sm whitespace-nowrap">
                                  ₹{d.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.frequency === 'monthly' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}>
                                    {d.frequency}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-[11px]">
                                  <div className="font-bold text-neutral-800">
                                    {d.paymentMethod === 'razorpay_qr' ? 'Razorpay QR' : 'UPI ID'}
                                  </div>
                                  <span className="text-[10px] text-neutral-500 break-all">{d.transactionId}</span>
                                </td>
                                <td className="p-3 text-[11px] whitespace-nowrap">
                                  {new Date(d.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                                    {d.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {d.prayerRequest ? (
                                    <button
                                      onClick={() => setSelectedDonationModal(d)}
                                      className="px-2.5 py-1 bg-red-50 text-[#C83338] hover:bg-red-100 font-bold text-[10px] uppercase rounded-xs transition-colors"
                                    >
                                      Read Prayer
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-neutral-400 italic">None</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 7: ORDERS (Super Admin ONLY) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {!isSuperAdmin ? (
                <div className="p-8 bg-red-50 border-2 border-red-300 rounded-xs text-center">
                  <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <h3 className="font-heading font-black text-xl text-red-900">RESTRICTED TO SUPER ADMIN</h3>
                </div>
              ) : (
                <>
                  <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                    CUSTOMER ORDERS & VERIFIED PAYMENTS
                  </h1>
                  <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left text-neutral-600">
                      <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Total Amount</th>
                          <th className="p-3">Payment Status</th>
                          <th className="p-3">Fulfillment</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-neutral-50">
                            <td className="p-3 font-mono font-bold text-neutral-900">{o.id}</td>
                            <td className="p-3">
                              <p className="font-bold text-neutral-900">{o.customerName}</p>
                              <p className="text-[10px] text-neutral-500">{o.email}</p>
                            </td>
                            <td className="p-3 font-bold text-[#C83338]">₹{o.total}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  o.paymentStatus === 'verified'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                value={o.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="px-2 py-1 text-[11px] border border-neutral-300 rounded-xs bg-white"
                              >
                                <option value="new">New</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 8: SUBSCRIBERS (Super Admin ONLY) */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              {!isSuperAdmin ? (
                <div className="p-8 bg-red-50 text-center">Protected</div>
              ) : (
                <>
                  <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                    NEWSLETTER SUBSCRIBERS ({subscribers.length})
                  </h1>
                  <div className="bg-white rounded-xs border border-neutral-200 overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left text-neutral-600">
                      <thead className="bg-neutral-50 text-neutral-800 uppercase font-bold text-[10px] border-b">
                        <tr>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Subscription Date</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {subscribers.map((s) => (
                          <tr key={s.id} className="hover:bg-neutral-50">
                            <td className="p-3 font-semibold text-neutral-900">{s.email}</td>
                            <td className="p-3">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 9: WEBSITE SETTINGS (Super Admin ONLY) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {!isSuperAdmin ? (
                <div className="p-8 bg-red-50 text-center">Protected</div>
              ) : siteSettings ? (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                        HOMEPAGE & BRANDING SETTINGS
                      </h1>
                      <p className="text-xs text-neutral-500">
                        Configure hero banners, church address, announcements, and contact information.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save All Changes</span>
                    </button>
                  </div>

                  {settingsSaveMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{settingsSaveMsg}</span>
                    </div>
                  )}

                  {/* Church Location Settings */}
                  <div className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                    <h3 className="font-heading font-bold text-sm text-[#252525] uppercase border-l-2 border-[#C83338] pl-2">
                      Church Fellowship Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Church Name</label>
                        <input
                          type="text"
                          value={siteSettings.churchLocation.churchName}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              churchLocation: { ...siteSettings.churchLocation, churchName: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Service Schedule</label>
                        <input
                          type="text"
                          value={siteSettings.churchLocation.schedule}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              churchLocation: { ...siteSettings.churchLocation, schedule: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Postal Address</label>
                        <input
                          type="text"
                          value={siteSettings.churchLocation.address}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              churchLocation: { ...siteSettings.churchLocation, address: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Settings */}
                  <div className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                    <h3 className="font-heading font-bold text-sm text-[#252525] uppercase border-l-2 border-[#C83338] pl-2">
                      Hero Banner Configuration
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Hero Subtitle</label>
                        <input
                          type="text"
                          value={siteSettings.hero.subtitle}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              hero: { ...siteSettings.hero, subtitle: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Main Heading</label>
                        <input
                          type="text"
                          value={siteSettings.hero.title}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              hero: { ...siteSettings.hero, title: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Hero Description</label>
                        <textarea
                          rows={2}
                          value={siteSettings.hero.description}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              hero: { ...siteSettings.hero, description: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save All Changes</span>
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          )}

          {/* TAB 8: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="font-heading font-black text-2xl text-[#252525] uppercase">
                  PASSWORD & SECURITY
                </h1>
                <p className="text-xs text-neutral-500">
                  Manage your credentials, change password, and inspect security settings for {user.name}.
                </p>
              </div>

              {/* Account Overview Box */}
              <div className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Active Account Profile
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 space-y-1">
                    <span className="text-neutral-500 block">Administrator Name</span>
                    <p className="font-bold text-neutral-900 text-sm">{user.name}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 space-y-1">
                    <span className="text-neutral-500 block">Registered Email</span>
                    <p className="font-mono font-bold text-[#C83338] text-sm">{user.email}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 space-y-1">
                    <span className="text-neutral-500 block">Access Privilege</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="bg-[#C83338] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
                        {user.role}
                      </span>
                      {(user.email === 'sorensam84@gmail.com' || user.email === 'sorensam@gmail.com') && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-xs">
                          Designated Official Super Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 space-y-1">
                    <span className="text-neutral-500 block">Session Status</span>
                    <p className="font-semibold text-emerald-600">Active & Verified (JWT Token)</p>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="bg-white p-6 rounded-xs border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Change Password
                  </h2>
                  <span className="text-[11px] text-neutral-500">Minimum 6 characters</span>
                </div>

                {changeError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{changeError}</span>
                  </div>
                )}

                {changeSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{changeSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={changeNewPass}
                        onChange={(e) => setChangeNewPass(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={changeConfirmPass}
                        onChange={(e) => setChangeConfirmPass(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={changeLoading}
                      className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{changeLoading ? 'Updating Password...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Recovery Info */}
              <div className="bg-neutral-50 p-4 rounded-xs border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                <p className="font-bold text-neutral-800">Need to reset your password if you ever forget it?</p>
                <p>
                  You can use the <strong>Forgot Password?</strong> option on the dashboard sign-in screen at any time. When you enter your registered administrator email address (<strong>sorensam84@gmail.com</strong> or <strong>sorensam@gmail.com</strong>), a secure 6-digit one-time verification code is generated to set your new password immediately.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Selected Contact Submission View Modal */}
      {selectedContactModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="p-4 bg-neutral-900 text-white flex justify-between items-center border-b-2 border-[#C83338]">
              <span className="text-xs font-bold uppercase tracking-wider">
                Confidential Submission &middot; {selectedContactModal.id}
              </span>
              <button
                onClick={() => setSelectedContactModal(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded-xs border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">Sender:</span>
                  <span className="font-bold text-neutral-900">{selectedContactModal.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Email:</span>
                  <a href={`mailto:${selectedContactModal.email}`} className="text-[#C83338] font-semibold hover:underline">
                    {selectedContactModal.email}
                  </a>
                </div>
                <div>
                  <span className="text-neutral-500 block">Phone:</span>
                  <span className="font-semibold text-neutral-800">{selectedContactModal.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Category:</span>
                  <span className="font-bold text-[#C83338]">{selectedContactModal.category}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-700 block uppercase mb-1">
                  Subject: {selectedContactModal.subject}
                </span>
                <div className="p-3 bg-neutral-100 rounded-xs text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed border border-neutral-200">
                  {selectedContactModal.message}
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-xs">
                <span className="text-neutral-500">Mark Status:</span>
                <div className="flex gap-1.5">
                  {(['new', 'read', 'replied', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateContactStatus(selectedContactModal.id, st)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs transition-colors ${
                        selectedContactModal.status === st
                          ? 'bg-[#C83338] text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confidential Donation & Prayer Request Modal */}
      {selectedDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-lg w-full p-6 shadow-2xl relative border-t-4 border-[#C83338]">
            <button
              onClick={() => setSelectedDonationModal(null)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#C83338] fill-current" />
                <h3 className="font-heading font-black text-lg text-neutral-900 uppercase">
                  DONATION & PRAYER REQUEST
                </h3>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xs border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Receipt Number:</span>
                  <span className="font-mono font-bold">{selectedDonationModal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Donor:</span>
                  <span className="font-bold">{selectedDonationModal.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Email & Phone:</span>
                  <span>{selectedDonationModal.email} {selectedDonationModal.phone ? `· ${selectedDonationModal.phone}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Designated Cause:</span>
                  <span className="font-bold text-[#C83338]">{selectedDonationModal.cause}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Amount & Frequency:</span>
                  <span className="font-extrabold text-[#C83338] text-sm">
                    ₹{selectedDonationModal.amount.toLocaleString('en-IN')} ({selectedDonationModal.frequency})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">UPI / Transaction ID:</span>
                  <span className="font-mono">{selectedDonationModal.transactionId}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-800 uppercase block mb-1.5">
                  Personal Prayer Request for Pastor Samuel:
                </span>
                <div className="p-3 bg-red-50/60 rounded-xs border border-red-200 text-xs text-neutral-800 italic leading-relaxed">
                  "{selectedDonationModal.prayerRequest || 'No specific prayer request provided. General blessing & harvest covenant.'}"
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDonationModal(null)}
                  className="px-4 py-2 bg-[#C83338] text-white font-bold text-xs uppercase rounded-xs hover:bg-[#a62529]"
                >
                  Close & Intercede
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
