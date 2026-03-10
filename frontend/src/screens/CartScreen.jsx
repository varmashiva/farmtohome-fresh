import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTrash } from 'react-icons/fa';

const CartScreen = () => {
    const { cartItems, updateCartQty, removeFromCart, fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    const formatQty = (q) => {
        if (q === 0.5) return '500g';
        if (q % 1 !== 0) return `${Math.floor(q)}.5 kg`;
        return `${q} kg`;
    };

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
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">

                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] md:text-[12px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8 md:mb-12 hover:text-white transition-colors duration-300">
                    <span className="text-[16px] leading-none -mt-[2px]">&larr;</span> CONTINUE BROWSING
                </Link>

                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                            (Your Cart)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start">
                        <h1 className="text-[45px] md:text-[70px] lg:text-[100px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            SHOPPING<br />CART
                        </h1>
                        {hasOutOfStockItem && (
                            <div className="mt-8 inline-block px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px] text-[12px] font-[700] uppercase tracking-widest">
                                Some items are currently sold out. Please remove them.
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="w-full py-24 flex flex-col items-center justify-center border border-[#1a1a1a] border-dashed rounded-[16px] bg-[#0c0c0c] relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                        <p className="text-[18px] md:text-[24px] font-[600] tracking-tight text-[#888] mb-8 relative z-10">Your basket forms an empty sea...</p>
                        <Link to="/product/69a6619514974541e40c97ae" className="relative z-10 px-8 py-4 bg-[#eaeaea] text-[#111] font-[800] text-[13px] uppercase tracking-[0.1em] rounded-[4px] hover:bg-white transition-all duration-300">
                            CATCH SOME PROWNS
                        </Link>
                    </div>
                ) : (
                    <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20">
                        {/* Cart Items List */}
                        <div className="w-full lg:w-[65%] flex flex-col gap-6">
                            {cartItems.map((item) => {
                                const isOutOfStock = item.stockStatus === 'outOfStock' || item.overallStockStatus === 'outOfStock';

                                return (
                                    <div key={`${item.product}_${item.size}`} className={`bg-[#0c0c0c] border rounded-[12px] p-4 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 relative overflow-hidden ${isOutOfStock ? 'border-red-500/30 opacity-60 grayscale' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
                                        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                                        <div className="relative z-10 flex items-center gap-6 w-full sm:w-auto">
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#111] rounded-[8px] overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <Link to={`/product/${item.product}`} className="text-[20px] md:text-[24px] font-[800] tracking-tighter text-[#eaeaea] hover:text-white transition-colors leading-none uppercase">
                                                    {item.name}
                                                </Link>
                                                <span className="text-[11px] font-[600] tracking-widest text-[#777] uppercase font-mono mt-2 mb-3 block">
                                                    Size: {item.size}
                                                </span>
                                                <div className="text-[20px] md:text-[24px] font-[700] tracking-tight text-white/90 font-mono">
                                                    ₹{item.price} <span className="text-[12px] text-[#555] tracking-widest uppercase ml-1">/kg</span>
                                                </div>
                                                {isOutOfStock && (
                                                    <span className="inline-block mt-3 text-[10px] font-[800] bg-red-500/10 text-red-500 px-3 py-1.5 rounded-[4px] uppercase tracking-widest border border-red-500/20 w-fit">
                                                        Sold Out
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex sm:flex-col items-center justify-between sm:justify-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#222]">
                                            <select
                                                value={item.quantity}
                                                disabled={isOutOfStock}
                                                onChange={(e) => updateCartQty(item.product, item.size, Number(e.target.value))}
                                                className={`bg-[#111] border border-[#333] rounded-[4px] px-4 py-2 text-white text-[13px] font-[600] uppercase tracking-wider focus:outline-none focus:border-white/50 ${isOutOfStock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                            >
                                                {Array.from({ length: 20 }).map((_, i) => {
                                                    const val = (i + 1) * 0.5;
                                                    return (
                                                        <option key={val} value={val}>
                                                            {formatQty(val)}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <button
                                                onClick={() => removeFromCart(item.product, item.size)}
                                                className="text-[#555] hover:text-red-500 transition-colors p-2 flex items-center gap-2"
                                                title="Remove item"
                                            >
                                                <FaTrash size={16} />
                                                <span className="sm:hidden text-[11px] font-[600] tracking-widest uppercase font-mono">Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="w-full lg:w-[35%]">
                            <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-10 sticky top-[120px] relative overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                                <div className="relative z-10 flex flex-col">
                                    <h2 className="text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6">Payment Info</h2>

                                    <div className="space-y-6 mb-8">
                                        <div className="flex justify-between items-center text-[13px] font-[600] text-[#888] tracking-wider uppercase font-mono">
                                            <span>Total Weight:</span>
                                            <span className="text-white">{formatQty(cartItems.reduce((acc, item) => acc + item.quantity, 0))}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-[#222] pt-6 mt-6">
                                            <span className="text-[14px] font-[700] tracking-widest uppercase text-[#888]">Order Amount:</span>
                                            <span className="font-[800] text-[32px] tracking-tighter leading-none text-white font-mono">
                                                ₹{cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={checkoutHandler}
                                        className={`w-full py-[18px] rounded-[4px] font-[800] text-[13px] uppercase tracking-[0.1em] transition-all duration-300 mt-2 flex justify-center items-center ${hasOutOfStockItem ? 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#333]' : 'bg-[#eaeaea] text-[#111] hover:bg-white'}`}
                                    >
                                        PROCEED TO CHECKOUT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartScreen;
