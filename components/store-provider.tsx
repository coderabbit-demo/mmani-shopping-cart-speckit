"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { productById, products } from "../lib/catalog";
import * as domain from "../lib/store";

type Store = {
  state: domain.StoreState;
  totals: domain.Totals;
  bagCount: number;
  wishlistCount: number;
  hydrated: boolean;
  addItem: (productId: string, color: string, quantity?: number) => string | null;
  changeQuantity: (productId: string, color: string, quantity: number) => void;
  removeItem: (productId: string, color: string) => void;
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
  setDelivery: (method: domain.StoreState["delivery"]) => void;
  placeOrder: (shipping: domain.ShippingDetails) => { ok: true; order: domain.Order } | { ok: false; error: string };
  toggleWishlist: (productId: string) => void;
  signIn: (email: string, password: string) => string | null;
  signOut: () => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(domain.initialState);
  const current = useRef(state);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  function commit(next: domain.StoreState) { current.current = next; setState(next); }
  function accept(result: domain.Result): string | null {
    commit(result.state);
    return result.ok ? null : result.error;
  }
  const value: Store = {
    state,
    totals: domain.totals(state),
    bagCount: state.cart.reduce((sum, line) => sum + line.quantity, 0),
    wishlistCount: state.wishlist.length,
    hydrated,
    addItem(productId, color, quantity) {
      const product = productById(productId);
      return product ? accept(domain.addItem(current.current, product, color, quantity)) : "Product not found.";
    },
    changeQuantity: (id, color, quantity) => commit(domain.changeQuantity(current.current, id, color, quantity)),
    removeItem: (id, color) => commit(domain.removeItem(current.current, id, color)),
    applyCoupon: (code) => accept(domain.applyCoupon(current.current, code)),
    removeCoupon: () => commit(domain.removeCoupon(current.current)),
    setDelivery: (method) => commit(domain.setDelivery(current.current, method)),
    placeOrder(shipping) {
      const orderId = `DD-${Math.floor(100000 + Math.random() * 900000)}`;
      const result = domain.placeOrder(current.current, products, shipping, { now: new Date().toISOString(), orderId });
      commit(result.state);
      return result.ok ? { ok: true, order: result.state.orders[0] } : { ok: false, error: result.error };
    },
    toggleWishlist: (id) => commit(domain.toggleWishlist(current.current, id)),
    signIn: (email, password) => accept(domain.signIn(current.current, email, password)),
    signOut: () => commit(domain.signOut(current.current)),
    resetAll: () => commit(domain.initialState()),
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}
