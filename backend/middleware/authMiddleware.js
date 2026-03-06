import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export const captain = (req, res, next) => {
    const captainEmails = ['farmtohome666@gmail.com', 'shivavarma336@gmail.com', 'vinnugollakoti289@gmail.com'];
    if (req.user && (req.user.role === 'admin' || captainEmails.includes(req.user.email))) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a delivery captain' });
    }
};
