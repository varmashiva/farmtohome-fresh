import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../utils/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        comm1Rev: 0,
        comm2Rev: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
                calculateStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchOrders();

        if (socket) {
            socket.on('orderCreated', (newOrder) => {
                setOrders((prev) => [newOrder, ...prev]);
                // Trigger generic re-calculation or add to current stats
                setStats(prev => {
                    let comm1 = prev.comm1Rev;
                    let comm2 = prev.comm2Rev;
                    if (newOrder.shippingAddress.community === 'Community 1') comm1 += newOrder.totalPrice;
                    if (newOrder.shippingAddress.community === 'Community 2') comm2 += newOrder.totalPrice;

                    return {
                        totalOrders: prev.totalOrders + 1,
                        totalRevenue: prev.totalRevenue + newOrder.totalPrice,
                        comm1Rev: comm1,
                        comm2Rev: comm2
                    };
                });
            });
        }

        return () => {
            if (socket) socket.off('orderCreated');
        };
    }, [user, navigate, socket]);

    const calculateStats = (data) => {
        let rev = 0;
        let c1 = 0;
        let c2 = 0;

        data.forEach(order => {
            if (order.isPaid) {
                rev += order.totalPrice;
                if (order.shippingAddress.community === 'Community 1') c1 += order.totalPrice;
                if (order.shippingAddress.community === 'Community 2') c2 += order.totalPrice;
            }
        });

        setStats({
            totalOrders: data.length,
            totalRevenue: rev,
            comm1Rev: c1,
            comm2Rev: c2
        });
    };

    return (
        <div className="max-w-6xl mx-auto mt-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold border-b-4 border-accent pb-2 inline-block">Admin Dashboard</h1>
                <div className="space-x-4">
                    <Link to="/admin/products" className="glass-button px-6 py-2 rounded-lg font-bold">Manage Products</Link>
                    <Link to="/admin/orders" className="glass-button px-6 py-2 rounded-lg font-bold">All Orders</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-400">
                    <h3 className="text-lg font-medium opacity-80 uppercase tracking-wider mb-2">Total Orders</h3>
                    <p className="text-4xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-green-400">
                    <h3 className="text-lg font-medium opacity-80 uppercase tracking-wider mb-2">Total Revenue</h3>
                    <p className="text-4xl font-bold text-green-300">₹{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-400">
                    <h3 className="text-lg font-medium opacity-80 uppercase tracking-wider mb-2">Community 1 Rev</h3>
                    <p className="text-4xl font-bold text-purple-300">₹{stats.comm1Rev.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-pink-400">
                    <h3 className="text-lg font-medium opacity-80 uppercase tracking-wider mb-2">Community 2 Rev</h3>
                    <p className="text-4xl font-bold text-pink-300">₹{stats.comm2Rev.toFixed(2)}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Recent Live Orders</h2>
            <div className="glass-card p-6 rounded-2xl overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20 text-accent uppercase text-sm">
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Community</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 5).map((order) => (
                            <tr key={order._id} className="border-b border-white/10 hover:bg-white/5 transition duration-200">
                                <td className="p-4 relative">
                                    {/* Ping animation to indicate recent/live */}
                                    {new Date().getTime() - new Date(order.createdAt).getTime() < 60000 && (
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                        </span>
                                    )}
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </td>
                                <td className="p-4 font-semibold">{order.shippingAddress.name}</td>
                                <td className="p-4">{order.shippingAddress.community}</td>
                                <td className="p-4 font-bold text-green-300">₹{order.totalPrice}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'Pending' ? 'bg-orange-500/20 text-orange-400' :
                                            order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <Link to={`/order/${order._id}`} className="hover:text-accent font-medium text-sm underline underline-offset-4">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="6" className="p-8 text-center opacity-70">No orders yet. Waiting for live orders...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
