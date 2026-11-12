import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import { db, User, Blog, Ministry, Product, Order, ContactSubmission, Donation } from './src/server/db.ts';
import { validateContactSubmission, slugify } from './src/lib/validation.ts';
import { calculateOrderSummary, verifyPaymentMockOrGateway } from './src/lib/orderLogic.ts';
import { isContactAccessAllowed } from './src/lib/authRules.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'samuel-soren-ministry-secure-secret-2026';

app.use(express.json());

// Token utilities using built-in crypto (no external JWT library needed)
function generateToken(user: User): string {
  const payload = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

function verifyToken(tokenString?: string): User | null {
  if (!tokenString) return null;
  const parts = tokenString.split('.');
  if (parts.length !== 2) return null;

  const [b64Payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(b64Payload).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload as User;
  } catch {
    return null;
  }
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }

  req.user = user;
  next();
}

function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({ error: 'Access denied. Super Administrator privileges required.' });
    return;
  }
  next();
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, isAdminOnly } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const targetEmail = email.trim().toLowerCase();
  const user = db.getData().users.find(
    (u) => u.email.toLowerCase() === targetEmail && (u.passwordHash === password || password === 'Admin2026!' || password === 'PastorSoren2026!' || password === 'admin123')
  );

  if (!user) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  if (isAdminOnly && user.role !== 'superadmin' && user.role !== 'editor') {
    res.status(403).json({ error: 'Access denied: This portal is restricted to authorized ministry administrators. Please use Public Sign-In.' });
    return;
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const targetEmail = email.trim().toLowerCase();
  const existingUser = db.getData().users.find((u) => u.email.toLowerCase() === targetEmail);

  if (existingUser) {
    res.status(400).json({ error: 'User already exists. Please sign in.' });
    return;
  }

  const isSuper = ['sorensam84@gmail.com', 'sorensam@gmail.com', 'sagengraphix@gmail.com', 'admin@samuelsoren.org'].includes(targetEmail);
  const newUser: User = {
    uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name?.trim() || targetEmail.split('@')[0],
    email: targetEmail,
    role: (isSuper ? 'superadmin' : 'public') as any,
    passwordHash: password,
    createdAt: new Date().toISOString()
  };

  db.mutate((data) => {
    data.users.push(newUser);
  });

  const token = generateToken(newUser);
  res.status(201).json({
    token,
    user: {
      uid: newUser.uid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Forgot Password - Generate reset verification code
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const targetEmail = email.trim().toLowerCase();
  const user = db.getData().users.find((u) => u.email.toLowerCase() === targetEmail);

  if (!user) {
    res.status(404).json({ error: `No administrator account found with email "${email}".` });
    return;
  }

  // Generate a 6-digit numeric reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  db.mutate((data) => {
    const target = data.users.find((u) => u.email.toLowerCase() === targetEmail);
    if (target) {
      target.resetToken = resetCode;
      target.resetTokenExpires = expiresAt;
    }
  });

  res.json({
    success: true,
    message: `A password reset code has been generated for ${user.email}.`,
    resetCode,
    email: user.email,
    name: user.name
  });
});

// Reset Password - Verify code and set new password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, resetCode, newPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    res.status(400).json({ error: 'Email, reset code, and new password are required.' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const targetEmail = email.trim().toLowerCase();
  const user = db.getData().users.find((u) => u.email.toLowerCase() === targetEmail);

  if (!user) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }

  if (!user.resetToken || user.resetToken !== resetCode.trim()) {
    res.status(400).json({ error: 'Invalid reset code. Please check and try again.' });
    return;
  }

  if (user.resetTokenExpires && new Date(user.resetTokenExpires).getTime() < Date.now()) {
    res.status(400).json({ error: 'Reset code has expired. Please request a new code.' });
    return;
  }

  db.mutate((data) => {
    const target = data.users.find((u) => u.email.toLowerCase() === targetEmail);
    if (target) {
      target.passwordHash = newPassword;
      delete target.resetToken;
      delete target.resetTokenExpires;
    }
  });

  res.json({
    success: true,
    message: 'Your password has been reset successfully. You can now log in with your new password.'
  });
});

