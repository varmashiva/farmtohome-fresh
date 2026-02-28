import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        window.location.reload();
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
                name: "Fresh Prawns",
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
                                house: addressDetails.house
                            },
                            items: orderItems.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                size: item.selectedSize || item.size,
                                image: item.imageUrl || item.image || item.images?.[0]?.url,
                                product: item.product || item.productId || item._id
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
                        if (err.response && err.response.status === 400) {
                            navigate(`/checkout/failed`);
                        } else {
                            alert("Payment received but order processing failed. Please contact support.");
                        }
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
        <div className="max-w-4xl mx-auto mt-10">
            <h2 className="text-3xl font-bold mb-8 text-center drop-shadow-md">Review & Pay</h2>

            {hasUnavailableItem && (
                <div className="mb-8 p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-100 text-lg font-bold text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    Some items in your order are now out of stock. Please remove or update them before proceeding.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Shipping Information</h3>
                        <p className="opacity-90 leading-relaxed font-medium">
                            <span className="font-bold text-lg">{addressDetails.fullName}</span><br />
                            {addressDetails.house}<br />
                            {addressDetails.community}<br />
                            Phone: {addressDetails.phone}
                            {addressDetails.alternatePhone && ` | Alt: ${addressDetails.alternatePhone}`}
                        </p>
                        <p className="mt-4 pt-4 border-t border-white/20 font-bold text-lg text-accent">
                            Delivery: {deliveryDate}
                        </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Order Items</h3>
                        <div className="space-y-4">
                            {orderItems.map((item, index) => {
                                const isOutOfStock = item.stockStatus === 'outOfStock' || item.overallStockStatus === 'outOfStock';
                                return (
                                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${isOutOfStock ? 'bg-red-500/10 border border-red-500/50 opacity-50 grayscale' : 'bg-white/5'}`}>
                                        <div className="flex items-center gap-4">
                                            <img src={item.imageUrl || item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm opacity-80">{item.quantity} kg</p>
                                                {isOutOfStock && (
                                                    <span className="inline-block mt-1 text-xs font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-wider border border-red-500/20">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-bold">₹{item.price * item.quantity}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 h-fit sticky top-24 rounded-2xl border-2 border-white/30">
                    <h3 className="text-2xl font-bold mb-6 text-center">Payment Details</h3>
                    <div className="flex justify-between items-center text-xl mb-6 bg-white/10 p-4 rounded-xl">
                        <span className="font-medium">Total Amount to Pay</span>
                        <span className="font-bold text-3xl text-accent drop-shadow-md">₹{totalPrice}</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading || hasUnavailableItem}
                        className={`w-full glass-button py-4 rounded-xl font-bold border-2 text-xl tracking-wider shadow-lg flex justify-center items-center gap-3 transition-all duration-300 ${hasUnavailableItem ? 'bg-gray-600/50 border-gray-500/50 text-white/50 cursor-not-allowed saturate-0' : 'bg-blue-600/50 hover:bg-blue-500/60 border-blue-400'}`}
                    >
                        {loading ? 'Processing...' : 'Pay with Razorpay 🔒'}
                    </button>
                    <p className="text-center text-sm mt-4 opacity-70">Secured via Razorpay Checkout</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentScreen;
