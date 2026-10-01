import { StoreProduct, StoreCategory, PurchaseRecord, UserProfile } from '../types/game';

export interface StoreResponse {
  success: boolean;
  products: StoreProduct[];
}

export interface PurchaseResponse {
  success: boolean;
  user: any;
  purchase: PurchaseRecord;
  rewardPlayer?: any;
  error?: string;
}

export async function fetchStoreProducts(category?: StoreCategory): Promise<StoreProduct[]> {
  try {
    const url = category ? `/api/store/products?category=${category}` : '/api/store/products';
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products;
    }
    return [];
  } catch (err) {
    console.error('Failed to load store products:', err);
    return [];
  }
}

export async function purchaseProductOnServer(userId: string, productId: string): Promise<PurchaseResponse> {
  const res = await fetch('/api/store/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productId })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'فشلت عملية الشراء');
  }
  return data;
}

export async function updateUsernameOnServer(userId: string, newUsername: string): Promise<UserProfile> {
  const res = await fetch('/api/profile/update-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newUsername })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'فشل تحديث الاسم');
  }
  return data.user;
}

export async function updateAvatarOnServer(userId: string, avatar: string): Promise<UserProfile> {
  const res = await fetch('/api/profile/update-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, avatar })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'فشل تحديث الصورة');
  }
  return data.user;
}

export async function syncUserProfileFromServer(userIdOrAccountId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/profile/${userIdOrAccountId}`);
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}
