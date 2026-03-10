import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import fthLogo from '../assets/media/farm to homelll.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 px-10 md:px-16 pt-8 pb-4 animate-fade-in-down pointer-events-none">
            {/* The pointer-events-none on header prevents the transparent space from blocking clicks on the video underneath. 
                We restore pointer-events-auto on the actual links/buttons. */}
            <div className="flex justify-between items-center w-full">

                {/* Left Side: FTH Logo */}
                <Link
                    to="/"
                    className="pointer-events-auto hover:opacity-80 transition-opacity duration-300 drop-shadow-md flex items-center -ml-16 md:ml-0"
                >
                    <img src={fthLogo} alt="Farm to Home" className="h-[90px] md:h-[120px] object-contain" />
                </Link>

                {/* Right Side: CART & MENU */}
                <div className="flex items-center gap-6 md:gap-8 pointer-events-auto">
                    <Link
                        to="/cart"
                        className="text-[16px] md:text-[18px] text-white hover:opacity-70 transition-opacity duration-300 drop-shadow-md flex items-center gap-1.5"
                    >
                        <FaShoppingCart />
                        {cartItems.length > 0 && <span className="text-[12px] opacity-70 shrink-0 font-semibold tracking-[0.1em]">({cartItems.length})</span>}
                    </Link>

                    {/* MENU (and Dropdown) */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-[12px] md:text-[14px] font-semibold tracking-[0.2em] text-white uppercase hover:opacity-70 transition-opacity duration-300 drop-shadow-md"
                        >
                            MENU
                        </button>

                        {/* Minimalist Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-4 w-56 bg-black/90 backdrop-blur-md border border-white/10 p-6 flex flex-col gap-4 text-xs font-semibold tracking-[0.15em] uppercase text-white shadow-2xl origin-top-right animate-fade-in z-50">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-400 transition-colors">Home</Link>

                                {user ? (
                                    <>
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-400 transition-colors">Profile</Link>

                                        {(user.role === 'admin' || ['farmtohome666@gmail.com', 'shivavarma336@gmail.com', 'vinnugollakoti289@gmail.com'].includes(user.email)) && (
                                            <Link
                                                to="/captain"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="hover:text-amber-300 transition-colors text-amber-500"
                                            >
                                                Captain
                                            </Link>
                                        )}

                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-400 transition-colors text-blue-300">Admin</Link>
                                        )}
                                        <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 transition-colors mt-4 pt-4 border-t border-white/10 uppercase tracking-[0.15em]">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-400 transition-colors">
                                        Login
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
