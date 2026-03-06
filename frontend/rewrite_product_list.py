import os

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/admin/ProductListScreen.jsx', 'r') as f:
    text = f.read()

start_idx = text.find('    return (\n        <div className="max-w-6xl mx-auto mt-6 pb-20">')
if start_idx == -1:
    print("Could not find start idx!")
    exit(1)

imports_and_logic = text[:start_idx]

new_return = """    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/>%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full mb-12">
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between pb-6 md:pb-12 relative gap-6 md:gap-0">
                    <div className="w-full md:w-1/2 text-left flex flex-col items-start">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono">
                            (Product Catalog)
                        </span>
                        <h1 className="text-[40px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            INVENTORY<br/>SYSTEM
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
                        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/>%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/>%3C/svg%3E')" }}></div>
                        
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
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/>%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/>%3C/svg%3E')" }}></div>
                    
                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                        Asset Archive
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="grid grid-cols-1 gap-6 relative z-10">
                        {products.map((p) => (
                            <div key={p._id} className="bg-[#111] border border-[#1a1a1a] p-6 lg:p-8 rounded-[12px] flex flex-col xl:flex-row gap-8 lg:gap-12 hover:border-[#333] transition-colors relative group">
                                
                                {/* Header / Details */}
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="flex items-start justify-between border-b border-[#222] pb-6">
                                        <div className="flex flex-col w-full text-left gap-1">
                                            <span className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#555] uppercase font-mono">ID: {p._id.substring(18)}</span>
                                            <h3 className="text-[18px] md:text-[24px] font-[800] uppercase tracking-wide text-[#eaeaea] leading-tight">{p.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => deleteProductHandler(p._id)}
                                            className="text-[10px] uppercase font-[700] tracking-widest text-[#777] hover:text-white bg-[#1a1a1a] hover:bg-red-500/20 border border-[#333] hover:border-red-500/40 focus:ring focus:ring-red-500/10 rounded-[4px] px-4 py-2 transition-all flex-shrink-0 ml-4 h-fit"
                                        >
                                            REDACT
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-8 flex-wrap">
                                        <div className="flex flex-col gap-2 bg-[#0c0c0c] border border-[#222] px-6 py-4 rounded-[6px]">
                                            <span className="text-[10px] font-[600] tracking-widest font-mono text-[#666] uppercase">Market Valid</span>
                                            <span className="font-mono font-[800] text-[20px] text-white tracking-widest relative -top-1">₹{p.marketPrice}</span>
                                        </div>
                                        <div className="flex flex-col gap-2 bg-[#0c0c0c] border border-[#222] px-6 py-4 rounded-[6px]">
                                            <span className="text-[10px] font-[600] tracking-widest font-mono text-[#666] uppercase">Profit Margin</span>
                                            <span className="font-mono font-[800] text-[20px] text-[#eaeaea] tracking-widest relative -top-1">{p.margin}%</span>
                                        </div>
                                    </div>
                                    
                                    {/* Image Management Inside Row */}
                                    <div className="mt-2 pt-6 border-t border-[#222]">
                                        <span className="text-[10px] font-mono text-[#777] uppercase mb-4 block tracking-widest">Linked Media Systems ({p.images?.length || 0})</span>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            {p.images && p.images.map(img => (
                                                <div key={img.publicId} className="relative group/img w-16 h-16 md:w-20 md:h-20 rounded-[6px] overflow-hidden border border-[#333] shadow-md">
                                                    <img src={img.url} alt="prod" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                                        <button
                                                            onClick={() => deleteImageFromProduct(p._id, img.publicId)}
                                                            className="text-red-400 hover:text-white hover:bg-red-500/50 p-2 rounded-full transition-colors"
                                                        >
                                                            <span className="block w-4 h-4 relative"><span className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 rotate-45"></span><span className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 -rotate-45"></span></span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="w-16 h-16 md:w-20 md:h-20 border border-[#333] border-dashed rounded-[6px] flex flex-col items-center justify-center relative hover:bg-[#1a1a1a] hover:border-[#555] transition-colors cursor-pointer text-[#555] hover:text-[#888]">
                                                <span className="text-[20px] md:text-[24px] font-mono leading-none mb-1">+</span>
                                                <span className="text-[8px] uppercase tracking-widest font-mono">APPEND</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => appendImagesToProduct(p._id, e)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Variants Grid */}
                                <div className="flex-[1.5] w-full flex flex-col gap-4">
                                    <span className="text-[10px] font-mono text-[#777] uppercase block tracking-widest border-b border-[#222] pb-3 mb-1">Variant Signatures</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                        {p.sizes.map((s, idx) => (
                                            <div key={idx} className="bg-[#0c0c0c] border border-[#222] p-4 rounded-[6px] flex flex-col relative group/sz hover:border-[#333] transition-colors shadow-inner overflow-hidden">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-[800] text-[12px] md:text-[13px] uppercase tracking-wide text-white">{s.size} CLS</span>
                                                    <span className={`w-2 h-2 rounded-full ${s.stockStatus === 'inStock' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                                                </div>
                                                <span className="font-mono text-[16px] md:text-[18px] font-[800] text-[#eaeaea] mb-2 tracking-wide text-green-400">₹{s.finalPrice}</span>
                                                <span className="text-[10px] md:text-[11px] font-[600] font-mono text-[#666] line-clamp-3 leading-relaxed mt-1 border-t border-[#1a1a1a] pt-3">{s.description || 'No variant data.'}</span>
                                                
                                                {/* Hover Stock Status Toggle */}
                                                <div className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/90 to-transparent opacity-0 group-hover/sz:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 px-3 backdrop-blur-[1px]">
                                                    <select
                                                        value={s.stockStatus}
                                                        onChange={(e) => updateStockStatusHandler(p._id, idx, e.target.value)}
                                                        className={`w-full text-[10px] font-[800] uppercase tracking-widest text-center border border-[#333] rounded-[4px] py-1.5 cursor-pointer focus:outline-none transition-colors shadow-lg ${s.stockStatus === 'inStock' ? 'bg-[#1a1a1a] text-green-400 hover:border-green-500/50' : 'bg-[#1a1a1a] text-red-400 hover:border-red-500/50'}`}
                                                    >
                                                        <option value="inStock">In Stock</option>
                                                        <option value="outOfStock">Out of Stock</option>
                                                    </select>
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
"""

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/admin/ProductListScreen.jsx', 'w') as f:
    f.write(imports_and_logic + new_return)
