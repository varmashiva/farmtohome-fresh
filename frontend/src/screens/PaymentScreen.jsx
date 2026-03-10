import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../utils/api';

const PaymentScreen = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [loading, setLoading] = useState(false);

    // Live proxy of cart items strictly for mutating inside the payment screen without re-fetching
    const [orderItems, setOrderItems] = useState(cartItems);

    useEffect(() => {
        if (cartItems.length === 0) navigate('/cart');
        const loadRazorpay = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpay();
    }, [cartItems, navigate]);

    // Live Socket Array Mutator natively catching stock exhaustion
    useEffect(() => {
        if (!socket) return;

        const handleStockUpdate = (data) => {
            setOrderItems(prevItems =>
                prevItems.map(item => {
                    if (
                        item.product === data.productId &&
                        item.size === data.size
                    ) {
                        return {
                            ...item,
                            stockStatus: data.stockStatus,
                            overallStockStatus: data.overallStockStatus
                        };
                    }
                    return item;
                })
            );
        };

        socket.on("sizeStockUpdated", handleStockUpdate);

        return () => {
            socket.off("sizeStockUpdated", handleStockUpdate);
        };
    }, [socket]);

    const addressDetails = JSON.parse(localStorage.getItem('checkoutAddress') || '{}');
    const deliveryDate = localStorage.getItem('deliveryDate');
    const totalPrice = orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const hasUnavailableItem = orderItems.some(
        item => item.stockStatus === "outOfStock" || item.overallStockStatus === "outOfStock"
    );

    const handlePayment = async () => {
        if (hasUnavailableItem) {
            alert("Some items in your order are now out of stock. Please update your cart.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create order on our backend (which creates razorpay order)
            const { data: orderData } = await api.post('/payment/create-order', { totalAmount: totalPrice });

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: "INR",
                name: "Farm to Home",
                description: "Premium Seafood Payment",
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment on Backend AND Create Order
                        const { data: verifyData } = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user._id,
                            community: addressDetails.community,
                            address: {
                                fullName: addressDetails.fullName,
                                phone: addressDetails.phone,
                                alternatePhone: addressDetails.alternatePhone,
                                house: addressDetails.house,
                                towerNumber: addressDetails.towerNumber
                            },
                            items: orderItems.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                size: item.selectedSize || item.size,
                                image: item.imageUrl || item.image || item.images?.[0]?.url,
                                product: (item.product && item.product._id) ? item.product._id : (item.product || item.productId || item._id)
                            })),
                            totalAmount: totalPrice,
                            deliveryDate: deliveryDate
                        });

                        if (verifyData.success || verifyData.orderId) {
                            clearCart();
                            localStorage.removeItem('checkoutAddress');
                            localStorage.removeItem('deliveryDate');
                            navigate(`/checkout/success`);
                        }
                    } catch (err) {
                        console.error("Payment verification err:", err);
                        const serverMsg = err.response?.data?.message || err.message || "Payment received but order processing failed. Please contact support.";
                        alert(serverMsg);
                        navigate(`/checkout/failed`);
                    }
                },
                prefill: {
                    name: addressDetails.fullName,
                    email: user.email,
                    contact: addressDetails.phone,
                },
                theme: {
                    color: "#0077b6",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}`);
                navigate(`/checkout/failed`);
            });
        } catch (error) {
            console.error(error);
            alert('Error initiating payment please refresh the page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">

                {/* Back Link */}
                <Link to="/checkout/delivery" className="inline-flex items-center gap-2 text-[10px] md:text-[12px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8 md:mb-12 hover:text-white transition-colors duration-300">
                    <span className="text-[16px] leading-none -mt-[2px]">&larr;</span> BACK TO DELIVERY INFO
                </Link>

                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                            (Checkout Final Step)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start">
                        <h1 className="text-[45px] md:text-[70px] lg:text-[100px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            REVIEW &<br />PAY
                        </h1>
                        {hasUnavailableItem && (
                            <div className="mt-8 inline-block px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px] text-[12px] font-[700] uppercase tracking-widest">
                                Some items are currently sold out. Please update them before proceeding.
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                <div className="w-full flex flex-col xl:flex-row gap-12 lg:gap-20">

                    {/* Left: Shipping Info & Cart Items */}
                    <div className="w-full xl:w-[60%] flex flex-col gap-8">

                        {/* Shipping Info Card */}
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-8 relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <h3 className="text-[18px] md:text-[20px] font-[800] tracking-tight text-[#eaeaea] uppercase mb-6 flex items-center gap-4 relative z-10">
                                Shipping Details
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h3>

                            <div className="relative z-10 flex flex-col gap-2">
                                <span className="text-[14px] md:text-[16px] font-[700] tracking-wide text-white font-mono uppercase">Name: {addressDetails.fullName}</span>
                                <span className="text-[12px] md:text-[13px] font-[600] tracking-widest text-[#888] uppercase font-mono mt-2">Address: {addressDetails.house} (Tower: {addressDetails.towerNumber}), {addressDetails.community}</span>
                                <span className="text-[12px] md:text-[13px] font-[600] tracking-widest text-[#888] uppercase font-mono">Phone: {addressDetails.phone} {addressDetails.alternatePhone ? `| Alt: ${addressDetails.alternatePhone}` : ''}</span>
                                <div className="mt-4 pt-4 border-t border-[#222]">
                                    <span className="text-[12px] md:text-[13px] font-[700] tracking-widest text-green-400 uppercase font-mono">Estimated Delivery: {deliveryDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-8 relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <h3 className="text-[18px] md:text-[20px] font-[800] tracking-tight text-[#eaeaea] uppercase mb-6 flex items-center gap-4 relative z-10">
                                Order Items
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h3>

                            <div className="relative z-10 w-full flex flex-col gap-4">
                                {orderItems.map((item, index) => {
                                    const isOutOfStock = item.stockStatus === 'outOfStock' || item.overallStockStatus === 'outOfStock';
                                    return (
                                        <div key={index} className={`flex items-center gap-4 py-4 border-b border-[#222] last:border-b-0 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}>
                                            <img src={item.imageUrl || item.image || item.images?.[0]?.url} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 object-cover bg-[#111] rounded-[8px]" />
                                            <div className="flex-1 flex flex-col">
                                                <span className="text-[15px] md:text-[18px] font-[800] tracking-tight text-[#eaeaea] uppercase leading-tight">{item.name}</span>
                                                <span className="text-[11px] font-[600] tracking-widest text-[#777] uppercase font-mono mt-1">Size: {item.size} • {item.quantity} kg</span>
                                                {isOutOfStock && (
                                                    <span className="inline-block mt-2 text-[10px] font-[800] bg-red-500/10 text-red-500 px-2 py-1 rounded-[4px] uppercase tracking-widest border border-red-500/20 w-fit">
                                                        Sold Out
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[18px] md:text-[22px] font-[700] tracking-tight text-white/90 font-mono">₹{item.price * item.quantity}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Sticky Card */}
                    <div className="w-full xl:w-[40%]">
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-10 sticky top-[120px] relative overflow-hidden">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <div className="relative z-10 flex flex-col">
                                <h3 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6">Payment Summary</h3>

                                <div className="space-y-6 mb-8">
                                    <div className="flex justify-between items-end pb-6 border-b border-[#222]">
                                        <span className="text-[13px] md:text-[14px] font-[700] tracking-widest uppercase text-[#888]">Order Amount:</span>
                                        <span className="font-[800] text-[36px] md:text-[45px] tracking-tighter leading-none text-white font-mono">
                                            ₹{totalPrice}
                                        </span>
                                    </div>
                                    <div className="py-2 flex items-center gap-3">
                                        <svg className="w-4 h-4 text-[#777]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                        <span className="text-[11px] font-[600] tracking-widest text-[#777] uppercase font-mono">Secured via Razorpay API</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading || hasUnavailableItem}
                                    className={`w-full py-[18px] md:py-[20px] rounded-[4px] font-[800] text-[13px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 mt-2 flex justify-center items-center gap-3 ${hasUnavailableItem ? 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#333]' : 'bg-[#eaeaea] text-[#111] hover:bg-white pb-5 pt-5 relative overflow-hidden group'}`}
                                >
                                    <span className="relative z-10 select-none">
                                        {loading ? 'PROCESSING...' : 'PAY NOW VIA RAZORPAY'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentScreen;
