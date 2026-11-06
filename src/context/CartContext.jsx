import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "stanart_cart_v1";

const CartContext = createContext(null);

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors (private browsing, full storage, etc.).
    }
  }, [items]);

  const addItem = useCallback((artwork) => {
    setItems((current) => {
      if (current.some((item) => item.id === artwork.id)) {
        return current;
      }

      return [
        ...current,
        {
          id: artwork.id,
          title: artwork.title,
          price: artwork.price,
          imageUrl: artwork.imageUrl,
          year: artwork.year,
          category: artwork.category,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const total = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0,
    );

    return {
      items,
      count: items.length,
      total,
      addItem,
      removeItem,
      clearCart,
    };
  }, [items, addItem, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider.");
  }

  return context;
}
