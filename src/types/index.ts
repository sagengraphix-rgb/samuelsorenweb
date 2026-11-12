export type UserRole = 'superadmin' | 'editor';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  scriptureReference?: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Ministry {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  content: string;
  scripture: string;
  image: string;
  leader?: string;
  schedule?: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  stock: number;
  productType: 'physical' | 'digital';
  downloadUrl?: string;
  status: 'active' | 'archived';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  productType: 'physical' | 'digital';
  downloadUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'verified' | 'failed';
  paymentReference?: string;
  orderStatus: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  category: 'General Inquiry' | 'Prayer Request' | 'Speaking Invitation' | 'Ministry Inquiry' | 'Other';
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface Donation {
  id: string;
  donorName: string;
  email: string;
  phone?: string;
  cause: string;
  amount: number;
  frequency: 'one-time' | 'monthly';
  paymentMethod: 'upi' | 'razorpay_qr';
  transactionId?: string;
  upiId?: string;
  prayerRequest?: string;
  isAnonymous?: boolean;
  status: 'verified' | 'pending';
  createdAt: string;
}

export interface SiteSettings {
  branding: {
    siteTitle: string;
    tagline: string;
    designation: string;
    logoPrimary: string;
    logoSecondary: string;
    logoTag: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    bgImage: string;
  };
  announcementStrip: {
    items: Array<{
      id: string;
      title: string;
      subtitle: string;
      link: string;
    }>;
    moreUpdatesLink: string;
  };
  churchLocation: {
    churchName: string;
    address: string;
    schedule: string;
    phone: string;
    email: string;
    directionsUrl: string;
    mapEmbedUrl: string;
  };
  aboutSection: {
    heading: string;
    excerpt: string;
    fullBio: string;
    image: string;
  };
  socialLinks: {
    facebook: string;
    youtube: string;
    instagram: string;
    twitter: string;
  };
}
