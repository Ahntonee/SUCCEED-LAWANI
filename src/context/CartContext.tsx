import { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id: number, qty: number) => {
    if (qty < 1) { removeFromCart(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setItems([]);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider value={{ items, count, total, addToCart, removeFromCart, updateQty, clearCart, isOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
