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

    // States for Create Product Form
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        marketPrice: 0,
        margin: 0,
        stockStatus: 'inStock',
        imageUrl: ''
    });

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
            const { data } = await api.put(`/products/${id}/update-price`, {
                marketPrice: Number(marketPrice),
                margin: Number(margin)
            });
            // Replace in local state
            setProducts(products.map(p => p._id === id ? data : p));
            setEditingId(null);

            alert('Price updated successfully! Live price emitted to customers.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update price');
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploadingImage(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await api.post('/upload/product-image', formData, config);
            setNewProduct({ ...newProduct, imageUrl: data.imageUrl });
            setUploadingImage(false);
        } catch (error) {
            console.error(error);
            setUploadingImage(false);
            alert('Image upload failed');
        }
    };

    const submitCreateProductHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/products', newProduct);
            setProducts([...products, data]);
            setShowAddForm(false);
            setNewProduct({ name: '', description: '', marketPrice: 0, margin: 0, stockStatus: 'inStock', imageUrl: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create product');
        }
    };

    const deleteProductHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const toggleStockHandler = async (id) => {
        try {
            const { data } = await api.put(`/products/${id}/out-of-stock`);
            setProducts(products.map(p => p._id === id ? data : p));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle stock status');
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Product & Price Management</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg font-bold transition">
                    {showAddForm ? 'Cancel Creation' : '+ Create Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="glass-card p-6 rounded-2xl mb-8 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
                    <form onSubmit={submitCreateProductHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Product Name</label>
                                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full glass-input rounded-lg p-3 text-white" placeholder="Fresh Tiger Prawns" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <textarea required value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full glass-input rounded-lg p-3 text-white h-24" placeholder="Detailed product description..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-accent">Market Price (₹)</label>
                                    <input required type="number" value={newProduct.marketPrice} onChange={(e) => setNewProduct({ ...newProduct, marketPrice: Number(e.target.value) })} className="w-full glass-input rounded-lg p-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-pink-300">Margin (₹)</label>
                                    <input required type="number" value={newProduct.margin} onChange={(e) => setNewProduct({ ...newProduct, margin: Number(e.target.value) })} className="w-full glass-input rounded-lg p-3 text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Initial Stock Status</label>
                                <select value={newProduct.stockStatus} onChange={(e) => setNewProduct({ ...newProduct, stockStatus: e.target.value })} className="w-full glass-input rounded-lg p-3 text-black">
                                    <option value="inStock">In Stock</option>
                                    <option value="outOfStock">Out of Stock</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-between">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Product Image</label>
                                <input type="file" onChange={uploadFileHandler} className="w-full glass-input rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80" />
                                {uploadingImage && <p className="mt-2 text-sm text-yellow-300 animate-pulse">Uploading to Cloudinary...</p>}
                            </div>

                            <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl border border-white/10 overflow-hidden min-h-[200px]">
                                {newProduct.imageUrl ? (
                                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="opacity-50 text-sm">Image Preview</span>
                                )}
                            </div>

                            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-center">
                                <span className="block text-sm text-green-300 mb-1 tracking-wider uppercase">Calculated Selling Price</span>
                                <span className="text-3xl font-mono font-bold text-green-400">₹{Number(newProduct.marketPrice) + Number(newProduct.margin)}</span>
                            </div>

                            <button type="submit" disabled={uploadingImage || !newProduct.imageUrl} className="w-full bg-accent hover:bg-accent/80 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                Publish Product
                            </button>
                        </div>

                    </form>
                </div>
            )}

            <div className="glass-card rounded-2xl overflow-hidden p-6 py-2">
                {products.map((product) => (
                    <div key={product._id} className="flex flex-col md:flex-row items-center border-b border-white/10 p-4 gap-6 last:border-0 hover:bg-white/5 transition duration-200">
                        <img src={product.imageUrl || product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />

                        <div className="flex-1 w-full text-center md:text-left">
                            <h2 className="text-xl font-bold mb-1">{product.name}</h2>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${product.stockStatus === 'inStock' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {product.stockStatus === 'inStock' ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <button onClick={() => toggleStockHandler(product._id)} className="text-xs uppercase tracking-wider font-bold opacity-70 hover:opacity-100 hover:text-accent underline underline-offset-2">Toggle Stock</button>
                                <button onClick={() => deleteProductHandler(product._id)} className="text-xs uppercase tracking-wider font-bold opacity-70 hover:opacity-100 hover:text-red-400 underline underline-offset-2 ml-2">Delete</button>
                            </div>
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
