import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTrash } from 'react-icons/fa';

const CartScreen = () => {
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <p className="text-xl mb-4">Your cart forms an empty sea...</p>
                    <Link to="/" className="glass-button px-6 py-2 rounded-full inline-block">Go catch some prawns!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product} className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <img src={item.imageUrl || item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                                <div className="flex-1 text-center sm:text-left">
                                    <Link to={`/product/${item.product}`} className="text-xl font-bold hover:text-accent">
                                        {item.name}
                                    </Link>
                                    <div className="text-lg mt-1 font-semibold">₹{item.price}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={item.quantity}
                                        onChange={(e) => addToCart(item, Number(e.target.value))}
                                        className="glass-input rounded-md p-2 text-white bg-transparent outline-none cursor-pointer"
                                    >
                                        {[...Array(10).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1} className="text-black">
                                                {x + 1} kg
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        className="text-red-400 hover:text-red-300 p-2 transition"
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card p-6 h-fit sticky top-24">
                        <h2 className="text-2xl font-bold mb-4 border-b border-white/20 pb-4">Order Summary</h2>
                        <div className="space-y-4 text-lg">
                            <div className="flex justify-between">
                                <span>Total Items:</span>
                                <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} kg</span>
                            </div>
                            <div className="flex justify-between font-bold text-2xl border-t border-white/20 pt-4 mt-4">
                                <span>Subtotal:</span>
                                <span>₹{cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0)}</span>
                            </div>
                        </div>
                        <button
                            onClick={checkoutHandler}
                            className="w-full mt-8 glass-button py-3 rounded-lg font-bold text-xl uppercase tracking-wider"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
