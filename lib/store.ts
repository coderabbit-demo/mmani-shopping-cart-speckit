import type { Product } from "./catalog";

export type CartLine = {
  productId: string;
  color: string;
  quantity: number;
  unitPrice: number;
};

export type Totals = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

export type ShippingDetails = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
};

export type Order = Totals & {
  id: string;
  placedAt: string;
  items: (CartLine & { name: string; lineTotal: number })[];
  delivery: "standard" | "express";
  coupon: "DESK15" | null;
  shipping: ShippingDetails;
};

export type StoreState = {
  cart: CartLine[];
  coupon: "DESK15" | null;
  couponNotice: string | null;
  delivery: "standard" | "express";
  wishlist: string[];
  session: { name: string; email: string } | null;
  orders: Order[];
};

export type Result<T = StoreState> =
  | { ok: true; state: T }
  | { ok: false; state: T; error: string };

export const MAX_QUANTITY = 10;
export const COUPON_CODE = "DESK15";
export const COUPON_MIN_SUBTOTAL = 100;
export const COUPON_RATE = 0.15;
export const EXPRESS_FEE = 12;
/** Fixture-only account for the demo; this is not real authentication. */
export const DEMO_ACCOUNT = {
  name: "Alex",
  email: "alex@deskdrop.demo",
  password: "deskdrop123",
};
export const COUPON_MIN_MESSAGE = "DESK15 needs a subtotal of $100 or more.";
export const COUPON_INVALID_MESSAGE = "That code isn't valid.";
export const COUPON_REMOVED_NOTICE = "DESK15 was removed because your subtotal is below $100.";
export const SIGN_IN_ERROR = "Email or password is incorrect.";
export const EMPTY_CART_ERROR = "Your bag is empty.";
export const INVALID_COLOR_ERROR = "Choose an available color.";
export const OUT_OF_STOCK_ERROR = "This item is out of stock.";

export function initialState(): StoreState {
  return {
    cart: [],
    coupon: null,
    couponNotice: null,
    delivery: "standard",
    wishlist: [],
    session: null,
    orders: [],
  };
}

export function clampQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(value)));
}

export function lineTotal(line: CartLine): number {
  return line.unitPrice * line.quantity;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function totals(state: StoreState): Totals {
  const subtotal = state.cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const discount = state.coupon && subtotal >= COUPON_MIN_SUBTOTAL
    ? roundCents(subtotal * COUPON_RATE)
    : 0;
  const deliveryFee = state.delivery === "express" ? EXPRESS_FEE : 0;
  return { subtotal, discount, deliveryFee, total: roundCents(subtotal - discount + deliveryFee) };
}

function afterCartChange(state: StoreState): StoreState {
  if (state.coupon && totals(state).subtotal < COUPON_MIN_SUBTOTAL) {
    return { ...state, coupon: null, couponNotice: COUPON_REMOVED_NOTICE };
  }
  return state;
}

export function addItem(state: StoreState, product: Product, color: string, quantity: unknown = 1): Result {
  if (!product.colors.some((option) => option.name === color)) {
    return { ok: false, state, error: INVALID_COLOR_ERROR };
  }
  if (!product.inStock) {
    return { ok: false, state, error: OUT_OF_STOCK_ERROR };
  }
  const amount = clampQuantity(quantity);
  const index = state.cart.findIndex((line) => line.productId === product.id && line.color === color);
  const cart = [...state.cart];
  if (index === -1) {
    cart.push({ productId: product.id, color, quantity: amount, unitPrice: product.price });
  } else {
    const line = cart[index];
    cart[index] = { ...line, quantity: clampQuantity(line.quantity + amount) };
  }
  return { ok: true, state: afterCartChange({ ...state, cart }) };
}

export function changeQuantity(state: StoreState, productId: string, color: string, quantity: unknown): StoreState {
  const cart = state.cart.map((line) =>
    line.productId === productId && line.color === color
      ? { ...line, quantity: clampQuantity(quantity) }
      : line,
  );
  return afterCartChange({ ...state, cart });
}

export function removeItem(state: StoreState, productId: string, color: string): StoreState {
  const cart = state.cart.filter((line) => line.productId !== productId || line.color !== color);
  return afterCartChange({ ...state, cart });
}

export function applyCoupon(state: StoreState, code: string): Result {
  const cleared = { ...state, couponNotice: null };
  if (code.trim().toUpperCase() !== COUPON_CODE) {
    return { ok: false, state: cleared, error: COUPON_INVALID_MESSAGE };
  }
  if (totals(state).subtotal < COUPON_MIN_SUBTOTAL) {
    return { ok: false, state: cleared, error: COUPON_MIN_MESSAGE };
  }
  return { ok: true, state: { ...cleared, coupon: COUPON_CODE } };
}

export function removeCoupon(state: StoreState): StoreState {
  return { ...state, coupon: null, couponNotice: null };
}

export function setDelivery(state: StoreState, method: StoreState["delivery"]): StoreState {
  return { ...state, delivery: method };
}

export function placeOrder(
  state: StoreState,
  products: Product[],
  shipping: ShippingDetails,
  { now, orderId }: { now: string; orderId: string },
): Result {
  if (state.cart.length === 0) return { ok: false, state, error: EMPTY_CART_ERROR };
  const items = state.cart.map((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product) throw new Error(`Product not found: ${line.productId}`);
    return { ...line, name: product.name, lineTotal: lineTotal(line) };
  });
  const order: Order = {
    id: orderId,
    placedAt: now,
    items,
    ...totals(state),
    delivery: state.delivery,
    coupon: state.coupon,
    shipping: { ...shipping },
  };
  return {
    ok: true,
    state: {
      ...state,
      orders: [order, ...state.orders],
      cart: [],
      coupon: null,
      couponNotice: null,
      delivery: "standard",
    },
  };
}

export function toggleWishlist(state: StoreState, productId: string): StoreState {
  const wishlist = state.wishlist.includes(productId)
    ? state.wishlist.filter((id) => id !== productId)
    : [...state.wishlist, productId];
  return { ...state, wishlist };
}

export function signIn(state: StoreState, email: string, password: string): Result {
  if (email.trim().toLowerCase() !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
    return { ok: false, state, error: SIGN_IN_ERROR };
  }
  return { ok: true, state: { ...state, session: { name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email } } };
}

export function signOut(state: StoreState): StoreState {
  return { ...state, session: null };
}
