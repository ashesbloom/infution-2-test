// client/src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ keep track of which items are selected in cart (by _id)
  const [selectedIds, setSelectedIds] = useState([]);

  // Load cart from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem('cartItems');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      } catch (err) {
        console.error('Error parsing cartItems from localStorage:', err);
      }
    }
  }, []);

  // Save cart to localStorage when updated
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // ✅ Whenever cart changes, select all items by default
    setSelectedIds(cartItems.map((item) => item._id));
  }, [cartItems]);

  // ✅ Add / update item
  // If item exists → qty is treated as the NEW qty (absolute)
  // If item doesn't exist → qty is initial quantity
  const addToCart = (item, qty = 1) => {
    setCartItems((prev) => {
      const exist = prev.find((x) => x._id === item._id);
      const newQty = Number(qty) || 1;
      const price = Number(item.price) || 0;

      if (exist) {
        return prev.map((x) =>
          x._id === item._id ? { ...x, qty: newQty } : x
        );
      }

      return [...prev, { ...item, qty: newQty, price }];
    });
  };

  // Remove item
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
    // ✅ Also remove from selected if present
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  // Update quantity (direct)
  const updateQty = (id, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, qty: Number(qty) || item.qty }
          : item
      )
    );
  };

  // Clear cart after order
  const clearCart = () => {
    setCartItems([]);
    setSelectedIds([]);
    localStorage.removeItem('cartItems');
  };

  // Sidebar controls
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // ✅ Toggle selection for a single cart item
  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Check if item is selected
  const isItemSelected = (id) => selectedIds.includes(id);

  // ✅ Only selected items (to be used in checkout / place order)
  const selectedItems = cartItems.filter((item) =>
    selectedIds.includes(item._id)
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        selectedIds,
        selectedItems,
        toggleSelectItem,
        isItemSelected,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
