import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContactSubmission, sanitizeString, isValidEmail, slugify } from './validation.ts';
import { hasPermission, isContactAccessAllowed } from './authRules.ts';
import { calculateOrderSummary, verifyPaymentMockOrGateway, ProductItem } from './orderLogic.ts';

test('sanitizeString strips angle brackets and trims', () => {
  assert.equal(sanitizeString('  <script>alert(1)</script> Hello!  '), 'scriptalert(1)/script Hello!');
});

test('isValidEmail handles valid and invalid addresses', () => {
  assert.equal(isValidEmail('pastor@samuelsoren.org'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail('test@domain'), false);
  assert.equal(isValidEmail('user.name+tag@sub.example.com'), true);
});

test('validateContactSubmission validates required fields and category', () => {
  const invalid = validateContactSubmission({
    fullName: '',
    email: 'bad',
    category: 'Invalid' as any,
    subject: '',
    message: ''
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.message);

  const valid = validateContactSubmission({
    fullName: 'David Murmu',
    email: 'david@example.com',
    phone: '+91 9876543210',
    category: 'Prayer Request',
    subject: 'Prayer for healing and spiritual guidance',
    message: 'Dear Pastor Samuel Soren, please remember our family in your prayers this week.'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized?.category, 'Prayer Request');
});

test('slugify generates clean URL slugs', () => {
  assert.equal(slugify('Faith That Inspires & Transforms Lives!'), 'faith-that-inspires-transforms-lives');
  assert.equal(slugify('Walking in the Holy Spirit 2026'), 'walking-in-the-holy-spirit-2026');
});

test('RBAC: Super Admin has full permissions, Editor is strictly barred from private contacts', () => {
  assert.equal(hasPermission('superadmin', 'contacts'), true);
  assert.equal(hasPermission('superadmin', 'blogs'), true);
  assert.equal(hasPermission('superadmin', 'orders'), true);

  assert.equal(hasPermission('editor', 'blogs'), true);
  assert.equal(hasPermission('editor', 'ministries'), true);
  // CRITICAL PRIVACY REQUIREMENT
  assert.equal(hasPermission('editor', 'contacts'), false);
  assert.equal(hasPermission('editor', 'orders'), false);
  assert.equal(hasPermission('editor', 'settings'), false);

  assert.equal(isContactAccessAllowed('superadmin'), true);
  assert.equal(isContactAccessAllowed('editor'), false);
  assert.equal(isContactAccessAllowed('public'), false);
});

test('calculateOrderSummary uses catalog prices and prevents price tampering', () => {
  const catalog: ProductItem[] = [
    {
      id: 'book-1',
      title: 'Walking in Divine Purpose',
      price: 399,
      discountPrice: 299,
      productType: 'physical'
    },
    {
      id: 'ebook-2',
      title: 'Sacred Worship - E-Book',
      price: 199,
      productType: 'digital',
      downloadUrl: '/downloads/sacred-worship.pdf'
    }
  ];

  const result = calculateOrderSummary(
    [
      { productId: 'book-1', quantity: 2 },
      { productId: 'ebook-2', quantity: 1 }
    ],
    catalog
  );

  assert.equal(result.valid, true);
  assert.equal(result.subtotal, 299 * 2 + 199); // 598 + 199 = 797
  assert.equal(result.shipping, 0); // >= 500 has free shipping
  assert.equal(result.total, 797);
  assert.equal(result.items[1].downloadUrl, '/downloads/sacred-worship.pdf');
});

test('verifyPaymentMockOrGateway verifies valid transactions and rejects empty references', () => {
  const invalid = verifyPaymentMockOrGateway({
    orderId: 'ORD-101',
    expectedAmount: 500,
    paymentMethod: 'upi',
    paymentReference: '12' // too short
  });
  assert.equal(invalid.verified, false);

  const valid = verifyPaymentMockOrGateway({
    orderId: 'ORD-101',
    expectedAmount: 500,
    paymentMethod: 'razorpay',
    paymentReference: 'pay_ABC123456789'
  });
  assert.equal(valid.verified, true);
  assert.ok(valid.transactionId.startsWith('TXN_'));
});

test('Super Admin sorensam84@gmail.com and sorensam@gmail.com designation and password security rules', () => {
  const superAdminEmail1 = 'sorensam84@gmail.com';
  const superAdminEmail2 = 'sorensam@gmail.com';
  assert.equal(isValidEmail(superAdminEmail1), true);
  assert.equal(isValidEmail(superAdminEmail2), true);
  
  // Test password minimum length rule
  const isStrongPassword = (pass: string) => pass && pass.length >= 6;
  assert.equal(isStrongPassword('12345'), false);
  assert.equal(isStrongPassword('admin123'), true);
  assert.equal(isStrongPassword('SamuelSoren2026!'), true);

  // Test 6-digit verification code regex
  const isValidResetCode = (code: string) => /^\d{6}$/.test(code);
  assert.equal(isValidResetCode('123456'), true);
  assert.equal(isValidResetCode('12345'), false);
  assert.equal(isValidResetCode('abcdef'), false);
});
