import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';

const HomeScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);

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
                            <img src={product.image} alt={product.name} className="w-full h-48 object-cover object-center" />
                        </Link>
                        <div className="p-5">
                            <Link to={`/product/${product._id}`}>
                                <h3 className="text-xl font-semibold mb-2 hover:text-accent truncate">{product.name}</h3>
                            </Link>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-2xl font-bold">₹{product.sellingPrice}</span>
                                <span className={`text-sm px-2 py-1 rounded-full ${product.isAvailable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <button
                                onClick={() => addToCart(product, 1)}
                                disabled={!product.isAvailable}
                                className="w-full mt-5 glass-button py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;