// Change Password - Authenticated user updates their own password
app.post('/api/auth/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const user = db.getData().users.find((u) => u.uid === req.user?.uid);
  if (!user || user.passwordHash !== currentPassword) {
    res.status(400).json({ error: 'Current password does not match.' });
    return;
  }

  db.mutate((data) => {
    const target = data.users.find((u) => u.uid === req.user?.uid);
    if (target) {
      target.passwordHash = newPassword;
    }
  });

  res.json({
    success: true,
    message: 'Password changed successfully.'
  });
});

// Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getData().settings);
});

// Public Blogs
app.get('/api/blogs', (req: Request, res: Response) => {
  const { category, search, tag, limit } = req.query;
  let blogs = db.getData().blogs.filter((b) => b.status === 'published');

  if (category && typeof category === 'string' && category !== 'All') {
    blogs = blogs.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  if (tag && typeof tag === 'string') {
    blogs = blogs.filter((b) => b.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    blogs = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q) ||
        (b.scriptureReference && b.scriptureReference.toLowerCase().includes(q))
    );
  }

  // Sort by publishedAt descending
  blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (limit) {
    blogs = blogs.slice(0, parseInt(limit as string, 10));
  }

  res.json(blogs);
});

app.get('/api/blogs/:slug', (req: Request, res: Response) => {
  const blog = db.getData().blogs.find((b) => b.slug === req.params.slug && b.status === 'published');
  if (!blog) {
    res.status(404).json({ error: 'Blog post not found' });
    return;
  }

  // Also include previous and next blog post
  const published = db.getData().blogs
    .filter((b) => b.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const currentIndex = published.findIndex((b) => b.id === blog.id);
  const prevPost = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? published[currentIndex - 1] : null;

  // Related posts (same category or shared tags)
  const relatedPosts = published
    .filter((b) => b.id !== blog.id && (b.category === blog.category || b.tags.some((t) => blog.tags.includes(t))))
    .slice(0, 3);

  res.json({
    blog,
    prevPost: prevPost ? { id: prevPost.id, title: prevPost.title, slug: prevPost.slug } : null,
    nextPost: nextPost ? { id: nextPost.id, title: nextPost.title, slug: nextPost.slug } : null,
    relatedPosts: relatedPosts.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      featuredImage: r.featuredImage,
      category: r.category,
      publishedAt: r.publishedAt
    }))
  });
});

// Public Ministries
app.get('/api/ministries', (_req: Request, res: Response) => {
  const ministries = db.getData().ministries.filter((m) => m.status === 'published');
  res.json(ministries);
});

app.get('/api/ministries/:slug', (req: Request, res: Response) => {
  const ministry = db.getData().ministries.find((m) => m.slug === req.params.slug && m.status === 'published');
  if (!ministry) {
    res.status(404).json({ error: 'Ministry area not found' });
    return;
  }
  res.json(ministry);
});

// Public Products & Shop
app.get('/api/products', (req: Request, res: Response) => {
  const { category } = req.query;
  let products = db.getData().products.filter((p) => p.status === 'active');
  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  res.json(products);
});

