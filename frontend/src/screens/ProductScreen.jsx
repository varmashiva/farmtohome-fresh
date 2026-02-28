import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';

const ProductScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('Medium');
    const [mainImageIndex, setMainImageIndex] = useState(0);

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

    const addToCartHandler = () => {
        addToCart(product, selectedSize, currentSizeData.price, qty);
        navigate('/cart');
        window.location.reload();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-block mb-6 hover:text-accent font-semibold flex items-center gap-2">
                <span>&larr;</span> Back to Sea
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                    <div className="glass-card overflow-hidden p-2 rounded-2xl xl:h-[500px] flex items-center justify-center bg-black/20">
                        <img
                            src={product.images?.[mainImageIndex]?.url || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl shadow-lg transition-opacity duration-300"
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
                            {product.images.map((img, idx) => (
                                <button
                                    key={img.publicId || idx}
                                    onClick={() => setMainImageIndex(idx)}
                                    className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${mainImageIndex === idx ? 'border-accent scale-105 shadow-glow' : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-start">
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

                    {!isOverallInStock && (
                        <div className="mb-4 inline-block px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-sm font-bold uppercase tracking-wider">
                            Entirely Out of Stock
                        </div>
                    )}

                    <p className="text-lg opacity-80 mb-6 leading-relaxed transition-all duration-300 min-h-[60px]">{currentSizeData.description}</p>

                    <div className="glass-card p-6 rounded-xl space-y-4">

                        <div className="pb-4 border-b border-white/10">
                            <span className="block text-accent font-bold mb-3 uppercase tracking-wider text-sm">Select Size</span>
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
                                                relative px-6 py-3 rounded-xl font-bold transition-all overflow-hidden border
                                                ${isSelected
                                                    ? 'bg-accent border-accent text-white shadow-[0_0_15px_rgba(69,26,245,0.4)]'
                                                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                                                }
                                                ${isOutOfStock ? 'opacity-40 cursor-not-allowed saturate-0' : ''}
                                            `}
                                        >
                                            <span className="relative z-10">{sizeItem.size}</span>
                                            {isOutOfStock && (
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-40 -translate-y-1/2 rotate-12 z-20 pointer-events-none"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xl border-b border-white/10 pb-4 pt-2">
                            <span>Price:</span>
                            <span className="font-bold text-3xl font-mono text-accent">₹{currentSizeData.price}</span>
                        </div>

                        <div className="flex justify-between items-center text-lg border-b border-white/10 pb-4">
                            <span>Status:</span>
                            <span className={`font-semibold ${isAvailable ? 'text-green-300' : 'text-red-400'}`}>
                                {isAvailable ? 'Freshley Available' : 'Currently Unavailable'}
                            </span>
                        </div>

                        {isAvailable && (
                            <div className="flex justify-between items-center text-lg border-b border-white/10 pb-4">
                                <span>Quantity:</span>
                                <select
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="glass-input rounded-md p-2 w-32 text-white bg-transparent appearance-none text-center outline-none cursor-pointer"
                                >
                                    {[...Array(10).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1} className="text-black">
                                            {x + 1} kg
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={addToCartHandler}
                            disabled={!isAvailable}
                            className="w-full bg-accent hover:bg-accent/80 text-white transition py-4 mt-4 rounded-xl font-bold text-xl uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                        >
                            {isAvailable ? `Add ${selectedSize} to Cart` : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
