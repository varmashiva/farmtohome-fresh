import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';

const HomeScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);

    const handleQtyChange = (id, val) => {
        setQuantities(prev => ({ ...prev, [id]: val }));
    };

    const getQty = (id) => quantities[id] || 1;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('sizeStockUpdated', (data) => {
                setProducts((prevProducts) =>
                    prevProducts.map((p) => {
                        if (p._id === data.productId) {
                            return {
                                ...p,
                                overallStockStatus: data.overallStockStatus,
                                sizes: p.sizes.map(s => s.size === data.size ? {
                                    ...s,
                                    price: data.price,
                                    stockStatus: data.stockStatus,
                                    description: data.description
                                } : s)
                            };
                        }
                        return p;
                    })
                );
            });
        }
        return () => {
            if (socket) {
                socket.off('sizeStockUpdated');
            }
        };
    }, [socket]);

    if (loading) return <div className="text-center text-xl mt-20">Loading fresh prawns...</div>;

    // Helper to get a stable display "default" size. For now, we prefer Small size or whatever is index 0.
    const getDefaultSize = (product) => {
        if (!product.sizes || product.sizes.length === 0) return null;
        return product.sizes.find(s => s.size === 'Small') || product.sizes[0];
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8 text-center drop-shadow-md">Fresh Catch of the Day</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => {
                    const defaultSizeInfo = getDefaultSize(product);
                    const isOverallInStock = product.overallStockStatus === 'inStock';
                    const displayPrice = defaultSizeInfo ? defaultSizeInfo.price : 0;
                    const sizeName = defaultSizeInfo ? defaultSizeInfo.size : 'N/A';

                    return (
                        <div key={product._id} className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300">
                            <Link to={`/product/${product._id}`} className="relative block group overflow-hidden">
                                <img
                                    src={product.images?.[0]?.url || product.image}
                                    alt={product.name}
                                    className={`w-full h-48 object-cover object-center transition-opacity duration-500 ${product.images?.length > 1 ? 'group-hover:opacity-0' : ''}`}
                                />
                                {product.images?.length > 1 && (
                                    <img
                                        src={product.images[1].url}
                                        alt={`${product.name} hover`}
                                        className="absolute inset-0 w-full h-48 object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    />
                                )}
                            </Link>
                            <div className="p-5">
                                <Link to={`/product/${product._id}`}>
                                    <h3 className="text-xl font-semibold mb-2 hover:text-accent truncate">{product.name}</h3>
                                </Link>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-2xl font-bold">₹{displayPrice} <span className="text-sm font-normal opacity-50 ml-1">({sizeName})</span></span>
                                    <span className={`text-sm px-2 py-1 rounded-full ${isOverallInStock ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {isOverallInStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>

                                <p className="text-xs text-white/50 mt-3 text-center bg-white/5 rounded-md p-2">
                                    Available in <span className="text-white/80 font-semibold">Small</span> / <span className="text-white/80 font-semibold">Medium</span> / <span className="text-white/80 font-semibold">Large</span>
                                </p>

                                {isOverallInStock ? (
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/product/${product._id}`}
                                            className="w-full text-center glass-button py-2 rounded-lg font-semibold block uppercase tracking-wide text-sm bg-white/5 hover:bg-white/20 transition-all border border-white/20"
                                        >
                                            View Sizes
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full mt-4 glass-button py-2 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                                    >
                                        Out of Stock
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HomeScreen;
