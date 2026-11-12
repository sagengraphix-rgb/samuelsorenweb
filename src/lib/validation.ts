/**
 * Pure validation and sanitization logic for Pastor Samuel Soren Ministry Website.
 */

export interface ContactSubmissionInput {
  fullName: string;
  email: string;
  phone?: string;
  category: 'General Inquiry' | 'Prayer Request' | 'Speaking Invitation' | 'Ministry Inquiry' | 'Other';
  subject: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: ContactSubmissionInput;
}

export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // strip potential HTML tags
    .slice(0, 5000); // safety length cap
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

export function validateContactSubmission(input: Partial<ContactSubmissionInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const fullName = sanitizeString(input.fullName || '');
  const email = sanitizeString(input.email || '');
  const phone = sanitizeString(input.phone || '');
  const subject = sanitizeString(input.subject || '');
  const message = sanitizeString(input.message || '');
  const category = input.category as ContactSubmissionInput['category'];

  const allowedCategories: ContactSubmissionInput['category'][] = [
    'General Inquiry',
    'Prayer Request',
    'Speaking Invitation',
    'Ministry Inquiry',
    'Other'
  ];

  if (!fullName || fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters long.';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!subject || subject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters long.';
  }

  if (!message || message.length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  if (!category || !allowedCategories.includes(category)) {
    errors.category = 'Please select a valid inquiry category.';
  }

  if (phone && !/^[+0-9\s\-()]{7,20}$/.test(phone)) {
    errors.phone = 'Please provide a valid phone number (digits and standard formatting).';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    sanitized: {
      fullName,
      email,
      phone,
      category,
      subject,
      message,
    }
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
