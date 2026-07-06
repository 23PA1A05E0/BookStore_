import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  const addToCart = (book, format = "Paperback", price = book.price) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.book._id === book._id && item.format === format);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.book._id === book._id && item.format === format ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { book, quantity: 1, format, price }];
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (bookId, format) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => !(item.book._id === bookId && item.format === format));
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (bookId, format, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) => {
      const newCart = prev.map((item) =>
        item.book._id === bookId && item.format === format ? { ...item, quantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const cartTotal = cartItems.reduce((total, item) => total + ((item.price || item.book.price) * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
