export type UserRole = 'superadmin' | 'editor' | 'public';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
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

export interface ProductAttribute {
  id: string;
  name: string; // e.g. "Format", "Language", "Binding"
  values: string[]; // e.g. ["Paperback", "Hardcover", "PDF eBook"]
  visibleOnProductPage: boolean;
  usedForVariations: boolean;
}

export interface ProductVariation {
  id: string;
  title: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  image?: string;
  attributes: Record<string, string>; // e.g. { Format: "Hardcover", Language: "Santali" }
}

export interface ProductReview {
  id: string;
  author: string;
  email?: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface DownloadableFile {
  id: string;
  name: string;
  url: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  price: number; // Regular price
  discountPrice?: number; // Sale price
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  sku?: string;
  image: string;
  gallery?: string[];
  category: string;
  tags?: string[];
  stock: number;
  manageStock?: boolean;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  lowStockThreshold?: number;
  allowBackorders?: 'no' | 'notify' | 'yes';
  soldIndividually?: boolean;
  weightKg?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: string;
  productType: 'physical' | 'digital' | 'simple' | 'variable' | 'virtual' | 'grouped';
  isVirtual?: boolean;
  isDownloadable?: boolean;
  downloadUrl?: string;
  downloadFiles?: DownloadableFile[];
  downloadLimit?: number;
  downloadExpiryDays?: number;
  featured?: boolean;
  catalogVisibility?: 'visible' | 'catalog' | 'search' | 'hidden';
  status: 'active' | 'archived' | 'draft';
  rating?: number;
  ratingCount?: number;
  reviews?: ProductReview[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  upsellIds?: string[];
  crossSellIds?: string[];
  purchaseNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variationId?: string;
  selectedAttributes?: Record<string, string>;
  effectivePrice?: number;
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
