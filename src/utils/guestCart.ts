/**
 * Guest Cart Utility
 * Manages cart items in localStorage for users who are not logged in.
 * On login, these items are synced to the server and the local guest cart is cleared.
 */

import { CartItem } from "@/redux/slices/cartSlice";

const GUEST_CART_KEY = "guestCart";

// ──────────────────────────────────────────────
// Read / Write / Clear
// ──────────────────────────────────────────────

export function getGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function hasGuestCart(): boolean {
  return getGuestCart().length > 0;
}

// ──────────────────────────────────────────────
// Add / Remove / Update
// ──────────────────────────────────────────────

/**
 * Add a product to the guest cart.
 * If the product already exists, its quantity is incremented.
 * Returns the updated CartItem.
 */
export function addToGuestCart(product: CartItem["product"]): CartItem {
  const items = getGuestCart();
  const existing = items.find((i) => i.product._id === product._id);

  if (existing) {
    existing.quantity += 1;
    saveGuestCart(items);
    return existing;
  }

  // For guest cart items, use product._id as the cart item _id
  const newItem: CartItem = {
    _id: `guest_${product._id}`,
    quantity: 1,
    product,
  };

  items.push(newItem);
  saveGuestCart(items);
  return newItem;
}

/**
 * Remove a product from the guest cart by product ID.
 */
export function removeFromGuestCart(productId: string): void {
  const items = getGuestCart();
  const filtered = items.filter((i) => i.product._id !== productId);
  saveGuestCart(filtered);
}

/**
 * Update the quantity of a product in the guest cart.
 * If quantity becomes 0, the item is removed.
 */
export function updateGuestCartQuantity(
  productId: string,
  newQuantity: number
): CartItem | null {
  const items = getGuestCart();
  const item = items.find((i) => i.product._id === productId);

  if (!item) return null;

  if (newQuantity <= 0) {
    removeFromGuestCart(productId);
    return null;
  }

  item.quantity = newQuantity;
  saveGuestCart(items);
  return item;
}

/**
 * Convert guest cart items to the format expected by the /api/cart/sync endpoint.
 * The sync API expects: { _id: productId, quantity: number }
 */
export function getGuestCartForSync(): { _id: string; quantity: number }[] {
  const items = getGuestCart();
  return items.map((item) => ({
    _id: item.product._id,
    quantity: item.quantity,
  }));
}
