import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const OrderListScreen = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchOrders();
    }, [user, navigate]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const cancelOrderHandler = async (id) => {
        if (window.confirm('Are you certain you want to cancel this order?')) {
            try {
                await api.put(`/orders/${id}/cancel`);
                setOrders(orders.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
            } catch (err) {
                alert("Failed to cancel order");
            }
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'All') return true;
        return o.community === filter;
    });

    return (
        <div className="max-w-7xl mx-auto mt-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="glass-input p-2 rounded-lg text-black bg-white/90 cursor-pointer"
                >
                    <option value="All">All Communities</option>
                    <option value="Community 1">Community 1</option>
                    <option value="Community 2">Community 2</option>
                </select>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-black/20 text-accent border-b border-white/10 uppercase text-xs font-bold tracking-wider">
                                <th className="p-4">ID / Date</th>
                                <th className="p-4">Customer Details</th>
                                <th className="p-4">Community</th>
                                <th className="p-4">Delivery Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Status & Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-white/5 transition">
                                    <td className="p-4">
                                        <span className="font-mono text-sm block opacity-70 mb-1">{order._id.substring(18)}</span>
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="block font-bold mb-1">{order.address?.fullName}</span>
                                        <span className="text-sm opacity-80">{order.address?.phone}</span>
                                    </td>
                                    <td className="p-4">{order.community}</td>
                                    <td className="p-4 font-semibold text-green-300">{order.deliveryDate}</td>
                                    <td className="p-4 font-bold text-lg">₹{order.totalPrice}</td>
                                    <td className="p-4">
                                        {order.isPaid ? (
                                            <span className="inline-flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-bold uppercase">
                                                ✓ Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold uppercase">
                                                ✗ Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 space-y-2">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className={`w-full p-2 text-sm font-bold rounded-lg cursor-pointer ${order.status === 'cancelled' ? 'bg-red-500 text-white' :
                                                order.status === 'delivered' ? 'bg-green-500 text-white' :
                                                    'bg-white text-black'
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="out_for_delivery">Out for delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                            <button
                                                onClick={() => cancelOrderHandler(order._id)}
                                                className="w-full mt-2 text-xs uppercase font-bold text-red-400 hover:text-red-300 border border-red-500/30 rounded py-1 transition"
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && <div className="text-center p-10 opacity-70">No orders found for this filter.</div>}
                </div>
            </div>
        </div>
    );
};

export default OrderListScreen;
