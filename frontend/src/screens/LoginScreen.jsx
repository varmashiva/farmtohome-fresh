import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for token in URL query params (from Google Auth redirect)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            alert('Google Login Failed: ' + error);
        }

        if (token) {
            // Validate token and fetch full user profile to save to context
            const fetchUserProfile = async () => {
                try {
                    const { data } = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    login(data);
                    if (data.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                } catch (err) {
                    alert('Failed to retrieve user profile after Google login');
                }
            };
            fetchUserProfile();
        }
    }, [location, login, navigate]);

    useEffect(() => {
        // Redirect if already logged in natively
        if (user && !location.search.includes('token')) {
            const redirect = new URLSearchParams(location.search).get('redirect');
            if (redirect) {
                navigate(`/${redirect}`);
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate, location.search]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            const redirect = new URLSearchParams(location.search).get('redirect');
            if (redirect) {
                navigate(`/${redirect}`);
            } else if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed');
        }
    };

    const googleLoginHandler = () => {
        window.location.href = 'http://localhost:5005/api/auth/google';
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="glass-card p-10 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg glass-input transition duration-200"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg glass-input transition duration-200"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full glass-button py-3 rounded-lg font-bold text-lg mt-4">
                        Sign In
                    </button>
                </form>

                <div className="my-6 flex items-center before:flex-1 before:border-t before:border-white/30 after:flex-1 after:border-t after:border-white/30">
                    <p className="mx-4 mb-0 text-center font-medium text-white/70 text-sm">OR</p>
                </div>

                <button
                    onClick={googleLoginHandler}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-lg font-bold text-lg transition duration-200 hover:bg-gray-100 shadow-lg"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="mt-6 text-center">
                    New Customer? <Link to="/register" className="font-bold hover:underline">Register Here</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
