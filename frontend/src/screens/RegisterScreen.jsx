import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Replicate identical logic as LoginScreen to handle Google OAuth callback redirects
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            alert('Google Sign Up Failed: ' + error);
        }

        if (token) {
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
                    alert('Failed to retrieve user profile after Google signup');
                }
            };
            fetchUserProfile();
        }
    }, [location, login, navigate]);

    useEffect(() => {
        // Redirect if already logged in natively
        if (user && !location.search.includes('token')) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate, location.search]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            login(data);
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    const googleSignupHandler = () => {
        // The backend handles user creation automatically during oauth flow
        window.location.href = 'https://fresh-prowns.onrender.com/api/auth/google';
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-black pt-32 pb-24 relative overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="w-full max-w-md relative z-10 px-6">

                <div className="mb-10 w-full">
                    <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#666] block mb-2 uppercase font-mono text-center">
                        (Authentication)
                    </span>
                    <h2 className="text-[40px] md:text-[50px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase text-center" style={{ fontWeight: 900 }}>
                        SIGN UP
                    </h2>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-10 relative overflow-hidden">
                    {/* Inner Noise */}
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <form onSubmit={submitHandler} className="space-y-6 relative z-10 w-full flex flex-col items-center">
                        <div className="w-full">
                            <label className="block text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300"
                                placeholder="Enter full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full py-[16px] mt-4 rounded-[4px] font-[800] text-[13px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#eaeaea] text-[#111] hover:bg-white pb-3 pt-3">
                            REGISTER
                        </button>
                    </form>

                    <div className="my-8 flex items-center before:flex-1 before:border-t before:border-[#222] after:flex-1 after:border-t after:border-[#222] relative z-10">
                        <p className="mx-4 mb-0 text-center font-[600] tracking-widest text-[#555] text-[11px] uppercase font-mono">OR</p>
                    </div>

                    <button
                        onClick={googleSignupHandler}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 bg-[#111] border border-[#333] hover:border-white/30 text-white/90 py-3 rounded-[4px] font-[600] text-[12px] uppercase tracking-wider transition duration-300 relative z-10"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        Sign Up with Google
                    </button>

                    <div className="mt-8 text-center text-[#777] text-[12px] relative z-10 font-[500]">
                        Already have an account? <Link to="/login" className="font-[700] text-[#ccc] hover:text-white transition-colors tracking-wide ml-1">Login Here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
