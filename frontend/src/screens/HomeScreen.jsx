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
            socket.on('priceUpdated', (data) => {
                setProducts((prevProducts) =>
                    prevProducts.map((p) =>
                        p._id === data.productId ? { ...p, sellingPrice: data.newPrice } : p
                    )
                );
            });
        }
        return () => {
            if (socket) socket.off('priceUpdated');
        };
    }, [socket]);

    if (loading) return <div className="text-center text-xl mt-20">Loading fresh prawns...</div>;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8 text-center drop-shadow-md">Fresh Catch of the Day</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div key={product._id} className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300">
                        <Link to={`/product/${product._id}`}>
                            <img src={product.imageUrl || product.image} alt={product.name} className="w-full h-48 object-cover object-center" />
                        </Link>
                        <div className="p-5">
                            <Link to={`/product/${product._id}`}>
                                <h3 className="text-xl font-semibold mb-2 hover:text-accent truncate">{product.name}</h3>
                            </Link>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-2xl font-bold">₹{product.sellingPrice}</span>
                                <span className={`text-sm px-2 py-1 rounded-full ${product.stockStatus === 'inStock' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {product.stockStatus === 'inStock' ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>

                            {product.stockStatus === 'inStock' ? (
                                <div className="mt-4 flex gap-2">
                                    <select
                                        value={getQty(product._id)}
                                        onChange={(e) => handleQtyChange(product._id, Number(e.target.value))}
                                        className="glass-input rounded-md p-2 text-white bg-transparent appearance-none outline-none cursor-pointer w-1/3 text-center"
                                    >
                                        {[...Array(10).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1} className="text-black">
                                                {x + 1} kg
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => addToCart(product, getQty(product._id))}
                                        className="w-2/3 glass-button py-2 rounded-lg font-semibold"
                                    >
                                        Add to Cart
                                    </button>
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
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;
