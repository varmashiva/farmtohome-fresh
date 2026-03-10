import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../utils/api';

const ProfileScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
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

    useEffect(() => {
        if (!socket) return;

        socket.on('orderStatusUpdated', (data) => {
            setOrders(prevOrders => prevOrders.map(o =>
                o._id === data.orderId ? { ...o, status: data.status } : o
            ));
        });

        return () => {
            socket.off('orderStatusUpdated');
        };
    }, [socket]);

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">

                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-white/50 block mt-4 uppercase font-mono">
                            (User Portal)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start">
                        <h1 className="text-[45px] md:text-[70px] lg:text-[100px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            MY<br />PROFILE
                        </h1>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left: User Card */}
                    <div className="w-full lg:w-[30%]">
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-10 sticky top-[120px] relative overflow-hidden flex flex-col items-center">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <div className="relative z-10 flex flex-col items-center w-full">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mb-6 overflow-hidden">
                                    <span className="text-[40px] md:text-[50px] font-[900] text-[#eaeaea] uppercase font-mono leading-none">{user?.name?.charAt(0)}</span>
                                </div>

                                <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter text-[#eaeaea] uppercase mb-1">{user?.name}</h2>
                                <p className="text-[12px] md:text-[13px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8">{user?.email}</p>

                                <div className="w-full text-left bg-[#111] p-5 rounded-[8px] border border-[#222] mb-8 relative">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[10px] md:text-[11px] font-[800] tracking-widest text-[#666] uppercase font-mono">
                                            Shipping Details
                                        </h3>
                                        <Link to="/checkout/address" className="text-[10px] font-[800] tracking-widest text-blue-400 hover:text-white uppercase transition-colors">
                                            EDIT
                                        </Link>
                                    </div>

                                    {(() => {
                                        const savedAddressRaw = localStorage.getItem('checkoutAddress');
                                        const savedAddress = savedAddressRaw ? JSON.parse(savedAddressRaw) : null;

                                        if (savedAddress) {
                                            return (
                                                <div className="flex flex-col gap-1 font-mono text-[11px] md:text-[12px] text-[#888] tracking-widest">
                                                    <span className="text-white font-[700] uppercase font-sans text-[12px] md:text-[13px] tracking-tight mb-2 block">{savedAddress.fullName || user?.name}</span>
                                                    <span>Ph: {savedAddress.phone || 'N/A'}</span>
                                                    {savedAddress.alternatePhone && <span>Alt: {savedAddress.alternatePhone}</span>}
                                                    <span className="mt-2 block">House: {savedAddress.house || 'N/A'}</span>
                                                    <span>Tower: {savedAddress.towerNumber || 'N/A'}</span>
                                                    <span className="text-[#aaa] font-[600] mt-1 block">{savedAddress.community || 'N/A'}</span>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="text-[11px] text-[#555] font-mono tracking-widest uppercase py-2">
                                                    No default address. <br /><Link to="/checkout/address" className="text-white text-[10px] underline mt-2 inline-block">Add Details</Link>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                <div className="w-full border-t border-[#222] pt-8">
                                    <button
                                        onClick={() => { logout(); navigate('/'); }}
                                        className="w-full py-[16px] rounded-[4px] font-[800] text-[12px] md:text-[13px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#111] text-[#777] border border-[#333] hover:text-red-500 hover:border-red-500/30"
                                    >
                                        LOG OUT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Orders History */}
                    <div className="w-full lg:w-[70%]">
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col flex-1">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                                Order History
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h2>

                            <div className="relative z-10 w-full overflow-x-auto pb-4">
                                {loading ? (
                                    <div className="py-12 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">Loading records...</div>
                                ) : orders.length === 0 ? (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <p className="text-[16px] md:text-[18px] font-[600] tracking-tight text-[#888] mb-8">No order history found.</p>
                                        <Link to="/" className="px-6 py-3 bg-[#eaeaea] text-[#111] font-[800] text-[12px] uppercase tracking-[0.1em] rounded-[4px] hover:bg-white transition-all duration-300">
                                            EXPLORE PRODUCTS
                                        </Link>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-[#333] text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest font-mono">
                                                <th className="py-4 pr-6">Order ID</th>
                                                <th className="py-4 px-6">Date</th>
                                                <th className="py-4 px-6 text-right">Total</th>
                                                <th className="py-4 px-6 text-center">Payment</th>
                                                <th className="py-4 px-6 text-center">Status</th>
                                                <th className="py-4 pl-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order._id} className="border-b border-[#1a1a1a] hover:bg-[#111]/50 transition-colors group">
                                                    <td className="py-5 pr-6 font-mono text-[12px] md:text-[13px] text-[#eaeaea] font-[700] uppercase">{order._id.substring(0, 8)}...</td>
                                                    <td className="py-5 px-6 text-[12px] md:text-[13px] font-[600] text-[#888]">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-5 px-6 text-[14px] md:text-[15px] font-[800] text-white font-mono text-right">₹{order.totalPrice}</td>
                                                    <td className="py-5 px-6 text-center">
                                                        {order.isPaid ? (
                                                            <span className="inline-block px-2 py-1 text-[10px] font-[800] uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 rounded-[4px]">Paid</span>
                                                        ) : (
                                                            <span className="inline-block px-2 py-1 text-[10px] font-[800] uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px]">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        <span className={`inline-block px-2 py-1 text-[10px] font-[800] uppercase tracking-widest rounded-[4px] border ${(order.status === 'delivered' || order.status === 'confirmed') ? 'bg-green-500/20 text-green-400 border-green-500/30' : (order.status === 'cancelled' || order.status === 'returned') ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#1a1a1a] text-white border-[#333]'}`}>
                                                            {order.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 pl-6 text-right">
                                                        <Link to={`/order/${order._id}`} className="text-[11px] md:text-[12px] font-[700] uppercase tracking-widest text-[#777] border-b border-transparent group-hover:text-white group-hover:border-white transition-all pb-0.5">
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