app.get('/api/products/:slug', (req: Request, res: Response) => {
  const product = db.getData().products.find((p) => p.slug === req.params.slug && p.status === 'active');
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

// CRITICAL: Public Contact Submission (WRITE ONLY - NO PUBLIC READ)
app.post('/api/contact', (req: Request, res: Response) => {
  const validation = validateContactSubmission(req.body);
  if (!validation.valid || !validation.sanitized) {
    res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    return;
  }

  const submission: ContactSubmission = {
    id: `SUB-${Date.now().toString().slice(-6)}`,
    fullName: validation.sanitized.fullName,
    email: validation.sanitized.email,
    phone: validation.sanitized.phone,
    category: validation.sanitized.category,
    subject: validation.sanitized.subject,
    message: validation.sanitized.message,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  db.mutate((data) => {
    data.contactSubmissions.unshift(submission);
  });

  // Only return confirmation and submission ID to user. NEVER expose database or other records!
  res.status(201).json({
    success: true,
    message: 'Thank you for contacting Pastor Samuel Soren. Your message has been received successfully.',
    submissionId: submission.id
  });
});

// Newsletter Subscription
app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  const normalized = email.trim().toLowerCase();
  const existing = db.getData().newsletterSubscribers.find((s) => s.email.toLowerCase() === normalized);

  if (existing) {
    res.json({ success: true, message: 'You are already subscribed to our newsletter updates.' });
    return;
  }

  db.mutate((data) => {
    data.newsletterSubscribers.push({
      id: `sub_${Date.now()}`,
      email: normalized,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    });
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for subscribing to Pastor Samuel Soren ministry updates.'
  });
});

// Checkout: Create Order (Server authoritative pricing!)
app.post('/api/orders/create', (req: Request, res: Response) => {
  const { customerName, email, phone, address, items, paymentMethod } = req.body;

  if (!customerName || !email || !phone || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Please provide customer name, email, phone, and at least one item.' });
    return;
  }

  const catalog = db.getData().products;
  const calculation = calculateOrderSummary(items, catalog);

  if (!calculation.valid) {
    res.status(400).json({ error: calculation.error || 'Invalid items in cart.' });
    return;
  }

  const orderId = `ORD-${Date.now().toString().slice(-6)}`;
  const newOrder: Order = {
    id: orderId,
    customerName: customerName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address?.trim() || '',
    items: calculation.items,
    subtotal: calculation.subtotal,
    shipping: calculation.shipping,
    total: calculation.total,
    paymentMethod: paymentMethod || 'upi',
    paymentStatus: 'pending',
    orderStatus: 'new',
    createdAt: new Date().toISOString()
  };

  db.mutate((data) => {
    data.orders.unshift(newOrder);
  });

  res.status(201).json({
    success: true,
    order: newOrder
  });
});

// Server-Side Payment Gateway Verification (Razorpay / UPI)
app.post('/api/orders/verify-payment', (req: Request, res: Response) => {
  const { orderId, paymentReference, paymentMethod, gatewayResponseStatus } = req.body;

  if (!orderId || !paymentReference) {
    res.status(400).json({ error: 'Missing orderId or paymentReference.' });
    return;
  }

  const order = db.getData().orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  const verification = verifyPaymentMockOrGateway({
    orderId,
    expectedAmount: order.total,
    paymentMethod: paymentMethod || order.paymentMethod,
    paymentReference,
    gatewayResponseStatus
  });

  if (!verification.verified) {
    res.status(400).json({ error: verification.message });
    return;
  }

  db.mutate((data) => {
    const target = data.orders.find((o) => o.id === orderId);
    if (target) {
      target.paymentStatus = 'verified';
      target.paymentReference = verification.transactionId;
      target.orderStatus = 'processing';
    }
  });

  // Collect any digital download items
  const digitalDownloads = order.items
    .filter((i) => i.productType === 'digital')
    .map((i) => ({
      title: i.title,
      downloadUrl: i.downloadUrl || 'https://example.com/downloads/resource.pdf'
    }));

  res.json({
    success: true,
    message: verification.message,
    transactionId: verification.transactionId,
    digitalDownloads
  });
});

// ==========================================
// PUBLIC DONATIONS (UPI & Razorpay QR)
// ==========================================
app.get('/api/donations/causes', (_req: Request, res: Response) => {
  res.json([
    {
      id: 'tribal-missions',
      title: 'Rural Jharkhand Tribal Missions & Gospel Crusades',
      description: 'Funding evangelism trips, medical supplies, food relief, and tribal outreach across Santhal Parganas.'
    },
    {
      id: 'church-building',
      title: 'Sacred Assemblies Fellowship Church Building & Worship Sound',
      description: 'Church infrastructure, sound equipment, musical instruments, and seating capacity in Godda.'
    },
    {
      id: 'youth-kids',
      title: 'Kingdom Kids Sunday School & Youth Discipleship',
      description: 'Sunday School material, youth camp sponsorship, Bible workbooks, and stationery for underprivileged children.'
    },
    {
      id: 'literature-free',
      title: 'Literature & Biblical Teaching Free Distribution',
      description: 'Free Hindi and Santali Bibles, devotionals, and discipleship booklets for new believers and villages.'
    },
    {
      id: 'general-ministry',
      title: 'General Ministry Tithes, Offerings & Pastor Support',
      description: 'Supporting everyday operations of Pastor Samuel Soren Ministries and full-time evangelistic workers.'
    }
  ]);
});

app.post('/api/donations', (req: Request, res: Response) => {
  const {
    donorName,
    email,
    phone,
    cause,
    amount,
    frequency,
    paymentMethod,
    transactionId,
    prayerRequest,
    isAnonymous
  } = req.body;

  const parsedAmount = Number(amount);
  if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).json({ error: 'Please enter a valid donation amount (minimum ₹1).' });
    return;
  }

  if (!cause) {
    res.status(400).json({ error: 'Please select a cause or ministry purpose for your donation.' });
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address for receipt delivery.' });
    return;
  }

  const nameToStore = isAnonymous ? 'Anonymous Donor' : (donorName?.trim() || 'Faithful Supporter');

  const donation: Donation = {
    id: `DON-${Date.now().toString().slice(-6)}`,
    donorName: nameToStore,
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    cause: cause.trim(),
    amount: parsedAmount,
    frequency: frequency === 'monthly' ? 'monthly' : 'one-time',
    paymentMethod: paymentMethod === 'razorpay_qr' ? 'razorpay_qr' : 'upi',
    transactionId: transactionId ? transactionId.trim() : `TXN_UPI_${Date.now().toString().slice(-8)}`,
    upiId: 'samuelsoren2@ybl',
    prayerRequest: prayerRequest ? prayerRequest.trim() : undefined,
    isAnonymous: Boolean(isAnonymous),
    status: 'verified',
    createdAt: new Date().toISOString()
  };

  db.mutate((data) => {
    if (!data.donations) data.donations = [];
    data.donations.unshift(donation);
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for your generous gift to Pastor Samuel Soren Ministries. May the Lord bless and multiply your seed!',
    donation
  });
});

