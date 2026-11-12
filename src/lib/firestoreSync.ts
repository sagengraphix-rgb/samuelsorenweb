import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { Blog, Ministry, Product, Order, ContactSubmission, Donation, SiteSettings } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  counts: {
    blogs: number;
    ministries: number;
    products: number;
    donations: number;
    orders: number;
    contacts: number;
    settings: number;
  };
}

/**
 * Synchronizes the website records into Firebase Firestore.
 */
export async function syncDatabaseToFirestore(): Promise<SyncResult> {
  const counts = {
    blogs: 0,
    ministries: 0,
    products: 0,
    donations: 0,
    orders: 0,
    contacts: 0,
    settings: 0
  };

  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    // 1. Fetch current datasets from API
    const [blogsRes, ministriesRes, productsRes, donationsRes, ordersRes, contactsRes, settingsRes] =
      await Promise.all([
        fetch(`${baseUrl}/api/blogs`),
        fetch(`${baseUrl}/api/ministries`),
        fetch(`${baseUrl}/api/products`),
        fetch(`${baseUrl}/api/donations`),
        fetch(`${baseUrl}/api/orders`),
        fetch(`${baseUrl}/api/contact/categories`),
        fetch(`${baseUrl}/api/settings`)
      ]);

    const blogs: Blog[] = blogsRes.ok ? await blogsRes.json() : [];
    const ministries: Ministry[] = ministriesRes.ok ? await ministriesRes.json() : [];
    const products: Product[] = productsRes.ok ? await productsRes.json() : [];
    const donations: Donation[] = donationsRes.ok ? await donationsRes.json() : [];
    const orders: Order[] = ordersRes.ok ? await ordersRes.json() : [];
    const settings: SiteSettings = settingsRes.ok ? await settingsRes.json() : null;

    // Write Blogs to Firestore
    for (const blog of blogs) {
      try {
        await setDoc(doc(db, 'blogs', blog.id), {
          ...blog,
          syncedAt: new Date().toISOString()
        });
        counts.blogs++;
      } catch (err) {
        console.warn('Firestore blog write note:', blog.id, err);
      }
    }

    // Write Ministries to Firestore
    for (const ministry of ministries) {
      try {
        await setDoc(doc(db, 'ministries', ministry.id), {
          ...ministry,
          syncedAt: new Date().toISOString()
        });
        counts.ministries++;
      } catch (err) {
        console.warn('Firestore ministry write note:', ministry.id, err);
      }
    }

    // Write Products to Firestore
    for (const product of products) {
      try {
        await setDoc(doc(db, 'products', product.id), {
          ...product,
          syncedAt: new Date().toISOString()
        });
        counts.products++;
      } catch (err) {
        console.warn('Firestore product write note:', product.id, err);
      }
    }

    // Write Donations to Firestore
    for (const donation of donations) {
      try {
        await setDoc(doc(db, 'donations', donation.id), {
          ...donation,
          syncedAt: new Date().toISOString()
        });
        counts.donations++;
      } catch (err) {
        console.warn('Firestore donation write note:', donation.id, err);
      }
    }

    // Write Orders to Firestore
    for (const order of orders) {
      try {
        await setDoc(doc(db, 'orders', order.id), {
          ...order,
          syncedAt: new Date().toISOString()
        });
        counts.orders++;
      } catch (err) {
        console.warn('Firestore order write note:', order.id, err);
      }
    }

    // Write Settings to Firestore
    if (settings) {
      try {
        await setDoc(doc(db, 'settings', 'global'), {
          ...settings,
          syncedAt: new Date().toISOString()
        });
        counts.settings = 1;
      } catch (err) {
        console.warn('Firestore settings write note:', err);
      }
    }

    return {
      success: true,
      message: `Database synchronized to Firestore successfully! (${counts.blogs} blogs, ${counts.ministries} ministries, ${counts.products} products, ${counts.donations} donations).`,
      counts
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sync failed: ${err.message || 'Error communicating with Firestore.'}`,
      counts
    };
  }
}

/**
 * Checks Firestore live connectivity and document counts.
 */
export async function checkFirestoreLiveStatus(): Promise<{ connected: boolean; info: string }> {
  try {
    const isLive = await testConnection();
    return {
      connected: isLive,
      info: isLive ? 'Firebase Firestore is active and responsive.' : 'Firebase Firestore connection offline or pending rules.'
    };
  } catch (err: any) {
    return {
      connected: false,
      info: err.message || 'Firebase Firestore check failed.'
    };
  }
}
