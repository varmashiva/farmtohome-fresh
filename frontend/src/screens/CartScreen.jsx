import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTrash } from 'react-icons/fa';

const CartScreen = () => {
    const { cartItems, updateCartQty, removeFromCart, fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const hasOutOfStockItem = cartItems.some(
        item => item.stockStatus === 'outOfStock' || item.overallStockStatus === 'outOfStock'
    );

    const checkoutHandler = () => {
        if (hasOutOfStockItem) {
            alert("Some items in your cart are currently out of stock. Please remove unavailable products to continue.");
            return;
        }
        navigate('/login?redirect=checkout/address');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

            {hasOutOfStockItem && (
                <div className="mb-8 p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-100 text-lg font-bold text-center">
                    One or more products are out of stock.
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <p className="text-xl mb-4">Your cart forms an empty sea...</p>
                    <Link to="/" className="glass-button px-6 py-2 rounded-full inline-block">Go catch some prawns!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const isOutOfStock = item.stockStatus === 'outOfStock' || item.overallStockStatus === 'outOfStock';

                            return (
                                <div key={`${item.product}_${item.size}`} className={`glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale border-2 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}`}>
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <Link to={`/product/${item.product}`} className="text-xl font-bold hover:text-accent flex items-center gap-2 justify-center sm:justify-start">
                                            {item.name} <span className="text-sm font-medium text-white/70">({item.size})</span>
                                        </Link>
                                        <div className="text-lg mt-1 font-semibold">₹{item.price}</div>
                                        {isOutOfStock && (
                                            <span className="inline-block mt-2 text-xs font-bold bg-red-500/20 text-red-300 px-3 py-1 rounded-md uppercase tracking-wider border border-red-500">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={item.quantity}
                                            disabled={isOutOfStock}
                                            onChange={(e) => updateCartQty(item.product, item.size, Number(e.target.value))}
                                            className={`glass-input rounded-md p-2 text-white bg-transparent outline-none ${isOutOfStock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            {[...Array(10).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1} className="text-black">
                                                    {x + 1} kg
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => removeFromCart(item.product, item.size)}
                                            className="text-red-400 hover:text-red-300 p-2 transition"
                                            title="Remove item"
                                        >
                                            <FaTrash size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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
                            className={`w-full mt-8 glass-button py-3 rounded-lg font-bold text-xl uppercase tracking-wider transition-all duration-300 ${hasOutOfStockItem ? 'opacity-50 saturate-0 cursor-pointer' : ''}`}
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
