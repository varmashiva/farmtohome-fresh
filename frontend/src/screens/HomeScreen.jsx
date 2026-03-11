import { useState, useEffect, useContext, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SocketContext } from '../context/SocketContext';
import { CartContext } from '../context/CartContext';
import bgVideo from '../assets/media/bg_vedio.mp4';
import img1 from '../assets/media/xyz1.avif';
import img2 from '../assets/media/xyz2.avif';
import img3 from '../assets/media/xyz3.avif';
import img4 from '../assets/media/xyz4.avif';
import fssaiLogo from '../assets/media/fssai.png';
import { FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

const ParallaxImageBlock = ({ imageSrc, id, title, description }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const imageParallaxY = useTransform(scrollYProgress, [0, 1], ['-25%', '25%']);

    return (
        <div ref={ref} id={id} className="mx-auto w-[95%] md:w-full max-w-[1400px] relative aspect-[19/23] md:aspect-[21/10] overflow-hidden rounded-md mb-8 md:mb-16 last:mb-0">
            {/* Parallax Background Image */}
            <motion.img
                src={imageSrc}
                alt="Cinematic Prawns"
                className="absolute inset-0 w-full h-full object-cover object-center scale-[1.5] origin-center pointer-events-none"
                style={{ y: imageParallaxY }}
            />

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 mix-blend-multiply pointer-events-none"></div>

            {/* Unified Layout Container */}
            <div className="absolute inset-x-6 inset-y-6 md:inset-x-12 md:inset-y-12 z-10 flex flex-col pointer-events-none">

                {/* Top: Mobile Title & Subtitle OR Desktop Right Text */}
                <div className="flex justify-between items-start w-full">
                    {/* Mobile Title Block */}
                    <div className="flex flex-col items-start text-left md:hidden max-w-[90%] pointer-events-auto">
                        <h2 className="text-4xl font-bold tracking-tighter text-white mb-2 drop-shadow-xl">
                            {title || 'SIGNATURE'}
                        </h2>
                        <p className="text-white/80 text-xs font-medium tracking-wide">
                            Wild Caught / Jumbo Grade / Ethical / Fresh
                        </p>
                    </div>

                    {/* Desktop Top-Right Text */}
                    <div className="hidden md:block w-full max-w-[340px] ml-auto text-left pointer-events-auto">
                        <p className="text-white/90 text-base lg:text-lg font-medium leading-relaxed drop-shadow-md">
                            {description || 'Cinematic Prawns Sourced from pristine deep waters. The selection process is curated to ensure only the highest grade catch reaches your culinary canvas.'}
                        </p>
                    </div>
                </div>

                {/* Middle: Mobile Description Text */}
                <div className="md:hidden w-full max-w-[90%] my-auto pointer-events-auto pt-6 pb-6">
                    <p className="text-white/90 text-sm font-medium leading-relaxed drop-shadow-md">
                        {description || 'Cinematic Prawns Sourced from pristine deep waters. The selection process is curated to ensure only the highest grade catch reaches your culinary canvas.'}
                    </p>
                </div>

                {/* Bottom: Desktop Title & Button OR Mobile Button */}
                <div className="flex justify-start md:justify-between items-end w-full mt-auto md:mt-auto pointer-events-none">
                    {/* Desktop Title & Subtitle */}
                    <div className="hidden md:flex flex-col items-start text-left pointer-events-auto">
                        <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-3 drop-shadow-xl">
                            {title || 'SIGNATURE'}
                        </h2>
                        <p className="text-white/80 text-sm lg:text-[15px] font-medium tracking-wide">
                            Wild Caught / Jumbo Grade / Ethical / Fresh
                        </p>
                    </div>

                    <div className="w-fit md:w-full md:max-w-[200px] flex justify-start md:justify-start pointer-events-auto">
                        <Link to="/product/69a6619514974541e40c97ae" className="bg-white text-black text-[12px] md:text-sm font-bold py-3 md:py-3 px-6 md:px-6 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl tracking-wider">
                            Catch Some Prawns
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeScreen = () => {
    const [products, setProducts] = useState([]);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const [selectedSizes, setSelectedSizes] = useState({});
    const { socket } = useContext(SocketContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleQtyChange = (id, val) => {
        if (val < 0.5) val = 0.5;
        if (val > 10) val = 10;
        setQuantities(prev => ({ ...prev, [id]: val }));
    };

    const getQty = (id) => quantities[id] || 0.5;

    const formatQty = (q) => {
        if (q === 0.5) return '500g';
        if (q % 1 !== 0) return `${Math.floor(q)}.5 kg`;
        return `${q} kg`;
    };

    // Parallax Scroll setup (Hero Video)
    const { scrollY } = useScroll();
    const videoY = useTransform(scrollY, [0, 1000], ['0%', '20%']);
    const videoOpacity = useTransform(scrollY, [0, 500], [0.8, 0.2]);

    // Parallax component handles its own scrolling hook

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

    // Staggered Text Animation setup
    const titleText = "FARM\nTO HOME";
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 1.5, ease: "easeOut" } }
    };

    if (loading) return <div className="text-center text-xl mt-20 text-white animate-pulse">Loading Farm to Home</div>;

    // Helper to get a stable display "default" size. For now, we prefer Small size or whatever is index 0.
    const getDefaultSize = (product) => {
        if (!product.sizes || product.sizes.length === 0) return null;
        return product.sizes.find(s => s.size === 'Small') || product.sizes[0];
    };

    return (
        <div>
            {/* Full Viewport Hero Section */}
            <div className="relative h-screen min-h-screen w-full flex flex-col items-center justify-center overflow-hidden z-0 bg-black">

                {/* Parallax Background Video */}
                <motion.video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ y: videoY, opacity: videoOpacity }}
                    className="absolute inset-0 w-full h-full object-cover z-0 origin-center"
                >
                    <source src={bgVideo} type="video/mp4" />
                </motion.video>
                <div className="absolute inset-0 bg-black/30 z-10 transition-opacity"></div>

                <div className="relative z-20 w-full h-full flex flex-col justify-center px-6 md:px-16 container mx-auto">

                    {/* Left side links - Fade Up */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        className="absolute top-1/2 left-6 md:left-16 -translate-y-1/2 hidden lg:flex flex-col gap-3 text-sm font-extrabold tracking-[0.2em] text-white/90 drop-shadow-md"
                    >
                        <a href="#products" className="hover:text-white transition-colors">FRESH FROM POND (CHERUVULU)</a>                        <a href="#products" className="hover:text-white transition-colors">NO PRESERVATIVES</a>
                        <a href="#products" className="hover:text-white transition-colors">NO CHEMICALS</a>
                        <a href="#products" className="hover:text-white transition-colors">ONLY FRESH SEAFOOD</a>
                    </motion.div>

                    {/* Massive Right-Side Title & Description */}
                    <div className="flex-grow flex flex-col justify-center items-start md:items-end max-w-5xl md:ml-auto w-full text-left md:text-right mt-16 md:mt-24 overflow-hidden pt-10">
                        {/* Staggered Title */}
                        <motion.h1
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-[15vw] md:text-[10vw] font-bold text-white leading-[0.85] tracking-tighter drop-shadow-2xl uppercase flex flex-col items-start md:items-end"
                        >
                            {titleText.split('\n').map((line, lineIndex) => (
                                <div key={lineIndex} className="flex overflow-hidden pb-2 -mb-2">
                                    {line.split('').map((char, charIndex) => (
                                        <motion.span key={`${lineIndex}-${charIndex}`} variants={letterVariants}>
                                            {char === ' ' ? '\u00A0' : char}
                                        </motion.span>
                                    ))}
                                </div>
                            ))}
                        </motion.h1>

                        {/* Faded Profile Description */}
                        <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                            className="text-lg md:text-2xl text-white/90 font-medium mt-8 max-w-3xl drop-shadow-lg leading-relaxed"
                        >
                            Farmed in freshwater ponds by local aqua farmers and packed fresh to deliver clean, high-quality prawns straight to your kitchen.
                        </motion.p>
                    </div>

                    {/* Bottom Info Row (Mobile side-by-side, Desktop separate corners) */}
                    <div className="absolute bottom-6 md:bottom-10 left-6 md:left-16 right-6 md:right-16 flex justify-between items-center w-[calc(100%-48px)] md:w-[calc(100%-128px)] z-20 pointer-events-none">
                        {/* Info Text */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                            className="flex flex-col gap-1 text-[10px] md:text-sm font-semibold tracking-wider text-white pointer-events-auto"
                        >

                            <p className="opacity-70">CONTACT US - +91 9876543210</p>
                            <p className="opacity-70">APPROVED ☑️</p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                            className="pointer-events-auto"
                        >
                            <Link to="/product/69a6619514974541e40c97ae" className="bg-white text-black text-[11px] md:text-sm font-bold py-2 md:py-3 px-4 md:px-6 rounded flex items-center gap-2 hover:bg-gray-200 transition-all shadow-xl tracking-wider">
                                Catch Some Prawns
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            <section className="bg-black pt-36 pb-24 md:pt-56 md:pb-32 px-6 md:px-12 w-full relative">
                {/* Subtle radial vignette background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111111] via-black to-black opacity-90 pointer-events-none"></div>

                <div className="max-w-[1400px] mx-auto relative z-10">
                    {/* Header: ARTISTRY PRICED inspired */}
                    <div className="mb-16 md:mb-24 w-full">
                        {/* Top Section: (Pricing) & Heading */}
                        <div className="flex flex-col md:flex-row items-start w-full">
                            {/* Left Column */}
                            <div className="w-full md:w-[20%] lg:w-[25%] mb-6 md:mb-0">
                                <p className="text-[#666] text-[11px] md:text-sm font-[500] tracking-widest uppercase font-mono mt-2 md:mt-4">
                                    (Pricing)
                                </p>
                            </div>

                            {/* Right Column / Heading */}
                            <div className="w-full md:w-[80%] lg:w-[75%] flex flex-col items-start overflow-hidden pt-4 -mt-4">
                                <motion.h2
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                                    id="products" className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase flex flex-col" style={{ fontFamily: 'Froople, sans-serif', fontWeight: 900 }}>
                                    <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">FRESH CATCH</motion.span></div>
                                    <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">OF THE DAY</motion.span></div>
                                </motion.h2>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-[1px] bg-[#333] mt-10 mb-10 md:mt-16 md:mb-16 relative">
                            <div className="absolute left-0 -top-[7px] text-[#666] text-xs font-mono">+</div>
                            <div className="absolute right-0 -top-[7px] text-[#666] text-xs font-mono">+</div>
                        </div>

                        {/* Bottom Section: Text under heading */}
                        <div className="flex flex-col md:flex-row items-start w-full">
                            {/* Left Column Spacer */}
                            <div className="hidden md:block w-full md:w-[20%] lg:w-[25%]"></div>

                            {/* Right Column / Description */}
                            <div className="w-full md:w-[80%] lg:w-[75%] flex flex-col items-start pr-4 md:pr-0">
                                <p className="text-[#aaaaaa] font-[500] text-base md:text-[20px] max-w-3xl leading-[1.6]" style={{ fontFamily: 'Froople, sans-serif' }}>
                                    Our prawns are responsibly farmed in traditional freshwater ponds (cheruvulu) by experienced aqua farmers across coastal Andhra Pradesh. Harvested fresh and packed the same day to preserve natural taste and quality.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Premium Product List */}
                    <div className="flex flex-col gap-12 w-full max-w-[1400px] mx-auto">
                        {products.map((product) => {
                            const defaultSizeInfo = getDefaultSize(product);
                            const isOverallInStock = product.overallStockStatus === 'inStock';
                            const displayPrice = defaultSizeInfo ? defaultSizeInfo.price : 0;

                            const selectedSizeStr = selectedSizes[product._id] || (defaultSizeInfo ? defaultSizeInfo.size : product.sizes?.[0]?.size);
                            const selectedSizeData = product.sizes?.find(s => s.size === selectedSizeStr);
                            const activeImages = (selectedSizeData?.images && selectedSizeData.images.length > 0) ? selectedSizeData.images : (product.images || []);

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    key={product._id}
                                    className="bg-[#0c0c0c] border border-[#222] rounded-[32px] p-5 md:p-6 lg:p-10 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-16 hover:border-[#333] transition-colors duration-500 shadow-2xl relative items-center justify-between overflow-hidden group/card"
                                    style={{ fontFamily: 'Froople, sans-serif' }}
                                >
                                    {/* Noise Texture */}
                                    <div className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                                    {/* Left Side: Product Image (Approx 40-45%) */}
                                    <div className="w-full md:w-[45%] lg:w-[40%] h-[250px] md:h-[350px] lg:h-[500px] relative z-10">
                                        <Link to={`/product/${product._id}`} className="block w-full h-full overflow-hidden rounded-[24px] border border-[#1a1a1a] bg-[#050505] relative group shadow-inner">
                                            <img
                                                src={activeImages[0]?.url || product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover object-center grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                            />
                                        </Link>
                                    </div>

                                    {/* Right Side: Product Details & Dynamic Sizes (Approx 55-60%) */}
                                    <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col h-full md:py-6 relative z-10">

                                        {/* Product Details Header: Name & Starting Price at Top Right */}
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 md:mb-6">
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="text-3xl md:text-[48px] lg:text-[56px] font-[700] text-white tracking-tight leading-none capitalize">{product.name}</h3>
                                            </Link>

                                            <div className="flex flex-col items-start sm:items-end text-left sm:text-right flex-shrink-0">
                                                <span className="text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest mb-1">Starting At</span>
                                                <div className="flex items-baseline gap-1 md:gap-2">
                                                    <span className="text-white font-[800] text-2xl md:text-[32px] lg:text-[42px] tracking-tighter leading-none">₹{displayPrice}</span>
                                                    <span className="text-[#777] text-xs md:text-sm lg:text-base font-[600] tracking-normal uppercase">/ kg</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thin Divider */}
                                        <div className="w-full h-[1px] bg-[#222] mb-10 relative">
                                            <div className="absolute left-0 -top-[5px] text-[#444] text-[10px] font-mono">+</div>
                                            <div className="absolute right-0 -top-[5px] text-[#444] text-[10px] font-mono">+</div>
                                        </div>

                                        {/* Sizes in a vertical line (One under another) */}
                                        {product.sizes && product.sizes.length > 0 ? (
                                            <div className="flex flex-col gap-y-4 md:gap-y-6 mb-8 md:mb-12">
                                                {product.sizes.map((sizeObj, idx) => {
                                                    const isSelected = (selectedSizes[product._id] || product.sizes.find(s => s.stockStatus === 'inStock')?.size) === sizeObj.size;
                                                    const outOfStock = sizeObj.stockStatus !== 'inStock';

                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => !outOfStock && setSelectedSizes(prev => ({ ...prev, [product._id]: sizeObj.size }))}
                                                            className={`flex flex-col p-3 rounded-xl border transition-all duration-300 group/size ${outOfStock ? 'opacity-40 cursor-not-allowed border-transparent' : isSelected ? 'bg-white/5 border-white/20 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-transparent hover:border-white/10 cursor-pointer'}`}
                                                        >
                                                            <div className="flex items-center text-[#eaeaea] text-[15px] lg:text-[17px] font-[600] tracking-wide mb-0.5">
                                                                <div className={`mr-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white' : 'border-white/30 bg-transparent group-hover/size:border-white/50'}`}>
                                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                                                                </div>
                                                                <span className={isSelected ? 'text-white' : 'text-white/70'}>{sizeObj.size}</span>
                                                                <span className={`ml-auto font-mono ${isSelected ? 'text-green-400' : 'text-white/60'}`}>₹{sizeObj.price}</span>
                                                            </div>
                                                            <div className={`pl-7 text-[11px] font-[600] tracking-widest uppercase ${outOfStock ? 'text-red-500/80' : isSelected ? 'text-white/60' : 'text-white/30'}`}>
                                                                {outOfStock ? 'Sold Out' : isSelected ? 'Selection Active' : 'Select Variant'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-[#aaaaaa] text-[16px] font-[500] tracking-wide mb-16">
                                                <span className="mr-4 text-white text-[10px] opacity-70">⊕</span>
                                                <span className={`${isOverallInStock ? 'text-white' : 'text-red-400'}`}>
                                                    {isOverallInStock ? 'In Stock & Ready' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Bottom Footer: Quantity Selection & Functional Add to Cart */}
                                        <div className="mt-auto w-full flex flex-col sm:flex-row items-center gap-4 border-t border-[#1a1a1a] pt-6 md:pt-8 bg-transparent relative z-10">

                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-[#111] border border-[#222] rounded-[16px] px-2 py-1 h-[48px] md:h-[56px] w-full sm:w-auto flex-shrink-0">
                                                <button
                                                    onClick={() => handleQtyChange(product._id, getQty(product._id) - 0.5)}
                                                    className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xl"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="text"
                                                    value={formatQty(getQty(product._id))}
                                                    readOnly
                                                    className="bg-transparent text-center w-20 font-bold font-mono text-white text-[13px]"
                                                />
                                                <button
                                                    onClick={() => handleQtyChange(product._id, getQty(product._id) + 0.5)}
                                                    className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xl"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Functional Add To Cart Button */}
                                            <div className="w-full">
                                                {isOverallInStock ? (
                                                    <button
                                                        onClick={async () => {
                                                            const currentSize = selectedSizes[product._id] || product.sizes.find(s => s.stockStatus === 'inStock')?.size;
                                                            const currentSizeData = product.sizes.find(s => s.size === currentSize);
                                                            const finalPrice = currentSizeData ? currentSizeData.price : 0;
                                                            const success = await addToCart(product, currentSize, finalPrice, getQty(product._id));
                                                            if (success) {
                                                                navigate('/cart');
                                                                window.location.reload();
                                                            } else {
                                                                navigate('/login');
                                                            }
                                                        }}
                                                        className="w-full bg-[#eaeaea] hover:bg-white text-[#111] font-[900] py-[12px] md:py-[18px] rounded-[16px] text-center transition-all duration-300 transform hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 tracking-[0.15em] uppercase text-[11px] md:text-[13px]"
                                                    >
                                                        <span>Add To Cart</span>
                                                        <span className="opacity-30">|</span>
                                                        <span className="font-mono">₹{product.sizes.find(s => s.size === (selectedSizes[product._id] || product.sizes.find(ss => ss.stockStatus === 'inStock')?.size))?.price * getQty(product._id)}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="w-full bg-[#1a1a1a] text-[#555] font-[900] py-[12px] md:py-[18px] rounded-[16px] text-center cursor-not-allowed uppercase tracking-[0.15em] text-[11px] md:text-[13px] border border-[#222]"
                                                    >
                                                        Sold Out
                                                    </button>
                                                )}
                                            </div>

                                            {/* Bulk Order Contact */}
                                            <div className="w-full mt-4 py-4 flex items-center justify-center gap-1.5 text-[#888] text-[10px] md:text-[11px] font-semibold tracking-widest uppercase">
                                                <span className="text-[13px]">⚠️</span>
                                                <p>For bulk orders please contact <a href="tel:+919876543210" className="text-white hover:text-green-400 transition-colors ml-1">+91 9876543210</a></p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Premium Selection Section (Reference Based) */}
            <section className="bg-[#0a0a0a] text-[#ededed] pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-16 w-full relative z-10">
                <div className="w-full max-w-7xl mx-auto flex flex-col">

                    {/* Top Layer */}
                    <div className="w-full flex pb-8 md:pb-12 relative">
                        {/* Label */}
                        <div className="w-full md:w-1/4 hidden md:block">
                            <span className="text-xs md:text-sm font-semibold tracking-wider text-white/50 block mt-4">
                                (Selection)
                            </span>
                        </div>
                        {/* Heading */}
                        <div className="w-full md:w-3/4 text-left overflow-hidden pt-4 -mt-4">
                            <motion.h2
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                                className="text-[11vw] md:text-[7.2vw] font-bold leading-[0.85] tracking-tighter uppercase drop-shadow-lg text-white flex flex-col">
                                <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">PREMIUM</motion.span></div>
                                <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">SELECTION</motion.span></div>
                            </motion.h2>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full relative border-t border-white/20 mb-16 mx-auto">
                        <span className="absolute left-[-3px] top-[-8px] text-white/40 text-[10px] font-light">+</span>
                        <span className="absolute right-[-3px] top-[-8px] text-white/40 text-[10px] font-light">+</span>
                    </div>

                    {/* Bottom Layer */}
                    <div className="w-full flex">
                        {/* Empty spacing block to match heading indent */}
                        <div className="hidden md:block md:w-1/4"></div>

                        {/* Paragraph & List */}
                        <div className="w-full md:w-3/4 flex flex-col items-start pr-0">
                            <p className="text-sm md:text-lg text-white/80 font-medium leading-[1.6] mb-16 md:mb-20 max-w-[600px]">
                                At Farm To Home, we bring you prawns just the way they leave the farm-fresh, clean, and honest, raised in freshwater ponds by dedicated aqua farmers and carefully harvested to preserve their natural taste and purity.
                            </p>

                            <div className="flex flex-col w-full">
                                {[
                                    { num: '01', title: 'HARVEST FRESH' },
                                    { num: '02', title: 'PRECISION CLEANING' },
                                    { num: '03', title: 'FRESHSEAL PACKING' },
                                    { num: '04', title: 'SWIFTDOOR DELIVERY' },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => document.getElementById(`prawn-image-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className="flex justify-between items-center py-5 border-b border-white/10 group cursor-pointer hover:bg-white/[0.02] transition-colors duration-300 w-full"
                                    >
                                        <span className="text-xs md:text-[13px] font-bold tracking-[0.05em] uppercase group-hover:pl-4 transition-all duration-300 text-white/80">
                                            {item.title}
                                        </span>
                                        <span className="text-xs md:text-[13px] font-bold tracking-[0.05em] text-white/60">
                                            {item.num}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-black w-full relative overflow-hidden py-12 md:py-24 px-0 md:px-8">
                {[
                    { img: img1, title: 'HARVEST FRESH', description: 'Every prawn begins its journey in carefully maintained freshwater ponds, raised by dedicated aqua farmers. When the time is right, the prawns are gently harvested to ensure they retain their natural freshness and quality.' },
                    { img: img2, title: 'PRECISION CLEANING', description: 'Right after harvest, the prawns go through a careful cleaning process. Each batch is washed and handled under hygienic conditions to remove impurities while preserving the natural taste and texture.' },
                    { img: img3, title: 'FRESHSEAL PACKING', description: 'To lock in freshness, the prawns are immediately packed using hygienic and secure packaging. This process ensures that the seafood remains clean, fresh, and ready for your kitchen.' },
                    { img: img4, title: 'SWIFTDOOR DELIVERY', description: 'From the farm straight to your doorstep, our delivery system ensures the prawns reach you quickly. Cold-chain handling and fast logistics keep the seafood fresh until it arrives at your home.' }
                ].map((item, idx) => (
                    <ParallaxImageBlock key={idx} id={`prawn-image-${idx}`} imageSrc={item.img} title={item.title} description={item.description} />
                ))}
            </section>

            {/* FAQ Section */}
            <section className="bg-black text-[#ededed] pt-24 pb-24 md:pt-32 md:pb-32 px-6 md:px-16 w-full relative z-10">
                <div className="w-full max-w-7xl mx-auto flex flex-col">

                    {/* Top Layer */}
                    <div className="w-full flex pb-8 md:pb-12 relative">
                        {/* Label */}
                        <div className="w-full md:w-1/4 hidden md:block">
                            <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                                (FAQ)
                            </span>
                        </div>
                        {/* Heading */}
                        <div className="w-full md:w-3/4 text-left overflow-hidden pt-4 -mt-4">
                            <motion.h2
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                                className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase flex flex-col" style={{ fontFamily: 'Froople, sans-serif', fontWeight: 900 }}>
                                <div className="overflow-hidden pb-4 -mb-4"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">NEED</motion.span></div>
                                <div className="overflow-hidden pb-4 -mb-4"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">ANSWER</motion.span></div>
                            </motion.h2>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1px] bg-[#333] mb-12 relative">
                        <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                        <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    </div>

                    {/* Bottom Layer */}
                    <div className="w-full flex">
                        {/* Empty spacing block to match heading indent */}
                        <div className="hidden md:block md:w-1/4"></div>

                        {/* Paragraph & List */}
                        <div className="w-full md:w-3/4 flex flex-col items-start pr-0">
                            <p className="text-sm md:text-[20px] text-white font-[500] leading-[1.5] mb-12 lg:mb-16 max-w-[800px]" style={{ fontFamily: 'Froople, sans-serif' }}>
                                Whether you're ordering seafood for the first time or looking for a trusted source of fresh prawns, here are answers to some common questions about how we deliver freshness from farm to home.
                            </p>

                            <div className="flex flex-col w-full gap-4">
                                {[
                                    { question: "What makes your prawns fresh?", answer: "Our prawns are harvested directly from carefully maintained freshwater farms. Once harvested, they are immediately cleaned and packed to preserve their natural taste, texture, and freshness before being delivered to your doorstep." },
                                    { question: "Are the prawns cleaned before delivery?", answer: "Yes. Every batch goes through a hygienic cleaning process. The prawns are thoroughly washed and prepared in a controlled environment to ensure they are clean and ready for cooking." },
                                    { question: "How are the prawns packed?", answer: "We use premium, hygienic packaging designed to lock in freshness. Our sealed packaging protects the prawns during transport and maintains their quality until they reach your home." },
                                    { question: "How long does delivery take?", answer: "We focus on fast delivery to maintain freshness. Once your order is placed, our team ensures the prawns are packed and dispatched quickly so they arrive fresh at your doorstep." },
                                    { question: "Do you use preservatives?", answer: "No. We believe seafood should be natural and honest. Our prawns are delivered without preservatives or chemicals, just fresh seafood from farm to home." },
                                    { question: "Where are your prawns sourced from?", answer: "Our prawns come directly from trusted aqua farms where they are raised in clean freshwater ponds by experienced farmers who prioritize quality and sustainability." },
                                ].map((item, index) => {
                                    const isOpen = openFaqIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                            className="flex flex-col bg-[#111111] rounded-[4px] group cursor-pointer hover:bg-[#181818] transition-colors duration-300 w-full overflow-hidden"
                                        >
                                            <div className="flex justify-between items-center py-5 md:py-6 px-5 md:px-8">
                                                <span className="text-[14px] md:text-[16px] font-[500] text-white/80" style={{ fontFamily: 'Froople, sans-serif' }}>
                                                    {item.question}
                                                </span>
                                                <motion.span
                                                    animate={{ rotate: isOpen ? 45 : 0 }}
                                                    transition={{ duration: 0.3, ease: 'backOut' }}
                                                    className="text-[20px] font-light text-white/60 leading-none origin-center"
                                                >
                                                    +
                                                </motion.span>
                                            </div>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="px-5 md:px-8"
                                                    >
                                                        <div className="pb-6 md:pb-8 pt-2">
                                                            <p className="text-[14px] md:text-[15px] text-[#999] font-[400] leading-[1.7] max-w-[90%]" style={{ fontFamily: 'Froople, sans-serif' }}>
                                                                {item.answer}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-[#050505] text-[#888] py-16 px-6 md:px-16 w-full relative z-10 border-t border-white/5" style={{ fontFamily: 'Froople, sans-serif' }}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-8">

                    {/* Brand & Label */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 mb-4 md:mb-0">
                        <h2 className="text-[18px] md:text-xl font-bold text-white tracking-widest uppercase pointer-events-auto">Farm to Home</h2>
                        <p className="text-[12px] md:text-sm tracking-widest uppercase opacity-70">Delivering pristine seafood freshness</p>
                    </div>

                    {/* FSSAI Logo */}
                    <div className="flex flex-col items-center pointer-events-auto">
                        <div className="bg-white/90 p-2 rounded flex items-center justify-center">
                            <img src={fssaiLogo} alt="FSSAI Certified" className="h-[45px] object-contain" />
                        </div>
                    </div>

                    {/* Contact & Socials */}
                    <div className="flex flex-col items-center md:items-end gap-5">
                        <div className="flex gap-6 items-center pointer-events-auto">
                            <a href="tel:+919876543210" className="hover:text-white transition-colors duration-300" title="Call Us">
                                <FaPhoneAlt size={20} />
                            </a>
                            <a href="https://wa.me/919876543210" className="hover:text-green-500 transition-colors duration-300" title="Chat on WhatsApp" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp size={24} />
                            </a>
                            <a href="https://instagram.com" className="hover:text-[#E1306C] transition-colors duration-300" title="Instagram" target="_blank" rel="noopener noreferrer">
                                <FaInstagram size={23} />
                            </a>
                        </div>
                        <p className="text-[11px] md:text-xs tracking-[0.15em] uppercase pointer-events-auto hover:text-white transition-colors">
                            <a href="tel:+919876543210">Contact Us: +91 98765 43210</a>
                        </p>
                    </div>

                </div>
            </footer>

        </div>
    );
};

export default HomeScreen;
