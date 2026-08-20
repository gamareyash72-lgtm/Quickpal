/**
 * Bulletproof localStorage wrapper that prevents QuotaExceededError crashes
 * and handles sanitization of heavy base64 strings and large arrays.
 */

export function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved);
  } catch (err) {
    console.warn(`[safeStorage] Corrupted or inaccessible localStorage for "${key}", using fallback.`, err);
    return fallback;
  }
}

/**
 * Strips huge base64 strings or excess items to keep localStorage payload compact.
 */
function sanitizeForLocalCache(value: any, key?: string): any {
  if (value === null || value === undefined) return value;

  // If storing orders
  if (key === 'qp_orders' && Array.isArray(value)) {
    // Keep max 25 latest orders in local cache (full history is in Firestore)
    return value.slice(0, 25).map(order => {
      if (!order || typeof order !== 'object') return order;
      const sanitized = { ...order };
      // Strip or truncate huge base64 payment proof or delivery photos
      if (typeof sanitized.paymentProofImage === 'string' && sanitized.paymentProofImage.length > 500) {
        sanitized.paymentProofImage = '[stored-in-cloud]';
      }
      if (typeof sanitized.deliveryProofPhoto === 'string' && sanitized.deliveryProofPhoto.length > 500) {
        sanitized.deliveryProofPhoto = '[stored-in-cloud]';
      }
      return sanitized;
    });
  }

  // If storing products
  if (key === 'qp_products' && Array.isArray(value)) {
    return value.map(prod => {
      if (!prod || typeof prod !== 'object') return prod;
      const sanitized = { ...prod };
      if (typeof sanitized.image === 'string' && sanitized.image.startsWith('data:image') && sanitized.image.length > 2000) {
        sanitized.image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
      }
      if (Array.isArray(sanitized.images)) {
        sanitized.images = sanitized.images.filter(img => typeof img === 'string' && (!img.startsWith('data:image') || img.length <= 2000));
      }
      return sanitized;
    });
  }

  // If storing notifications
  if (key === 'qp_notifications' && Array.isArray(value)) {
    return value.slice(0, 30);
  }

  // If storing tickets
  if (key === 'qp_tickets' && Array.isArray(value)) {
    return value.slice(0, 20);
  }

  return value;
}

/**
 * Safely writes to localStorage, handling quota errors by pruning old cache entries.
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const sanitized = sanitizeForLocalCache(value, key);
    const serialized = JSON.stringify(sanitized);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    const isQuotaError = 
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    console.warn(`[safeStorage] Warning while setting "${key}":`, err?.message || err);

    if (isQuotaError) {
      try {
        // Attempt recovery: Clear non-essential cached data
        console.info('[safeStorage] Quota exceeded. Pruning large local caches to free up storage...');
        window.localStorage.removeItem('qp_orders');
        window.localStorage.removeItem('qp_notifications');
        window.localStorage.removeItem('qp_tickets');
        window.localStorage.removeItem('qp_products');

        // Retry with minimal sanitized payload
        const sanitized = sanitizeForLocalCache(value, key);
        // If it's an array, cut it even further to 5 items
        const compact = Array.isArray(sanitized) ? sanitized.slice(0, 5) : sanitized;
        window.localStorage.setItem(key, JSON.stringify(compact));
        return true;
      } catch (recoveryErr) {
        console.warn(`[safeStorage] Could not write "${key}" even after pruning cache. Skipping local cache.`, recoveryErr);
        return false;
      }
    }
    return false;
  }
}
