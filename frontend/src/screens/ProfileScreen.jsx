import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const ProfileScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchMyOrders = async () => {
            try {
                const { data } = await api.get('/orders/myorders');
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchMyOrders();
    }, [user, navigate]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
            <div className="glass-card p-6 h-fit text-center">
                <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent/50">
                    <span className="text-4xl font-bold text-accent">{user?.name?.charAt(0)}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
                <p className="opacity-80 mb-6">{user?.email}</p>
                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full glass-button bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg font-bold transition"
                >
                    Logout
                </button>
            </div>

            <div className="md:col-span-3 glass-card p-8">
                <h2 className="text-3xl font-bold mb-6 border-b border-white/20 pb-4">My Orders</h2>

                {loading ? (
                    <div>Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-8 bg-black/10 rounded-xl">
                        <p className="text-lg opacity-80 mb-4">You haven't placed any orders yet.</p>
                        <Link to="/" className="glass-button px-6 py-2 rounded-full inline-block">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/20 text-accent">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">DATE</th>
                                    <th className="p-3">TOTAL</th>
                                    <th className="p-3">PAID</th>
                                    <th className="p-3">STATUS</th>
                                    <th className="p-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b border-white/10 hover:bg-white/5 transition">
                                        <td className="p-3 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                                        <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 font-bold">₹{order.totalPrice}</td>
                                        <td className="p-3">
                                            {order.isPaid ? (
                                                <span className="text-green-400">Paid</span>
                                            ) : (
                                                <span className="text-red-400">No</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Link to={`/order/${order._id}`} className="glass-button px-4 py-1.5 rounded-md text-sm hover:text-accent inline-block">
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileScreen;
