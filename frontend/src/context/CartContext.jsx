import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const items = localStorage.getItem('cartItems');
        if (items) {
            setCartItems(JSON.parse(items));
        }
    }, []);

    // Helper: Push current local items up to the DB if the user is authenticated
    const syncToDB = async (itemsArray) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Background sync, no need to await/block the UI
                api.put('/users/cart', { cartItems: itemsArray });
            } catch (error) {
                console.error('Failed to sync cart to cloud:', error);
            }
        }
    };

    // Called by AuthContext.jsx immediately upon successful login/hydration
    const hydrateCartFromDB = (dbItems) => {
        if (!dbItems || dbItems.length === 0) return;

        // Merge strategy: DB items overwrite local ones if there's a conflict
        const localItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

        // Build a map for easy resolution
        const mergedMap = new Map();
        localItems.forEach(item => mergedMap.set(item.product, item));
        dbItems.forEach(item => mergedMap.set(item.product, item)); // DB overwrites local

        const mergedArray = Array.from(mergedMap.values());
        setCartItems(mergedArray);
        localStorage.setItem('cartItems', JSON.stringify(mergedArray));
        syncToDB(mergedArray); // Save the merged result back up
    };

    const addToCart = (product, qty) => {
        const existItem = cartItems.find((x) => x.product === product._id);
        let newCartItems;

        if (existItem) {
            newCartItems = cartItems.map((x) =>
                x.product === existItem.product ? { ...x, quantity: x.quantity + qty } : x
            );
        } else {
            newCartItems = [...cartItems, {
                name: product.name,
                quantity: qty,
                imageUrl: product.imageUrl || product.image,
                price: product.sellingPrice,
                product: product._id
            }];
        }
        setCartItems(newCartItems);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
        syncToDB(newCartItems);
    };

    const removeFromCart = (id) => {
        const newCartItems = cartItems.filter((x) => x.product !== id);
        setCartItems(newCartItems);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
        syncToDB(newCartItems);
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
        syncToDB([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, hydrateCartFromDB }}>
            {children}
        </CartContext.Provider>
    );
};
