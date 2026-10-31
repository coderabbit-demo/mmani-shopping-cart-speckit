import type { Product } from "./catalog";
import type { CartLine, Order, StoreState } from "./store";

export const STORAGE_KEY = "deskdrop-demo-v1";
export const MAX_STORED_LENGTH = 200_000;

type Domain = {
  initialState: () => StoreState;
  clampQuantity: (value: unknown) => number;
  totals: (state: StoreState) => { subtotal: number };
};

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && Number(hourText) <= 23 && Number(minuteText) <= 59 && Number(secondText) <= 59
    && (zone === "Z" || (Number(zone.slice(1, 3)) <= 23 && Number(zone.slice(4, 6)) <= 59));
}

function parseOrder(value: unknown): Order | null {
  if (!isRecord(value) || typeof value.id !== "string" || !/^DD-\d{6}$/.test(value.id)
      || !isoDate(value.placedAt) || (value.delivery !== "standard" && value.delivery !== "express")
      || (value.coupon !== null && value.coupon !== "DESK15") || !isRecord(value.shipping)
      || !finite(value.subtotal) || !finite(value.discount) || !finite(value.deliveryFee) || !finite(value.total)
      || !Array.isArray(value.items) || value.items.length === 0) return null;

  const { fullName, email, address, city, postalCode } = value.shipping;
  if ([fullName, email, address, city, postalCode].some((field) => typeof field !== "string")) return null;
  const items: Order["items"] = [];
  for (const item of value.items) {
    if (!isRecord(item) || typeof item.productId !== "string" || typeof item.name !== "string"
        || typeof item.color !== "string" || !finite(item.quantity) || !Number.isInteger(item.quantity)
        || item.quantity < 1 || item.quantity > 10 || !finite(item.unitPrice) || !finite(item.lineTotal)) return null;
    items.push({ productId: item.productId, name: item.name, color: item.color, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal });
  }
  return {
    id: value.id, placedAt: value.placedAt, items, delivery: value.delivery, coupon: value.coupon,
    subtotal: value.subtotal, discount: value.discount, deliveryFee: value.deliveryFee, total: value.total,
    shipping: { fullName: fullName as string, email: email as string, address: address as string, city: city as string, postalCode: postalCode as string },
  };
}

export function serialize(state: StoreState): string {
  return JSON.stringify({ version: 1, state: { ...state, couponNotice: null } });
}

export function parseStored(raw: unknown, products: Product[], domain: Domain): StoreState {
  try {
    if (typeof raw !== "string" || raw.length > MAX_STORED_LENGTH) return domain.initialState();
    const snapshot: unknown = JSON.parse(raw);
    if (!isRecord(snapshot) || snapshot.version !== 1 || !isRecord(snapshot.state)) return domain.initialState();
    const source = snapshot.state;
    const state = domain.initialState();
    const catalog = new Map(products.map((product) => [product.id, product]));
    const cart: CartLine[] = [];
    if (Array.isArray(source.cart)) {
      for (const line of source.cart) {
        if (!isRecord(line) || typeof line.productId !== "string" || typeof line.color !== "string" || !finite(line.quantity)) continue;
        const product = catalog.get(line.productId);
        if (!product || !product.colors.some((color) => color.name === line.color)) continue;
        const quantity = domain.clampQuantity(line.quantity);
        const existing = cart.find((item) => item.productId === line.productId && item.color === line.color);
        if (existing) existing.quantity = domain.clampQuantity(existing.quantity + quantity);
        else cart.push({ productId: line.productId, color: line.color, quantity, unitPrice: finite(line.unitPrice) && line.unitPrice > 0 ? line.unitPrice : product.price });
      }
    }
    state.cart = cart;
    state.delivery = source.delivery === "express" ? "express" : "standard";
    state.coupon = source.coupon === "DESK15" && domain.totals(state).subtotal >= 100 ? "DESK15" : null;
    state.couponNotice = null;
    state.wishlist = Array.isArray(source.wishlist)
      ? [...new Set(source.wishlist.filter((id): id is string => typeof id === "string" && catalog.has(id)))] : [];
    state.session = isRecord(source.session) && source.session.name === "Alex" && source.session.email === "alex@deskdrop.demo"
      ? { name: "Alex", email: "alex@deskdrop.demo" } : null;
    state.orders = Array.isArray(source.orders)
      ? source.orders.map(parseOrder).filter((order): order is Order => order !== null) : [];
    return state;
  } catch {
    return domain.initialState();
  }
}

export function createStorage(getStorage: () => Storage | undefined): { load: () => string | null; save: (value: string) => void; clear: () => void } {
  let memory: string | null = null;
  let fallback = false;
  let lastStorage: Storage | undefined;
  function access(action: (storage: Storage) => void): void {
    if (fallback) return;
    try {
      const storage = getStorage();
      if (!storage) { fallback = true; return; }
      lastStorage = storage;
      action(storage);
    } catch {
      fallback = true;
    }
  }
  return {
    load() { access((storage) => { memory = storage.getItem(STORAGE_KEY); }); return memory; },
    save(value) { memory = value; access((storage) => { storage.setItem(STORAGE_KEY, value); }); },
    clear() {
      memory = null;
      if (fallback) {
        try { lastStorage?.removeItem(STORAGE_KEY); } catch { }
      } else {
        access((storage) => { storage.removeItem(STORAGE_KEY); });
      }
    },
  };
}
