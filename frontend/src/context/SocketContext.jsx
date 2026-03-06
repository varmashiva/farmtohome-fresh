import React, { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const socket = io('https://fresh-prowns.onrender.com', {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: false // Connect manually on mount to avoid duplicate active listeners
});

// Imperative trigger bypassing Context hierarchies
export const reconnectSocket = (token) => {
    if (socket.auth?.token === token && socket.active) {
        return; // Already connecting or connected with identical token
    }

    socket.disconnect();

    if (token) {
        socket.auth = { token };
    } else {
        socket.auth = {};
    }
    socket.connect();
};

export const SocketProvider = ({ children }) => {
    useEffect(() => {
        // Socket connection is now triggered manually by AuthContext
        // to ensure token synchronization when logging in/out

        socket.on("connect", () => {
            console.log("Socket Connected Globally:", socket.id);
        });

        return () => {
            socket.off("connect");
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
