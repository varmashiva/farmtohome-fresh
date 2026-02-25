import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const PaymentScreen = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

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

    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
    const deliveryDate = localStorage.getItem('deliveryDate');
    const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create order on our backend (which creates razorpay order)
            const { data: orderData } = await api.post('/payment/create-order', { amount: totalPrice });

            const options = {
                key: 'rzp_test_ur_key_here', // Real key should be fetched from backend or env, hardcoded test key pattern here for UI
                amount: orderData.amount,
                currency: "INR",
                name: "Fresh Prawns",
                description: "Premium Seafood Payment",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment on Backend
                        await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // 3. Save Order to Database
                        const { data: dbOrder } = await api.post('/orders', {
                            orderItems: cartItems,
                            shippingAddress,
                            deliveryDate,
                            paymentMethod: 'Razorpay',
                            totalPrice,
                            isPaid: true,
                            paymentResult: {
                                id: response.razorpay_payment_id,
                                status: 'Paid',
                                update_time: new Date().toISOString(),
                                email_address: user.email
                            }
                        });

                        clearCart();
                        localStorage.removeItem('shippingAddress');
                        localStorage.removeItem('deliveryDate');
                        navigate(`/order/${dbOrder._id}`);
                    } catch (err) {
                        console.error(err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: shippingAddress.phoneNumber,
                },
                theme: {
                    color: "#0077b6",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}`);
            });
        } catch (error) {
            console.error(error);
            alert('Error initiating payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h2 className="text-3xl font-bold mb-8 text-center drop-shadow-md">Review & Pay</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Shipping Information</h3>
                        <p className="opacity-90 leading-relaxed font-medium">
                            {shippingAddress.name}<br />
                            {shippingAddress.address}<br />
                            {shippingAddress.city}, {shippingAddress.pincode}<br />
                            {shippingAddress.community}<br />
                            Phone: {shippingAddress.phoneNumber}
                        </p>
                        <p className="mt-4 pt-4 border-t border-white/20 font-bold text-lg text-accent">
                            Delivery: {deliveryDate}
                        </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Order Items</h3>
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <img src={item.imageUrl || item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm opacity-80">{item.quantity} kg</p>
                                        </div>
                                    </div>
                                    <div className="font-bold">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
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
                        disabled={loading}
                        className="w-full glass-button bg-blue-600/50 hover:bg-blue-500/60 py-4 rounded-xl font-bold border-2 border-blue-400 text-xl tracking-wider shadow-lg disabled:opacity-50 flex justify-center items-center gap-3"
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
