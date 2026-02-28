import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { SocketContext } from './SocketContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { socket } = useContext(SocketContext);

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCartItems([]);
            return;
        }

        try {
            const { data } = await api.get('/cart');
            setCartItems(data.items || []);
        } catch (error) {
            console.error('Failed to fetch user cart from DB:', error);
            setCartItems([]);
        }
    }, []);

    // Live stock update listener for items inside the cart
    useEffect(() => {
        if (!socket) return;

        const handleStockUpdate = async (data) => {
            // 1️⃣ Instant UI update (optimistic)
            setCartItems(prevItems =>
                prevItems.map(item => {
                    const itemProductId =
                        typeof item.product === "object"
                            ? item.product._id
                            : item.product;

                    if (String(itemProductId) !== String(data.productId)) {
                        return item;
                    }

                    // Whole product out of stock
                    if (data.overallStockStatus === "outOfStock") {
                        return {
                            ...item,
                            stockStatus: "outOfStock",
                            overallStockStatus: "outOfStock"
                        };
                    }

                    // Specific size update
                    if (String(item.size) === String(data.size)) {
                        return {
                            ...item,
                            stockStatus: data.stockStatus,
                            overallStockStatus: data.overallStockStatus
                        };
                    }

                    // Product back in stock (reset overall flag)
                    return {
                        ...item,
                        overallStockStatus: data.overallStockStatus
                    };
                })
            );

            // 2️⃣ Ensure backend truth (prevents stale state bug)
            await fetchCart();
        };

        socket.on("sizeStockUpdated", handleStockUpdate);

        return () => {
            socket.off("sizeStockUpdated", handleStockUpdate);
        };
    }, [socket, fetchCart]);


    // Load cart on initial render
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (product, selectedSize, price, qty) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to add items to your cart.');
            return;
        }
        try {
            const payload = {
                product: product._id,
                name: product.name,
                image: product.images?.[0]?.url || product.image,
                size: selectedSize,
                price: price,
                quantity: qty
            };
            const { data } = await api.post('/cart/add', payload);
            setCartItems(data?.items || []);
        } catch (error) {
            console.error('Failed to add item to cloud cart:', error);
        }
    };

    const updateCartQty = async (productId, selectedSize, newQty) => {
        if (newQty <= 0) {
            await removeFromCart(productId, selectedSize);
            return;
        }
        try {
            const { data } = await api.put('/cart/update', {
                product: productId,
                size: selectedSize,
                quantity: newQty
            });
            setCartItems(data?.items || []);
        } catch (error) {
            console.error('Failed to update cloud cart qty:', error);
        }
    };

    const removeFromCart = async (productId, selectedSize) => {
        try {
            const { data } = await api.delete('/cart/remove', {
                data: { product: productId, size: selectedSize }
            });
            setCartItems(data?.items || []);
        } catch (error) {
            console.error('Failed to remove item from cloud cart:', error);
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart/clear');
            setCartItems([]);
        } catch (error) {
            console.error('Failed to clear cloud cart:', error);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, fetchCart, updateCartQty }}>
            {children}
        </CartContext.Provider>
    );
};