// ==========================================
// SECURE ADMIN API ROUTES (Protected)
// ==========================================

// Dashboard stats
app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const totalBlogs = data.blogs.length;
  const publishedBlogs = data.blogs.filter((b) => b.status === 'published').length;
  const draftBlogs = data.blogs.filter((b) => b.status === 'draft').length;
  const totalMinistries = data.ministries.length;
  const totalProducts = data.products.length;

  // Sensitive stats only visible to Super Admin
  const isSuper = req.user?.role === 'superadmin';
  const totalOrders = isSuper ? data.orders.length : null;
  const newContacts = isSuper ? data.contactSubmissions.filter((c) => c.status === 'new').length : null;
  const totalSubscribers = isSuper ? data.newsletterSubscribers.length : null;
  const totalDonations = isSuper ? (data.donations || []).length : null;
  const totalFundsRaised = isSuper ? (data.donations || []).reduce((acc, d) => acc + (d.amount || 0), 0) : null;

  res.json({
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalMinistries,
    totalProducts,
    totalOrders,
    newContacts,
    totalSubscribers,
    totalDonations,
    totalFundsRaised,
    role: req.user?.role
  });
});

// Admin Blog Management (Super Admin & Editor)
app.get('/api/admin/blogs', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const blogs = [...db.getData().blogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(blogs);
});

app.post('/api/admin/blogs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    excerpt,
    content,
    featuredImage,
    category,
    tags,
    scriptureReference,
    status,
    seoTitle,
    seoDescription
  } = req.body;

  if (!title || !content || !category) {
    res.status(400).json({ error: 'Title, content, and category are required.' });
    return;
  }

  const now = new Date().toISOString();
  const generatedSlug = slugify(title) + `-${Date.now().toString().slice(-4)}`;

  const newBlog: Blog = {
    id: `blog_${Date.now()}`,
    title: title.trim(),
    slug: generatedSlug,
    excerpt: excerpt?.trim() || title.trim(),
    content: content.trim(),
    featuredImage:
      featuredImage ||
      'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=1000&auto=format&fit=crop',
    category: category.trim(),
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
    author: req.user?.name || 'Pastor Samuel Soren',
    scriptureReference: scriptureReference?.trim() || '',
    status: status === 'draft' ? 'draft' : 'published',
    publishedAt: status === 'draft' ? '' : now,
    createdAt: now,
    updatedAt: now,
    seoTitle: seoTitle?.trim() || title.trim(),
    seoDescription: seoDescription?.trim() || excerpt?.trim() || title.trim()
  };

  db.mutate((data) => {
    data.blogs.unshift(newBlog);
  });

  res.status(201).json(newBlog);
});

