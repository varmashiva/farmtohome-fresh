import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const ProductListScreen = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    // States for Create Product Form
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Setup initial sizes state matching requirements
    const defaultSizes = [
        { size: 'Small', price: 0, stockStatus: 'inStock', description: '' },
        { size: 'Medium', price: 0, stockStatus: 'inStock', description: '' },
        { size: 'Large', price: 0, stockStatus: 'inStock', description: '' }
    ];

    const [newProduct, setNewProduct] = useState({
        name: '',
        marketPrice: 0,
        margin: 0,
        images: [],
        sizes: JSON.parse(JSON.stringify(defaultSizes))
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

    const uploadFilesHandler = async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        setUploadingImage(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await api.post('/upload/product-images', formData, config);
            setNewProduct(prev => ({ ...prev, images: [...prev.images, ...data.images] }));
            setUploadingImage(false);
        } catch (error) {
            console.error(error);
            setUploadingImage(false);
            alert('Images upload failed');
        }
    };

    const removeNewImageHandler = (publicId) => {
        setNewProduct(prev => ({
            ...prev,
            images: prev.images.filter(img => img.publicId !== publicId)
        }));
    };

    const handleNewProductSizeChange = (index, field, value) => {
        const updatedSizes = [...newProduct.sizes];
        updatedSizes[index][field] = value;
        setNewProduct({ ...newProduct, sizes: updatedSizes });
    };

    const submitCreateProductHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/products', newProduct);
            setProducts([...products, data]);
            setShowAddForm(false);
            setNewProduct({
                name: '',
                marketPrice: 0,
                margin: 0,
                images: [],
                sizes: JSON.parse(JSON.stringify(defaultSizes))
            });
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

    const appendImagesToProduct = async (productId, e) => {
        const files = e.target.files;
        if (files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            };
            const uploadRes = await api.post('/upload/product-images', formData, config);

            const appendRes = await api.put(`/products/${productId}/add-images`, {
                newImages: uploadRes.data.images
            });

            setProducts(products.map(p => p._id === productId ? appendRes.data : p));
        } catch (error) {
            console.error(error);
            alert('Failed to add images to product');
        }
    };

    const deleteImageFromProduct = async (productId, publicId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const config = { data: { publicId } };
            const { data } = await api.delete(`/products/${productId}/remove-image`, config);
            setProducts(products.map(p => p._id === productId ? data : p));
        } catch (error) {
            console.error(error);
            alert('Failed to delete image');
        }
    };

    const updateSizeHandler = async (productId, sizeName, payload) => {
        try {
            const { data } = await api.put(`/products/${productId}/size`, {
                size: sizeName,
                ...payload
            });
            setProducts(products.map(p => p._id === productId ? data : p));
            if (payload.price !== undefined || payload.description !== undefined) {
                alert(`Details for ${sizeName} updated! Live update emitted.`);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update size');
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-6 pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Product & Options Management</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg font-bold transition">
                    {showAddForm ? 'Cancel Creation' : '+ Create Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="glass-card p-6 rounded-2xl mb-8 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6">Add New Product Details</h2>
                    <form onSubmit={submitCreateProductHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Product Name</label>
                                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full glass-input rounded-lg p-3 text-white" placeholder="Fresh Tiger Prawns" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-accent">Market Price Base (₹)</label>
                                    <input required type="number" value={newProduct.marketPrice} onChange={(e) => setNewProduct({ ...newProduct, marketPrice: Number(e.target.value) })} className="w-full glass-input rounded-lg p-3 text-white" placeholder="Base info only" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-pink-300">Margin Base (₹)</label>
                                    <input required type="number" value={newProduct.margin} onChange={(e) => setNewProduct({ ...newProduct, margin: Number(e.target.value) })} className="w-full glass-input rounded-lg p-3 text-white" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-lg font-bold mb-4 text-accent">Size Configurations</h3>
                                <div className="space-y-4">
                                    {newProduct.sizes.map((sizeConfig, index) => (
                                        <div key={sizeConfig.size} className="bg-white/5 p-4 rounded-lg flex flex-col gap-4">
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <div className="w-24 font-bold text-lg">{sizeConfig.size}</div>
                                                <div className="flex-1">
                                                    <label className="text-xs uppercase opacity-70 mb-1 block">Price (₹)</label>
                                                    <input required type="number" value={sizeConfig.price} onChange={(e) => handleNewProductSizeChange(index, 'price', Number(e.target.value))} className="w-full glass-input rounded p-2" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs uppercase opacity-70 mb-1 block">Initial Stock</label>
                                                    <select value={sizeConfig.stockStatus} onChange={(e) => handleNewProductSizeChange(index, 'stockStatus', e.target.value)} className="w-full glass-input rounded p-2 text-black">
                                                        <option value="inStock">In Stock</option>
                                                        <option value="outOfStock">Out of Stock</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs uppercase opacity-70 mb-1 block">Description</label>
                                                <textarea required value={sizeConfig.description} onChange={(e) => handleNewProductSizeChange(index, 'description', e.target.value)} className="w-full glass-input rounded p-2 text-white h-24" placeholder={`Detailed description for ${sizeConfig.size} prawns...`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-start">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Product Images (Up to 8)</label>
                                <input type="file" multiple onChange={uploadFilesHandler} className="w-full glass-input rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80" />
                                {uploadingImage && <p className="mt-2 text-sm text-yellow-300 animate-pulse">Uploading to Cloudinary...</p>}
                            </div>

                            <div className="flex-1 bg-black/20 rounded-xl border border-white/10 p-4 mb-4 min-h-[200px]">
                                {newProduct.images && newProduct.images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {newProduct.images.map((img, idx) => (
                                            <div key={img.publicId || idx} className="relative group rounded-xl overflow-hidden shadow-lg border border-white/10 h-32">
                                                <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImageHandler(img.publicId)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <span className="opacity-50 text-sm">Image Previews</span>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={uploadingImage || newProduct.images.length === 0} className="w-full bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-auto mt-4">
                                Publish Product with Variants
                            </button>
                        </div>

                    </form>
                </div>
            )}

            <div className="space-y-6">
                {products.map((product) => (
                    <div key={product._id} className="glass-card rounded-2xl overflow-hidden flex flex-col xl:flex-row shadow-xl bg-white/5 border border-white/10">

                        {/* Product Base Info & Images */}
                        <div className="p-6 xl:w-1/3 border-b xl:border-b-0 xl:border-r border-white/10 flex flex-col relative bg-black/20">
                            <h2 className="text-2xl font-bold mb-4 text-center xl:text-left">{product.name}</h2>

                            <div className="flex-1 space-y-4 mb-6">
                                <label className="block text-sm font-semibold text-accent">Image Gallery</label>

                                {product.images && product.images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.images.map((img, idx) => (
                                            <div key={img.publicId || idx} className="relative group rounded-xl overflow-hidden shadow border border-white/10 h-24">
                                                <img src={img.url} alt={`${product.name} ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button
                                                    onClick={() => deleteImageFromProduct(product._id, img.publicId)}
                                                    className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                    title="Remove Image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white/5 rounded-xl text-center text-sm opacity-50 border border-white/10">
                                        No images uploaded. Append some below.
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <label className="block text-xs uppercase opacity-70 font-bold mb-2">Append New Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => appendImagesToProduct(product._id, e)}
                                        className="w-full text-xs text-white file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-accent file:text-white hover:file:bg-accent/80 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button onClick={() => deleteProductHandler(product._id)} className="mt-auto px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition font-bold text-sm uppercase tracking-wider w-full">
                                Delete Product entirely
                            </button>
                        </div>

                        {/* Variants List */}
                        <div className="p-6 xl:w-2/3 flex flex-col">
                            <h3 className="text-xl font-bold mb-6 text-accent border-b border-white/10 pb-2">Size Variants</h3>

                            {!product.sizes || product.sizes.length === 0 ? (
                                <div className="text-yellow-300 bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                                    ⚠️ Warning: This product was created before the variants update and has no sizes configured. Please re-create it.
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1">
                                    {product.sizes.map((sizeItem) => (
                                        <div key={sizeItem.size} className="flex flex-col bg-black/40 p-4 rounded-xl border border-white/5 hover:border-accent/40 transition gap-4">

                                            <div className="flex flex-col md:flex-row items-center gap-4">
                                                <div className="w-24 font-bold text-xl text-white drop-shadow-md">
                                                    {sizeItem.size}
                                                </div>

                                                <div className="flex-1 flex flex-row items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs uppercase opacity-70 font-bold w-12 text-right">Price</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">₹</span>
                                                            <input
                                                                type="number"
                                                                defaultValue={sizeItem.price}
                                                                onBlur={(e) => {
                                                                    if (Number(e.target.value) !== sizeItem.price) {
                                                                        updateSizeHandler(product._id, sizeItem.size, { price: Number(e.target.value) })
                                                                    }
                                                                }}
                                                                className="w-28 pl-7 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono focus:border-accent focus:bg-white/20 outline-none transition"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                                    <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wide ${sizeItem.stockStatus === 'inStock' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                        {sizeItem.stockStatus === 'inStock' ? 'In Stock' : 'Out of Stock'}
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            const newStatus = sizeItem.stockStatus === 'inStock' ? 'outOfStock' : 'inStock';
                                                            updateSizeHandler(product._id, sizeItem.size, { stockStatus: newStatus });
                                                        }}
                                                        className="w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out cursor-pointer"
                                                        style={{ backgroundColor: sizeItem.stockStatus === 'inStock' ? '#34A853' : '#333' }}
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ease-in-out shadow-sm"
                                                            style={{ transform: sizeItem.stockStatus === 'inStock' ? 'translateX(26px)' : 'translateX(4px)' }}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="w-full">
                                                <label className="text-xs uppercase opacity-70 font-bold mb-2 inline-block text-left w-full">Description</label>
                                                <textarea
                                                    defaultValue={sizeItem.description}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== sizeItem.description) {
                                                            updateSizeHandler(product._id, sizeItem.size, { description: e.target.value })
                                                        }
                                                    }}
                                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-accent focus:bg-white/20 outline-none transition h-20"
                                                    placeholder="Size description..."
                                                />
                                            </div>

                                        </div>
                                    ))}
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
