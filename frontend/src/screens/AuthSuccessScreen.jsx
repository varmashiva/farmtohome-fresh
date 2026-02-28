import { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const AuthSuccessScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setError('No authentication token found.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // 1. Store token in localStorage as expressly requested
            localStorage.setItem('token', token);

            try {
                // 2. Fetch user profile using the token explicitly to bypass any interceptor delays
                const { data } = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 3. Update authentication state
                login(data);

                // 4. Redirect based on role
                if (data.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                setError('Failed to securely load user profile.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        fetchUserData();
    }, [location, navigate, login]);

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="glass-card p-10 w-full max-w-md text-center">
                {error ? (
                    <>
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
                        <p>{error}</p>
                        <p className="mt-4 text-sm opacity-70">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-white">Completing Sign In...</h2>
                        <div className="w-12 h-12 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto mt-6"></div>
                        <p className="mt-4 text-sm opacity-70">Securing your session, please wait.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthSuccessScreen;
