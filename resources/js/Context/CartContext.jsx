import React, { createContext, useState, useEffect } from 'react';

// Create the CartContext
export const CartContext = createContext();

// Create a provider component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from Local Storage on initial render
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    // Function to save cart to Local Storage
    const saveCartToLocalStorage = (cart) => {
        console.log(JSON.stringify(cart))
        localStorage.setItem('cart', JSON.stringify(cart));

    };

    // Add an item to the cart
    const addToCart = (item) => {
        // Check if the item already exists in the cart by product_id
        const existingItemIndex = cart.findIndex(cartItem => cartItem.product_id === item.product_id);
    
        let updatedCart;
        if (existingItemIndex >= 0) {
            // Item exists, update the quantity
            updatedCart = cart.map((cartItem, index) =>
                index === existingItemIndex
                    ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                    : cartItem
            );
        } else {
            // Item does not exist, add it to the cart
            updatedCart = [...cart, item];
        }
    
        // Update state and save updated cart to Local Storage
        setCart(updatedCart);
        saveCartToLocalStorage(updatedCart);
    };
    
    // Remove an item from the cart
    const removeFromCart = (product_id) => {
        // Filter out the item with the matching product_id
        const updatedCart = cart.filter(cartItem => cartItem.product_id !== product_id);
    
        // Update the cart state
        setCart(updatedCart);
    
        // Save updated cart to Local Storage
        saveCartToLocalStorage(updatedCart);
    };
    // Update item quantity in the cart
    const updateCartItemQuantity = (product_id, quantity) => {
        // Ensure quantity is a positive integer
        const updatedQuantity = Math.max(quantity, 1);
    
        // Update the cart by mapping over the items
        const updatedCart = cart.map(item =>
            item.product_id === product_id
                ? { ...item, quantity: updatedQuantity }
                : item
        );
    
        // Update state and save the updated cart to Local Storage
        setCart(updatedCart);
        saveCartToLocalStorage(updatedCart);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