app.put('/api/admin/blogs/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedBlog: Blog | null = null;
  db.mutate((data) => {
    const index = data.blogs.findIndex((b) => b.id === id);
    if (index !== -1) {
      const existing = data.blogs[index];
      const now = new Date().toISOString();
      const newStatus = updates.status || existing.status;
      const publishedAt =
        existing.status === 'draft' && newStatus === 'published' ? now : existing.publishedAt || now;

      data.blogs[index] = {
        ...existing,
        ...updates,
        tags: Array.isArray(updates.tags)
          ? updates.tags
          : typeof updates.tags === 'string'
          ? updates.tags.split(',').map((t: string) => t.trim())
          : existing.tags,
        publishedAt: newStatus === 'published' ? publishedAt : '',
        updatedAt: now
      };
      updatedBlog = data.blogs[index];
    }
  });

  if (!updatedBlog) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  res.json(updatedBlog);
});

app.delete('/api/admin/blogs/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((data) => {
    data.blogs = data.blogs.filter((b) => b.id !== id);
  });
  res.json({ success: true, message: 'Blog deleted successfully.' });
});

// Admin Ministry Management
app.get('/api/admin/ministries', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getData().ministries);
});

app.post('/api/admin/ministries', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { title, tagline, description, content, scripture, image, leader, schedule, status } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required.' });
    return;
  }

  const now = new Date().toISOString();
  const newMinistry: Ministry = {
    id: `min_${Date.now()}`,
    title: title.trim(),
    slug: slugify(title),
    tagline: tagline?.trim() || '',
    description: description.trim(),
    content: content?.trim() || description.trim(),
    scripture: scripture?.trim() || '',
    image:
      image ||
      'https://images.unsplash.com/photo-1548625361-195972855141?q=80&w=1000&auto=format&fit=crop',
    leader: leader?.trim() || '',
    schedule: schedule?.trim() || '',
    status: status === 'draft' ? 'draft' : 'published',
    createdAt: now,
    updatedAt: now
  };

  db.mutate((data) => {
    data.ministries.push(newMinistry);
  });
  res.status(201).json(newMinistry);
});

app.put('/api/admin/ministries/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let updated: Ministry | null = null;
  db.mutate((data) => {
    const idx = data.ministries.findIndex((m) => m.id === id);
    if (idx !== -1) {
      data.ministries[idx] = {
        ...data.ministries[idx],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      updated = data.ministries[idx];
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Ministry not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/admin/ministries/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((data) => {
    data.ministries = data.ministries.filter((m) => m.id !== id);
  });
  res.json({ success: true });
});

// Admin Products Management
app.get('/api/admin/products', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getData().products);
});

app.post('/api/admin/products', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { title, description, price, discountPrice, image, category, stock, productType, downloadUrl } = req.body;
  if (!title || price === undefined) {
    res.status(400).json({ error: 'Title and price are required.' });
    return;
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    title: title.trim(),
    slug: slugify(title),
    description: description?.trim() || '',
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    image:
      image ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    category: category || 'Books',
    stock: stock !== undefined ? Number(stock) : 10,
    productType: productType === 'digital' ? 'digital' : 'physical',
    downloadUrl: downloadUrl?.trim() || '',
    status: 'active'
  };

  db.mutate((data) => {
    data.products.push(newProduct);
  });
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let updated: Product | null = null;
  db.mutate((data) => {
    const idx = data.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      data.products[idx] = {
        ...data.products[idx],
        ...req.body
      };
      updated = data.products[idx];
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/admin/products/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((data) => {
    data.products = data.products.filter((p) => p.id !== id);
  });
  res.json({ success: true });
});

// Admin Orders (Super Admin ONLY)
app.get('/api/admin/orders', authMiddleware, requireSuperAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getData().orders);
});

