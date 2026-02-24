import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const ProductListScreen = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    // States for updating price inline
    const [editingId, setEditingId] = useState(null);
    const [marketPrice, setMarketPrice] = useState(0);
    const [margin, setMargin] = useState(0);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                setProducts(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProducts();
    }, [user, navigate]);

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setMarketPrice(product.marketPrice || 0);
        setMargin(product.margin || 0);
    };

    const calculateSellingPrice = () => {
        return Number(marketPrice) + Number(margin);
    };

    const savePriceHandler = async (id) => {
        try {
            const { data } = await api.put(`/products/update-price/${id}`, {
                marketPrice: Number(marketPrice),
                margin: Number(margin)
            });
            // Replace in local state
            setProducts(products.map(p => p._id === id ? data : p));
            setEditingId(null);

            // We don't need to manually emit socket here directly, 
            // because the backend handles emitting 'priceUpdated' when this API is called
            alert('Price updated successfully! Live price emitted to customers.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update price');
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-6">
            <h1 className="text-3xl font-bold mb-6">Product & Price Management</h1>

            <div className="glass-card rounded-2xl overflow-hidden p-6 py-2">
                {products.map((product) => (
                    <div key={product._id} className="flex flex-col md:flex-row items-center border-b border-white/10 p-4 gap-6 last:border-0 hover:bg-white/5 transition duration-200">
                        <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />

                        <div className="flex-1 w-full text-center md:text-left">
                            <h2 className="text-xl font-bold mb-1">{product.name}</h2>
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${product.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {product.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                        </div>

                        <div className="flex-1 w-full max-w-lg">
                            {editingId === product._id ? (
                                <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl items-center border border-white/10">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs uppercase font-bold text-accent mb-1 block">Market Price (₹)</label>
                                            <input
                                                type="number"
                                                value={marketPrice}
                                                onChange={(e) => setMarketPrice(e.target.value)}
                                                className="w-full p-2 glass-input rounded-md text-black bg-white/90"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase font-bold text-pink-300 mb-1 block">Margin (₹)</label>
                                            <input
                                                type="number"
                                                value={margin}
                                                onChange={(e) => setMargin(e.target.value)}
                                                className="w-full p-2 glass-input rounded-md text-black bg-white/90"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center text-center space-y-4">
                                        <div className="text-green-300">
                                            <span className="text-xs uppercase block font-bold mb-1">New Selling Price</span>
                                            <span className="text-3xl font-bold font-mono">₹{calculateSellingPrice()}</span>
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={() => savePriceHandler(product._id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition flex-1">
                                                Save & Broadcast
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="glass-button px-4 py-2 rounded-lg font-bold">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between xl:justify-end gap-8 bg-black/10 p-4 rounded-xl border border-white/5">
                                    <div className="text-center xl:text-left">
                                        <span className="text-xs uppercase block opacity-70 mb-1">Market Price</span>
                                        <span className="font-mono text-lg">₹{product.marketPrice || 0}</span>
                                    </div>
                                    <div className="text-center xl:text-left">
                                        <span className="text-xs uppercase block text-pink-300 mb-1">Margin</span>
                                        <span className="font-mono text-lg">₹{product.margin || 0}</span>
                                    </div>
                                    <div className="text-center bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                                        <span className="text-xs uppercase block text-green-300 font-bold mb-1">Selling Price</span>
                                        <span className="font-mono text-2xl font-bold text-green-400">₹{product.sellingPrice}</span>
                                    </div>
                                    <button onClick={() => handleEditClick(product)} className="glass-button px-4 py-2 rounded-lg font-bold">
                                        Edit Pricing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListScreen;
