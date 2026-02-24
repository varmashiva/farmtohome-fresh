import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    try {
        const user = await User.create({
            name: 'Test Google User',
            email: 'testgoogle@example.com',
            googleId: '123456789',
            authProvider: 'google',
            role: 'customer'
        });
        console.log('User created successfully:', user);
        
        const localUser = await User.create({
            name: 'Local User 2',
            email: 'localuser2@example.com',
            password: 'password123',
            authProvider: 'local',
        });
        console.log('Local user created:', localUser);
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
})
.catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
});
