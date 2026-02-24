import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';

const ProductScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);

    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
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
            socket.on('priceUpdated', (data) => {
                if (data.productId === id) {
                    setProduct((prev) => ({ ...prev, sellingPrice: data.newPrice }));
                }
            });
        }
        return () => {
            if (socket) socket.off('priceUpdated');
        };
    }, [socket, id]);

    const addToCartHandler = () => {
        addToCart(product, qty);
        navigate('/cart');
    };

    if (loading) return <div className="text-center mt-20">Loading product...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-block mb-6 hover:text-accent font-semibold flex items-center gap-2">
                <span>&larr;</span> Back to Sea
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass-card overflow-hidden p-2 rounded-2xl">
                    <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-xl" />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                    <p className="text-lg opacity-80 mb-6 leading-relaxed">{product.description}</p>

                    <div className="glass-card p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center text-xl border-b border-white/10 pb-4">
                            <span>Price:</span>
                            <span className="font-bold text-3xl">₹{product.sellingPrice}</span>
                        </div>

                        <div className="flex justify-between items-center text-lg border-b border-white/10 pb-4">
                            <span>Status:</span>
                            <span className={`font-semibold ${product.isAvailable ? 'text-green-300' : 'text-red-400'}`}>
                                {product.isAvailable ? 'Freshley Available' : 'Currently Unavailable'}
                            </span>
                        </div>

                        {product.isAvailable && (
                            <div className="flex justify-between items-center text-lg border-b border-white/10 pb-4">
                                <span>Quantity:</span>
                                <select
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="glass-input rounded-md p-2 text-white bg-transparent appearance-none text-center outline-none cursor-pointer"
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
                            disabled={!product.isAvailable}
                            className="w-full glass-button py-4 mt-4 rounded-xl font-bold text-xl uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
