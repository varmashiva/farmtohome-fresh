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
        { size: 'Small', price: 0, stockStatus: 'inStock', description: '', images: [] },
        { size: 'Medium', price: 0, stockStatus: 'inStock', description: '', images: [] },
        { size: 'Large', price: 0, stockStatus: 'inStock', description: '', images: [] }
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

    const uploadNewProductSizeFilesHandler = async (index, e) => {
        const files = e.target.files;
        if (files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await api.post('/upload/product-images', formData, config);

            const updatedSizes = [...newProduct.sizes];
            updatedSizes[index].images = [...(updatedSizes[index].images || []), ...data.images];
            setNewProduct({ ...newProduct, sizes: updatedSizes });
        } catch (error) {
            console.error(error);
            alert('Variant Images upload failed');
        }
    };

    const removeNewProductSizeImageHandler = (index, publicId) => {
        const updatedSizes = [...newProduct.sizes];
        updatedSizes[index].images = updatedSizes[index].images.filter(img => img.publicId !== publicId);
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

    const uploadSizeFilesHandler = async (productId, sizeName, e) => {
        const files = e.target.files;
        if (files.length === 0) return;
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('images', file));
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
            const uploadRes = await api.post('/upload/product-images', formData, config);
            const product = products.find(p => p._id === productId);
            const sizeItem = product.sizes.find(s => s.size === sizeName);
            const currentImages = sizeItem.images || [];
            const newImages = [...currentImages, ...uploadRes.data.images];
            await updateSizeHandler(productId, sizeName, { images: newImages });
        } catch (error) {
            console.error(error);
            alert('Failed to upload variant images');
        }
    };

    const deleteSizeImageFromProduct = async (productId, sizeName, publicId) => {
        if (!window.confirm('Are you sure you want to delete this variant image?')) return;
        try {
            const product = products.find(p => p._id === productId);
            const sizeItem = product.sizes.find(s => s.size === sizeName);
            const newImages = (sizeItem.images || []).filter(img => img.publicId !== publicId);
            await updateSizeHandler(productId, sizeName, { images: newImages });
        } catch (error) {
            console.error(error);
            alert('Failed to remove variant image');
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
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full mb-12">
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between pb-6 md:pb-12 relative gap-6 md:gap-0">
                    <div className="w-full md:w-1/2 text-left flex flex-col items-start">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono">
                            (Product Catalog)
                        </span>
                        <h1 className="text-[40px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            INVENTORY<br />SYSTEM
                        </h1>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-end mt-6 md:mt-0">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className={`py-3 px-6 rounded-[4px] font-[800] text-[11px] md:text-[12px] uppercase tracking-[0.1em] transition-all duration-300 shadow-xl border ${showAddForm ? 'bg-[#111] text-[#eaeaea] border-[#333] hover:text-white hover:border-white' : 'bg-[#eaeaea] text-[#111] border-[#eaeaea] hover:bg-white'}`}
                        >
                            {showAddForm ? 'CANCEL CREATION' : '+ ADD NEW PRODUCT'}
                        </button>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 w-full mb-16">
                {showAddForm && (
                    <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col mb-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                        <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                            Product Genesis
                            <span className="h-[1px] flex-1 bg-[#222]"></span>
                        </h2>

                        <form onSubmit={submitCreateProductHandler} className="relative z-10 flex flex-col gap-8 w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                                {/* Left Side: Basic Info & Pricing */}
                                <div className="flex flex-col gap-6">
                                    <h3 className="text-[14px] font-[800] tracking-widest uppercase text-[#888] font-mono mb-2">Identifier & Globals</h3>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#666] uppercase font-mono">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="w-full px-4 py-3 md:py-4 bg-[#111] border border-[#333] rounded-[4px] text-white text-[12px] md:text-[14px] font-[600] uppercase tracking-wide focus:outline-none focus:border-white/50 transition duration-300"
                                            placeholder="Enter product designation"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#666] uppercase font-mono">Market Price (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                value={newProduct.marketPrice}
                                                onChange={(e) => setNewProduct({ ...newProduct, marketPrice: Number(e.target.value) })}
                                                className="w-full px-4 py-3 md:py-4 bg-[#111] border border-[#333] rounded-[4px] text-white text-[12px] md:text-[14px] font-mono focus:outline-none focus:border-white/50 transition duration-300"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#666] uppercase font-mono">Margin (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                required
                                                value={newProduct.margin}
                                                onChange={(e) => setNewProduct({ ...newProduct, margin: Number(e.target.value) })}
                                                className="w-full px-4 py-3 md:py-4 bg-[#111] border border-[#333] rounded-[4px] text-white text-[12px] md:text-[14px] font-mono focus:outline-none focus:border-white/50 transition duration-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Size Specifications inside Left Side */}
                                    <h3 className="text-[14px] font-[800] tracking-widest uppercase text-[#888] font-mono mt-4 mb-2">Variant Engineering</h3>
                                    <div className="flex flex-col gap-4">
                                        {newProduct.sizes.map((sizeObj, idx) => (
                                            <div key={idx} className="bg-[#111] border border-[#222] p-4 md:p-5 rounded-[8px] flex flex-col gap-4 shadow-inner">
                                                <div className="flex items-center justify-between border-b border-[#333] pb-3">
                                                    <span className="text-[14px] font-[800] uppercase tracking-wide text-white">{sizeObj.size} Class</span>
                                                    <select
                                                        value={sizeObj.stockStatus}
                                                        onChange={(e) => handleNewProductSizeChange(idx, 'stockStatus', e.target.value)}
                                                        className={`text-[10px] font-[800] uppercase tracking-widest px-3 py-1.5 rounded-[4px] border border-[#333] cursor-pointer focus:outline-none ${sizeObj.stockStatus === 'inStock' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}
                                                    >
                                                        <option value="inStock" className="bg-[#111] text-green-400">In Stock</option>
                                                        <option value="outOfStock" className="bg-[#111] text-red-500">Out of Stock</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-[600] tracking-widest text-[#666] uppercase font-mono">Modifier (₹/%)</label>
                                                        <input
                                                            type="number"
                                                            value={sizeObj.price}
                                                            onChange={(e) => handleNewProductSizeChange(idx, 'price', Number(e.target.value))}
                                                            className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#333] rounded-[4px] text-white text-[13px] font-mono focus:outline-none focus:border-white/50 transition duration-300"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <label className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#666] uppercase font-mono">Description / Specs</label>
                                                    <textarea
                                                        rows="2"
                                                        value={sizeObj.description}
                                                        onChange={(e) => handleNewProductSizeChange(idx, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#333] rounded-[4px] text-white text-[12px] focus:outline-none focus:border-white/50 transition duration-300 resize-none font-mono"
                                                        placeholder={`Details for ${sizeObj.size}...`}
                                                    />
                                                </div>

                                                {/* Variant Based Image Gallery Build Phase */}
                                                <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex flex-col gap-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest">Variant Media ({sizeObj.images?.length || 0})</span>
                                                        <div className="relative overflow-hidden w-6 h-6 rounded-full bg-[#1a1a1a] hover:bg-[#333] border border-[#333] hover:border-white transition-colors flex justify-center items-center cursor-pointer">
                                                            <span className="text-white text-[14px] font-mono leading-none flex items-center justify-center">+</span>
                                                            <input type="file" multiple accept="image/*" onChange={(e) => uploadNewProductSizeFilesHandler(idx, e)} className="absolute inset-0 w-full h-full opacity-0 outline-none cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    {sizeObj.images && sizeObj.images.length > 0 && (
                                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                            {sizeObj.images.map(img => (
                                                                <div key={img.publicId} className="w-16 h-16 md:w-20 md:h-20 rounded-[8px] border border-[#333] overflow-hidden flex-shrink-0 relative group/szimg shadow-md">
                                                                    <img src={img.url} alt="v-img" className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/szimg:opacity-100 flex items-center justify-center transition-opacity" onClick={() => removeNewProductSizeImageHandler(idx, img.publicId)}>
                                                                        <span className="block w-4 h-4 relative cursor-pointer"><span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-400 -translate-y-1/2 rotate-45"></span><span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-400 -translate-y-1/2 -rotate-45"></span></span>
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

                                {/* Right Side: Images */}
                                <div className="flex flex-col gap-6">
                                    <h3 className="text-[14px] font-[800] tracking-widest uppercase text-[#888] font-mono mb-2">Media Assets</h3>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#666] uppercase font-mono">Upload Images (Max 5)</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={uploadFilesHandler}
                                                disabled={uploadingImage || newProduct.images.length >= 5}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                            />
                                            <div className={`w-full px-4 py-8 md:py-12 border border-dashed rounded-[4px] flex flex-col items-center justify-center gap-3 transition-all duration-300 ${uploadingImage ? 'border-[#333] bg-[#111] opacity-50' : newProduct.images.length >= 5 ? 'border-[#333] bg-[#0c0c0c] opacity-50 cursor-not-allowed' : 'border-[#444] bg-[#111] hover:border-white/50 hover:bg-[#1a1a1a]'}`}>
                                                {uploadingImage ? (
                                                    <div className="w-6 h-6 border-2 border-t-[#eaeaea] border-[#333] rounded-full animate-spin flex-shrink-0"></div>
                                                ) : (
                                                    <span className="text-[24px] font-mono text-[#555] leading-none">+</span>
                                                )}
                                                <span className="text-[11px] font-[600] tracking-widest text-[#777] uppercase font-mono text-center">
                                                    {uploadingImage ? 'Uploading Assets...' : 'Drop files or click to add'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-4">
                                        {newProduct.images.map((img) => (
                                            <div key={img.publicId} className="relative group rounded-[8px] overflow-hidden border border-[#333] bg-[#111] aspect-square">
                                                <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImageHandler(img.publicId)}
                                                        className="bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/50 hover:text-white p-2 md:p-3 rounded-full transition-colors"
                                                    >
                                                        <span className="block w-3 h-3 md:w-4 md:h-4 relative"><span className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 rotate-45"></span><span className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 -rotate-45"></span></span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {newProduct.images.length > 0 && (
                                        <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">{newProduct.images.length}/5 Attached Assets</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[#222] flex justify-end">
                                <button
                                    type="submit"
                                    disabled={uploadingImage || newProduct.name.trim() === ''}
                                    className="w-full md:w-auto py-5 px-12 rounded-[4px] font-[800] text-[12px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#eaeaea] text-[#111] border border-[#eaeaea] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    INITIALIZE PRODUCT
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CURRENT PRODUCTS INVENTORY */}
                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                        Asset Archive
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="grid grid-cols-1 gap-6 relative z-10">
                        {products.map((p) => (
                            <div key={p._id} className="bg-[#111] border border-[#1a1a1a] p-6 lg:p-8 rounded-[12px] flex flex-col gap-8 hover:border-[#333] transition-colors relative group">

                                {/* Header / Details */}
                                <div className="w-full flex items-start justify-between border-b border-[#222] pb-6">
                                    <div className="flex flex-col w-full text-left gap-1">
                                        <span className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#555] uppercase font-mono">ID: {p._id.substring(18)}</span>
                                        <h3 className="text-[18px] md:text-[24px] font-[800] uppercase tracking-wide text-[#eaeaea] leading-tight flex items-center gap-4">
                                            {p.name}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => deleteProductHandler(p._id)}
                                        className="text-[10px] uppercase font-[700] tracking-widest text-[#777] hover:text-white bg-[#1a1a1a] hover:bg-red-500/20 border border-[#333] hover:border-red-500/40 focus:ring focus:ring-red-500/10 rounded-[4px] px-4 py-2 transition-all flex-shrink-0 ml-4 h-fit"
                                    >
                                        REDACT
                                    </button>
                                </div>

                                {/* Variants Grid */}
                                <div className="w-full flex flex-col gap-4">
                                    <span className="text-[10px] font-mono text-[#777] uppercase block tracking-widest mb-1">Variant Signatures</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                        {p.sizes.map((s, idx) => (
                                            <div key={idx} className="bg-[#0c0c0c] border border-[#222] p-4 rounded-[6px] flex flex-col relative group/sz hover:border-[#333] transition-colors shadow-inner">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-[800] text-[12px] md:text-[13px] uppercase tracking-wide text-white">{s.size} CLS</span>
                                                    <span className={`w-2 h-2 rounded-full ${s.stockStatus === 'inStock' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                                                </div>

                                                <div className="relative mb-2">
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[#666] text-[16px] md:text-[18px] font-[800]">₹</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={s.price}
                                                        onBlur={(e) => {
                                                            if (Number(e.target.value) !== s.price) {
                                                                updateSizeHandler(p._id, s.size, { price: Number(e.target.value) });
                                                            }
                                                        }}
                                                        className="w-full bg-transparent pl-5 font-mono text-[16px] md:text-[18px] font-[800] text-green-400 focus:outline-none focus:border-b focus:border-[#444] tracking-wide"
                                                    />
                                                </div>

                                                <textarea
                                                    defaultValue={s.description}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== s.description) {
                                                            updateSizeHandler(p._id, s.size, { description: e.target.value });
                                                        }
                                                    }}
                                                    className="w-full bg-transparent text-[10px] md:text-[11px] font-[600] font-mono text-[#666] leading-relaxed mt-1 border-t border-[#1a1a1a] pt-3 resize-none focus:outline-none focus:text-[#888] h-16"
                                                    placeholder="Variant data..."
                                                />

                                                <div className="mt-2 pt-2 border-t border-[#1a1a1a]">
                                                    <select
                                                        value={s.stockStatus}
                                                        onChange={(e) => updateSizeHandler(p._id, s.size, { stockStatus: e.target.value })}
                                                        className={`w-full text-[10px] font-[800] uppercase tracking-widest text-center border border-[#333] rounded-[4px] py-1.5 cursor-pointer focus:outline-none transition-colors shadow-lg ${s.stockStatus === 'inStock' ? 'bg-green-500/10 text-green-400 hover:border-green-500/50' : 'bg-red-500/10 text-red-500 hover:border-red-500/50'}`}
                                                    >
                                                        <option value="inStock" className="bg-[#111] text-green-400">In Stock</option>
                                                        <option value="outOfStock" className="bg-[#111] text-red-500">Out of Stock</option>
                                                    </select>
                                                </div>

                                                {/* Variant Based Image Gallery */}
                                                <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex flex-col gap-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest">Variant Media ({s.images?.length || 0})</span>
                                                        <div className="relative overflow-hidden w-6 h-6 rounded-full bg-[#1a1a1a] hover:bg-[#333] border border-[#333] hover:border-white transition-colors flex justify-center items-center cursor-pointer">
                                                            <span className="text-white text-[14px] font-mono leading-none flex items-center justify-center">+</span>
                                                            <input type="file" multiple accept="image/*" onChange={(e) => uploadSizeFilesHandler(p._id, s.size, e)} className="absolute inset-0 w-full h-full opacity-0 outline-none cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    {s.images && s.images.length > 0 && (
                                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                            {s.images.map(img => (
                                                                <div key={img.publicId} className="w-16 h-16 md:w-20 md:h-20 rounded-[8px] border border-[#333] overflow-hidden flex-shrink-0 relative group/szimg shadow-md">
                                                                    <img src={img.url} alt="v-img" className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/szimg:opacity-100 flex items-center justify-center transition-opacity" onClick={() => deleteSizeImageFromProduct(p._id, s.size, img.publicId)}>
                                                                        <span className="block w-4 h-4 relative cursor-pointer"><span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-400 -translate-y-1/2 rotate-45"></span><span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-400 -translate-y-1/2 -rotate-45"></span></span>
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

                            </div>
                        ))}
                        {products.length === 0 && <div className="py-20 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">No Inventory Records Available.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListScreen;
