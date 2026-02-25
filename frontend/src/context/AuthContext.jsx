import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { hydrateCartFromDB } = useContext(CartContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfoString = localStorage.getItem('userInfo');

        if (token && !userInfoString) {
            // Edge case: Token exists but user info missing (e.g. from /auth-success)
            // Fetch it
            api.get('/auth/me').then(({ data }) => {
                setUser(data);
                localStorage.setItem('userInfo', JSON.stringify(data));

                // Hydrate cart from DB alongside profile fetch
                api.get('/users/cart').then((res) => {
                    hydrateCartFromDB(res.data);
                }).catch(err => console.error(err));

            }).catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            });
        } else if (userInfoString) {
            setUser(JSON.parse(userInfoString));
        }
    }, []);

    const login = async (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
            // We specifically await the cart pull directly after a fresh manual login
            try {
                // Ensure auth headers are passed by waiting for the next tick, or relying on `api.js` interceptor
                const { data } = await api.get('/users/cart', {
                    headers: {
                        Authorization: `Bearer ${userData.token}`
                    }
                });
                hydrateCartFromDB(data);
            } catch (err) {
                console.error("Failed to load user's cloud cart immediately on login:", err);
            }
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
