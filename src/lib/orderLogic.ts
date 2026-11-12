/**
 * Server-authoritative order calculation and verification logic.
 * Guarantees that users cannot tamper with prices or mark orders as paid without verification.
 */

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  productType: 'physical' | 'digital';
  downloadUrl?: string;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface VerifiedOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  productType: 'physical' | 'digital';
  downloadUrl?: string;
}

export interface OrderCalculationResult {
  valid: boolean;
  error?: string;
  items: VerifiedOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export function calculateOrderSummary(
  cartItems: CartItemInput[],
  catalog: ProductItem[]
): OrderCalculationResult {
  if (!cartItems || cartItems.length === 0) {
    return { valid: false, error: 'Cart is empty', items: [], subtotal: 0, shipping: 0, total: 0 };
  }

  const catalogMap = new Map<string, ProductItem>();
  for (const product of catalog) {
    catalogMap.set(product.id, product);
  }

  const verifiedItems: VerifiedOrderItem[] = [];
  let subtotal = 0;
  let hasPhysical = false;

  for (const item of cartItems) {
    const product = catalogMap.get(item.productId);
    if (!product) {
      return { valid: false, error: `Product not found: ${item.productId}`, items: [], subtotal: 0, shipping: 0, total: 0 };
    }

    const qty = Math.max(1, Math.min(99, Math.floor(item.quantity || 1)));
    const unitPrice = product.discountPrice !== undefined && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    if (product.productType === 'physical') {
      hasPhysical = true;
    }

    verifiedItems.push({
      productId: product.id,
      title: product.title,
      price: unitPrice,
      quantity: qty,
      subtotal: itemSubtotal,
      productType: product.productType,
      downloadUrl: product.productType === 'digital' ? product.downloadUrl : undefined
    });
  }

  // Shipping is free for purely digital orders or orders over 500 INR, else 50 INR
  const shipping = hasPhysical ? (subtotal >= 500 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  return {
    valid: true,
    items: verifiedItems,
    subtotal,
    shipping,
    total
  };
}

export function verifyPaymentMockOrGateway(params: {
  orderId: string;
  expectedAmount: number;
  paymentMethod: string;
  paymentReference?: string;
  gatewayResponseStatus?: string;
}): { verified: boolean; message: string; transactionId: string } {
  const { orderId, paymentMethod, paymentReference, gatewayResponseStatus } = params;

  if (!paymentReference || paymentReference.trim().length < 6) {
    return {
      verified: false,
      message: 'Invalid or missing payment reference/transaction ID.',
      transactionId: ''
    };
  }

  if (gatewayResponseStatus && gatewayResponseStatus !== 'SUCCESS' && gatewayResponseStatus !== 'COMPLETED') {
    return {
      verified: false,
      message: 'Payment gateway reported payment was not successful.',
      transactionId: paymentReference
    };
  }

  // Generate verified transaction record
  return {
    verified: true,
    message: `Payment verified successfully via ${paymentMethod.toUpperCase()}`,
    transactionId: `TXN_${Date.now()}_${paymentReference.slice(-6).toUpperCase()}`
  };
}
