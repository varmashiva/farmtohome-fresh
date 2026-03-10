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

        const fetchData = async () => {
            try {
                const [ordersRes, revenueRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/admin/revenue')
                ]);
                setOrders(ordersRes.data);

                const revData = revenueRes.data;
                setStats({
                    totalOrders: revData.totalOrders,
                    totalRevenue: revData.totalRevenue,
                    comm1Rev: revData.community1Revenue,
                    comm2Rev: revData.community2Revenue
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();

        if (socket) {
            socket.on('orderCreated', (newOrder) => {
                setOrders((prev) => [newOrder, ...prev]);
                // Trigger generic re-calculation or add to current stats
                setStats(prev => {
                    let comm1 = prev.comm1Rev;
                    let comm2 = prev.comm2Rev;
                    if (newOrder.community === 'Community 1') comm1 += newOrder.totalPrice;
                    if (newOrder.community === 'Community 2') comm2 += newOrder.totalPrice;

                    return {
                        totalOrders: prev.totalOrders + 1,
                        totalRevenue: prev.totalRevenue + newOrder.totalPrice,
                        comm1Rev: comm1,
                        comm2Rev: comm2
                    };
                });
            });

            socket.on('orderCancelled', (data) => {
                // Instantly sync the local table to reflect cancellation
                setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, status: 'cancelled' } : o));

                // Subtract revenue matching backend logic natively
                setStats(prev => {
                    let comm1 = prev.comm1Rev;
                    let comm2 = prev.comm2Rev;
                    if (data.community === 'Community 1') comm1 -= data.totalAmount;
                    if (data.community === 'Community 2') comm2 -= data.totalAmount;

                    return {
                        totalOrders: Math.max(0, prev.totalOrders - 1),
                        totalRevenue: Math.max(0, prev.totalRevenue - data.totalAmount),
                        comm1Rev: Math.max(0, comm1),
                        comm2Rev: Math.max(0, comm2)
                    };
                });
            });
        }

        return () => {
            if (socket) {
                socket.off('orderCreated');
                socket.off('orderCancelled');
            }
        };
    }, [user, navigate, socket]);

    // We rely mostly on the backend for heavy initial calculation. 
    // Live increments added via socket below are kept lightweight.

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full mb-12">
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between pb-6 md:pb-12 relative gap-6 md:gap-0">
                    <div className="w-full md:w-1/2 text-left flex flex-col items-start">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono">
                            (Command Center)
                        </span>
                        <h1 className="text-[40px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            ADMIN<br />DASHBOARD
                        </h1>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-wrap justify-end gap-4 mt-6 md:mt-0">
                        <Link to="/admin/products" className="py-3 px-4 md:px-6 rounded-[4px] font-[800] text-[10px] md:text-[12px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#111] text-[#eaeaea] border border-[#333] hover:bg-white hover:text-black hover:border-white shadow-xl">Products</Link>
                        <Link to="/admin/orders" className="py-3 px-4 md:px-6 rounded-[4px] font-[800] text-[10px] md:text-[12px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#111] text-[#eaeaea] border border-[#333] hover:bg-white hover:text-black hover:border-white shadow-xl">Orders</Link>
                        <Link to="/admin/users" className="py-3 px-4 md:px-6 rounded-[4px] font-[800] text-[10px] md:text-[12px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#111] text-[#eaeaea] border border-[#333] hover:bg-white hover:text-black hover:border-white shadow-xl">Users</Link>
                        <Link to="/admin/communities" className="py-3 px-4 md:px-6 rounded-[4px] font-[800] text-[10px] md:text-[12px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#111] text-[#eaeaea] border border-[#333] hover:bg-white hover:text-black hover:border-white shadow-xl">Communities</Link>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 relative overflow-hidden flex flex-col group hover:border-[#333] transition-colors">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 group-hover:bg-blue-400 transition-colors"></div>
                    <h3 className="text-[11px] md:text-[12px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono relative z-10">Total Orders</h3>
                    <p className="text-[36px] font-[900] tracking-tighter text-[#eaeaea] leading-none relative z-10">{stats.totalOrders}</p>
                </div>
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 relative overflow-hidden flex flex-col group hover:border-[#333] transition-colors">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50 group-hover:bg-green-400 transition-colors"></div>
                    <h3 className="text-[11px] md:text-[12px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono relative z-10">Total Revenue</h3>
                    <p className="text-[36px] font-[900] tracking-tighter  font-mono leading-none relative z-10">₹{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 relative overflow-hidden flex flex-col group hover:border-[#333] transition-colors">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50 group-hover:bg-purple-400 transition-colors"></div>
                    <h3 className="text-[11px] md:text-[12px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono relative z-10">Comm 1 Rev</h3>
                    <p className="text-[36px] font-[900] tracking-tighter font-mono leading-none relative z-10">₹{stats.comm1Rev.toFixed(2)}</p>
                </div>
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 relative overflow-hidden flex flex-col group hover:border-[#333] transition-colors">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500/50 group-hover:bg-pink-400 transition-colors"></div>
                    <h3 className="text-[11px] md:text-[12px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono relative z-10">Comm 2 Rev</h3>
                    <p className="text-[36px] font-[900] tracking-tighter font-mono leading-none relative z-10">₹{stats.comm2Rev.toFixed(2)}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 lg:p-10 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                        Recent Live Orders
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="relative z-10 w-full overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#333] text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest font-mono">
                                    <th className="py-4 pr-6">Time</th>
                                    <th className="py-4 px-6">Customer</th>
                                    <th className="py-4 px-6">Community</th>
                                    <th className="py-4 px-6 text-right">Total</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 pl-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="border-b border-[#1a1a1a] hover:bg-[#111]/50 transition-colors group">
                                        <td className="py-5 pr-6 font-mono text-[12px] md:text-[13px] text-[#eaeaea] font-[700] uppercase relative">
                                            {/* Ping animation to indicate recent/live */}
                                            {new Date().getTime() - new Date(order.createdAt).getTime() < 60000 && (
                                                <span className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                </span>
                                            )}
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="py-5 px-6 text-[12px] md:text-[13px] font-[800] text-white uppercase">{order.address?.fullName}</td>
                                        <td className="py-5 px-6 text-[12px] md:text-[13px] font-[600] text-[#888]">{order.community}</td>
                                        <td className="py-5 px-6 text-[14px] md:text-[15px] font-[800] text-green-400 font-mono text-right">₹{order.totalPrice}</td>
                                        <td className="py-5 px-6 text-center">
                                            <span className={`inline-block px-2 py-1 text-[10px] font-[800] uppercase tracking-widest rounded-[4px] border ${order.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-5 pl-6 text-right">
                                            <Link to={`/order/${order._id}`} className="text-[11px] md:text-[12px] font-[700] uppercase tracking-widest text-[#777] border-b border-transparent group-hover:text-white group-hover:border-white transition-all pb-0.5">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">
                                            Awaiting live signals...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
