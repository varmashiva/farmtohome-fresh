import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { CartContext } from './CartContext';
import { reconnectSocket } from './SocketContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { fetchCart, clearCart } = useContext(CartContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfoString = localStorage.getItem('userInfo');

        if (token && !userInfoString) {
            // Edge case: Token exists but user info missing (e.g. from /auth-success)
            // Fetch it
            api.get('/auth/me').then(({ data }) => {
                setUser(data);
                localStorage.setItem('userInfo', JSON.stringify(data));

                reconnectSocket(token);

                // Load user's cloud cart immediately after profile validation
                fetchCart();

            }).catch(() => {
                localStorage.removeItem('token');
                setUser(null);
                reconnectSocket(null);
            });
        } else if (userInfoString) {
            setUser(JSON.parse(userInfoString));
            reconnectSocket(token);
        } else {
            reconnectSocket(null);
        }
    }, []);

    const login = async (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
            reconnectSocket(userData.token);
            // We trigger a network call instantly loading DB profile
            fetchCart();
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        reconnectSocket(null);
        clearCart();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
