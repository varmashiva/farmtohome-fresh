import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (!user.authProvider || user.authProvider === 'local') && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GOOGLE OAUTH 2.0 METHODS ---

import { OAuth2Client } from 'google-auth-library';

// Ensure this is initialized after env variables are loaded
let oAuth2Client;
const getOAuthClient = () => {
    if (!oAuth2Client) {
        oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:5174/api/auth/google/callback'
        );
    }
    return oAuth2Client;
};

// @desc    Redirect to Google OAuth
// @route   GET /api/auth/google
export const googleAuth = (req, res) => {
    const client = getOAuthClient();
    const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        prompt: 'consent'
    });
    res.redirect(authorizeUrl);
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
export const googleCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const client = getOAuthClient();
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: profileImage } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // New User via Google
            const role = email === 'shivavarma336@gmail.com' ? 'admin' : 'customer';
            user = await User.create({
                name,
                email,
                googleId,
                profileImage,
                role,
                authProvider: 'google'
            });
        } else {
            // Existing user - ensure google info is attached
            if (user.authProvider !== 'google') {
                user.googleId = googleId;
                user.authProvider = 'google';
                user.profileImage = profileImage;
                await user.save();
            }
        }

        const token = generateToken(user._id);

        // Redirect back to frontend with the token explicitly
        res.redirect(`http://localhost:5174/auth-success?token=${token}`);

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.redirect('http://localhost:5174/login?error=GoogleAuthFailed');
    }
};

// @desc    Get user profile (via token)
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                token: req.headers.authorization.split(' ')[1] // Pass existing token back
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
