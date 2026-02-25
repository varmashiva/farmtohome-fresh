import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/login');
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 p-4">
            <div className="container mx-auto glass-card flex justify-between items-center p-4">
                <Link to="/" className="text-2xl font-bold tracking-wider hover:text-accent transition duration-300">
                    Fresh Prawns
                </Link>

                <nav className="flex items-center space-x-6">
                    <Link to="/cart" className="relative hover:text-accent transition duration-300 flex items-center">
                        <FaShoppingCart className="text-xl" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 hover:text-accent transition duration-300"
                            >
                                <FaUser />
                                <span>{user.name}</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 glass-card transition duration-300 shadow-xl border border-white/20">
                                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 hover:bg-white/10 transition">Profile</Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 hover:bg-white/10 transition">Dashboard</Link>
                                    )}
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 hover:bg-white/10 transition text-red-300">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="glass-button px-6 py-2 rounded-full font-semibold hover:text-accent">
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
