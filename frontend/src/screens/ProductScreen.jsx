import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';

const ProductScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(0.5);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('Medium');
    const [mainImageIndex, setMainImageIndex] = useState(0);

    const formatQty = (q) => {
        if (q === 0.5) return '500g';
        if (q % 1 !== 0) return `${Math.floor(q)} 1/2 kg`;
        return `${q} kg`;
    };

    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);

                // Attempt to auto-select an available size
                if (data.sizes && data.sizes.length > 0) {
                    const availableSize = data.sizes.find(s => s.stockStatus === 'inStock');
                    if (availableSize) {
                        setSelectedSize(availableSize.size);
                    } else {
                        setSelectedSize(data.sizes[0].size); // fallback if all out of stock
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (socket) {
            socket.on('sizeStockUpdated', (data) => {
                if (data.productId === id) {
                    setProduct((prev) => {
                        if (!prev) return prev;
                        const newSizes = prev.sizes.map(s => s.size === data.size ? {
                            ...s,
                            price: data.price,
                            stockStatus: data.stockStatus,
                            description: data.description
                        } : s);

                        // If the currently selected size just went out of stock, try to find another one
                        if (selectedSize === data.size && data.stockStatus === 'outOfStock') {
                            const newAvailable = newSizes.find(s => s.stockStatus === 'inStock' && s.size !== data.size);
                            if (newAvailable) setSelectedSize(newAvailable.size);
                        }

                        return {
                            ...prev,
                            overallStockStatus: data.overallStockStatus,
                            sizes: newSizes
                        };
                    });
                }
            });
        }
        return () => {
            if (socket) {
                socket.off('sizeStockUpdated');
            }
        };
    }, [socket, id, selectedSize]);

    if (loading) return <div className="text-center mt-20">Loading product...</div>;
    if (!product) return <div className="text-center mt-20">Product not found.</div>;

    const currentSizeData = product.sizes?.find(s => s.size === selectedSize) || { price: 0, stockStatus: 'outOfStock', description: 'Description unavailable.' };
    const stockStatus = currentSizeData.stockStatus;
    const isAvailable = stockStatus === 'inStock';
    const isOverallInStock = product.overallStockStatus === 'inStock';

    const addToCartHandler = async () => {
        const success = await addToCart(product, selectedSize, currentSizeData.price, qty);
        if (success) {
            navigate('/cart');
            window.location.reload();
        } else {
            navigate('/login');
        }
    };

    const activeImages = (currentSizeData.images && currentSizeData.images.length > 0) ? currentSizeData.images : (product.images || []);
    // Ensure we don't go out of bounds if selection changes and new activeImages is shorter
    const safeMainImageIndex = mainImageIndex < activeImages.length ? mainImageIndex : 0;

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">

                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] md:text-[12px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8 md:mb-12 hover:text-white transition-colors duration-300">
                    <span className="text-[16px] leading-none -mt-[2px]">&larr;</span> BACK TO COLLECTION
                </Link>

                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                            (Product Details)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left">
                        <h1 className="text-[45px] md:text-[70px] lg:text-[100px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            {product.name}
                        </h1>
                        {!isOverallInStock && (
                            <div className="mt-4 inline-block px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px] text-[11px] font-[700] uppercase tracking-widest">
                                Entirely Sold Out
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                {/* Main Content Split */}
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left: Images */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="w-full aspect-square bg-[#0c0c0c] rounded-[16px] overflow-hidden relative group">
                            <img
                                src={activeImages[safeMainImageIndex]?.url || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </div>

                        {activeImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {activeImages.map((img, idx) => (
                                    <button
                                        key={img.publicId || idx}
                                        onClick={() => setMainImageIndex(idx)}
                                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[8px] overflow-hidden transition-all duration-300 ${safeMainImageIndex === idx ? 'border-2 border-white opacity-100' : 'border border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-12">

                        <div className="mb-10">
                            <p className="text-sm md:text-[18px] text-[#999] font-[400] leading-[1.6] max-w-[600px] min-h-[60px] transition-all duration-300">
                                {currentSizeData.description}
                            </p>
                        </div>

                        {/* Interactive Selection Block */}
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-8 flex flex-col relative overflow-hidden">
                            {/* Inner Noise */}
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <div className="relative z-10">
                                {/* Sizes */}
                                <div className="pb-8 border-b border-[#222]">
                                    <span className="block text-[#777] font-[600] text-[11px] mb-4 uppercase tracking-widest font-mono">Select Size</span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes?.map(sizeItem => {
                                            const isSelected = selectedSize === sizeItem.size;
                                            const isOutOfStock = sizeItem.stockStatus === 'outOfStock';

                                            return (
                                                <button
                                                    key={sizeItem.size}
                                                    onClick={() => !isOutOfStock && setSelectedSize(sizeItem.size)}
                                                    disabled={isOutOfStock}
                                                    className={`
                                                        relative px-5 py-2.5 rounded-[4px] font-[600] text-[13px] tracking-wide transition-all overflow-hidden border
                                                        ${isSelected
                                                            ? 'bg-[#eaeaea] border-[#eaeaea] text-[#111]'
                                                            : 'bg-transparent border-[#333] text-white/70 hover:border-white/50 hover:bg-white/5'
                                                        }
                                                        ${isOutOfStock ? 'opacity-30 cursor-not-allowed saturate-0' : ''}
                                                    `}
                                                >
                                                    <span className="relative z-10">{sizeItem.size}</span>
                                                    {isOutOfStock && (
                                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#eaeaea] opacity-60 -translate-y-1/2 rotate-12 z-20 pointer-events-none"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic Pricing & Status */}
                                <div className="py-6 border-b border-[#222] flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[#777] font-[600] text-[10px] uppercase tracking-widest font-mono mb-1">Price</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-white font-[800] text-[32px] md:text-[40px] tracking-tighter leading-none">₹{currentSizeData.price}</span>
                                            <span className="text-[#777] text-sm font-[600] tracking-wider uppercase">/kg</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[#777] font-[600] text-[10px] uppercase tracking-widest font-mono mb-2">Status</span>
                                        <span className={`text-[12px] font-[600] uppercase tracking-widest px-3 py-1 rounded-[4px] border border-dashed ${isAvailable ? 'text-[#888] border-[#444] bg-[#111]' : 'text-red-500 border-red-500/30 bg-red-500/5'}`}>
                                            {isAvailable ? 'Ship Ready' : 'Sold Out'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 flex flex-col gap-4">
                                    {isAvailable && (
                                        <div className="flex justify-between items-center border border-[#333] rounded-[8px] p-2 bg-black/50">
                                            <span className="text-[#777] font-[600] text-[11px] uppercase tracking-widest pl-3 font-mono">Qty</span>
                                            <select
                                                value={qty}
                                                onChange={(e) => setQty(Number(e.target.value))}
                                                className="bg-[#111] border border-[#333] rounded-[4px] px-4 py-2 text-white text-[14px] font-[500] focus:outline-none focus:border-white/50 cursor-pointer"
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
                                        </div>
                                    )}

                                    <button
                                        onClick={addToCartHandler}
                                        disabled={!isAvailable}
                                        className={`w-full py-[16px] md:py-[20px] rounded-[8px] font-[800] text-[13px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 ${isAvailable ? 'bg-[#dcdcdc] text-[#111] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#333]'} mt-2 flex items-center justify-center gap-2`}
                                    >
                                        <span>{isAvailable ? `Add ${selectedSize} to Cart` : 'Sold Out'}</span>
                                        {isAvailable && (
                                            <>
                                                <span className="opacity-30">|</span>
                                                <span className="font-mono">₹{currentSizeData.price * qty}</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Bulk Order Contact */}
                                    <div className="w-full mt-4 py-4 text-center text-[#888] text-[10px] md:text-[11px] font-semibold tracking-widest uppercase">
                                        <p className="leading-relaxed">
                                            <span className="text-[13px] mr-1.5 inline-block -translate-y-[1px]"></span>
                                            For bulk orders please contact
                                            <a href="tel:+918884143699" className="text-white hover:text-green-400 transition-colors ml-1 whitespace-nowrap">+91 8884143699</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
