import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const OrderScreen = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders`);
                const foundOrder = data.find(o => o._id === id); // Ideally should be GET /orders/:id
                // We'll update backend to have GET /orders/:id later or just get from myorders
            } catch (error) {
                console.error(error);
            }
        };

        // Quick fix: Fetch all user orders and find it
        const fetchMyOrders = async () => {
            try {
                const { data } = await api.get('/orders/myorders');
                const myOrder = data.find(o => o._id === id);

                // If not found in my orders, might be admin viewing
                if (myOrder) {
                    setOrder(myOrder);
                } else {
                    const res = await api.get('/orders');
                    setOrder(res.data.find(o => o._id === id));
                }

                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchMyOrders();
    }, [id]);

    if (loading) return <div className="text-center mt-20">Loading order details...</div>;
    if (!order) return <div className="text-center mt-20 text-red-400">Order not found.</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                {/* Success Banner */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

                <h1 className="text-3xl font-bold mb-2">Order Confirmed! 🎉</h1>
                <p className="text-lg opacity-80 mb-8 border-b border-white/20 pb-4">
                    Order ID: <span className="font-mono text-accent">{order._id}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-3 text-accent border-b border-white/20 pb-1 w-fit">Shipping Address</h2>
                            <p className="leading-relaxed">
                                <span className="font-semibold block">{order.address?.fullName}</span>
                                {order.address?.house}<br />
                                <span className="font-semibold">{order.community}</span><br />
                                Phone: {order.address?.phone}
                                {order.address?.alternatePhone && ` | Alt: ${order.address?.alternatePhone}`}
                            </p>
                            <p className="mt-3 font-bold text-green-300">
                                Expected Delivery: {order.deliveryDate}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-3 text-accent border-b border-white/20 pb-1 w-fit">Order Status</h2>
                            <div className={`inline-block px-4 py-2 rounded-lg font-bold ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                                order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                                    'bg-blue-500/20 text-blue-300 border border-blue-500'
                                }`}>
                                {order.status}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-3 text-accent border-b border-white/20 pb-1 w-fit">Payment Information</h2>
                            <p className="font-medium">Method: {order.paymentMethod}</p>
                            {order.isPaid ? (
                                <div className="mt-2 text-green-300 font-bold bg-green-500/10 p-3 rounded-lg border border-green-500/30 flex items-center gap-2">
                                    <span>✓ Paid on {new Date(order.paidAt).toLocaleDateString()}</span>
                                </div>
                            ) : (
                                <div className="mt-2 text-red-400 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                                    Not Paid
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-black/20 rounded-xl max-h-[500px] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">Order Items</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <img src={item.imageUrl || item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                        <div>
                                            <Link to={`/product/${item.product}`} className="font-semibold hover:text-accent">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm opacity-80">{item.quantity} kg @ ₹{item.price}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold">₹{item.quantity * item.price}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-xl">
                            <span className="font-bold">Grand Total</span>
                            <span className="font-bold text-accent">₹{order.totalPrice}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;