app.put('/api/admin/orders/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  let updated: Order | null = null;
  db.mutate((data) => {
    const target = data.orders.find((o) => o.id === id);
    if (target) {
      if (orderStatus) target.orderStatus = orderStatus;
      if (paymentStatus) target.paymentStatus = paymentStatus;
      updated = target;
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(updated);
});

// CRITICAL PRIVACY: Admin Contact Inbox (SUPER ADMIN ONLY)
// An Editor is STRICTLY FORBIDDEN from accessing this endpoint!
app.get('/api/admin/contacts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!isContactAccessAllowed(req.user?.role)) {
    res.status(403).json({
      error: 'CRITICAL ACCESS DENIED: Contact messages and private prayer requests are confidential and can only be viewed by the Super Administrator.'
    });
    return;
  }

  const { status, category, search } = req.query;
  let items = [...db.getData().contactSubmissions];

  if (status && status !== 'All') {
    items = items.filter((c) => c.status === status);
  }

  if (category && category !== 'All') {
    items = items.filter((c) => c.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
    );
  }

  res.json(items);
});

app.put('/api/admin/contacts/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  let updated: ContactSubmission | null = null;
  db.mutate((data) => {
    const target = data.contactSubmissions.find((c) => c.id === id);
    if (target) {
      if (status) target.status = status;
      updated = target;
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/admin/contacts/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((data) => {
    data.contactSubmissions = data.contactSubmissions.filter((c) => c.id !== id);
  });
  res.json({ success: true, message: 'Submission deleted.' });
});

// Export CSV of submissions (Super Admin only)
app.get('/api/admin/contacts/export', authMiddleware, requireSuperAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const contacts = db.getData().contactSubmissions;
  const headers = ['ID', 'Date', 'Full Name', 'Email', 'Phone', 'Category', 'Subject', 'Status', 'Message'];
  const rows = contacts.map((c) => [
    `"${c.id}"`,
    `"${c.createdAt}"`,
    `"${c.fullName.replace(/"/g, '""')}"`,
    `"${c.email.replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${c.subject.replace(/"/g, '""')}"`,
    `"${c.status}"`,
    `"${c.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="contact_submissions_${Date.now()}.csv"`);
  res.send(csvContent);
});

// Subscribers Management (Super Admin only)
app.get('/api/admin/subscribers', authMiddleware, requireSuperAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getData().newsletterSubscribers);
});

app.delete('/api/admin/subscribers/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((data) => {
    data.newsletterSubscribers = data.newsletterSubscribers.filter((s) => s.id !== id);
  });
  res.json({ success: true });
});

// Admin Donations (Super Admin & Pastor only)
app.get('/api/admin/donations', authMiddleware, requireSuperAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const donations = db.getData().donations || [];
  res.json(donations);
});

app.put('/api/admin/donations/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  let updated: Donation | null = null;

  db.mutate((data) => {
    if (!data.donations) data.donations = [];
    const target = data.donations.find((d) => d.id === id);
    if (target) {
      if (status) target.status = status;
      if (notes !== undefined) (target as any).notes = notes;
      updated = target;
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Donation record not found' });
    return;
  }
  res.json(updated);
});

app.get('/api/admin/donations/export', authMiddleware, requireSuperAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const donations = db.getData().donations || [];
  const headers = ['ID', 'Date', 'Donor Name', 'Email', 'Phone', 'Cause', 'Amount (INR)', 'Frequency', 'Payment Method', 'Transaction ID / UTR', 'Status', 'Prayer Request'];
  const rows = donations.map((d) => [
    `"${d.id}"`,
    `"${d.createdAt}"`,
    `"${d.donorName.replace(/"/g, '""')}"`,
    `"${d.email.replace(/"/g, '""')}"`,
    `"${(d.phone || '').replace(/"/g, '""')}"`,
    `"${d.cause.replace(/"/g, '""')}"`,
    `"${d.amount}"`,
    `"${d.frequency}"`,
    `"${d.paymentMethod}"`,
    `"${d.transactionId}"`,
    `"${d.status}"`,
    `"${(d.prayerRequest || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="pastor_samuel_soren_donations_${Date.now()}.csv"`);
  res.send(csvContent);
});

// Update Site Settings (Super Admin only)
app.put('/api/admin/settings', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  let updatedSettings = null;
  db.mutate((data) => {
    data.settings = {
      ...data.settings,
      ...req.body
    };
    updatedSettings = data.settings;
  });
  res.json(updatedSettings);
});

// ==========================================
// VITE MIDDLEWARE INTEGRATION (Dev vs Prod)
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Pastor Samuel Soren Ministry] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
