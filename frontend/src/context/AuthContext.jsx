import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfoString = localStorage.getItem('userInfo');

        if (token && !userInfoString) {
            // Edge case: Token exists but user info missing (e.g. from /auth-success)
            // Fetch it
            api.get('/auth/me').then(({ data }) => {
                setUser(data);
                localStorage.setItem('userInfo', JSON.stringify(data));
            }).catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            });
        } else if (userInfoString) {
            setUser(JSON.parse(userInfoString));
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
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
