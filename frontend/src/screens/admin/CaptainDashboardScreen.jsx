import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../utils/api';

const CaptainDashboardScreen = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [filter, setFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');

    useEffect(() => {
        const captainEmails = ['farmtohome666@gmail.com', 'shivavarma336@gmail.com', 'vinnugollakoti289@gmail.com'];
        if (!user || (user.role !== 'admin' && !captainEmails.includes(user.email))) {
            navigate('/login');
            return;
        }

        const fetchOrdersAndCommunities = async () => {
            try {
                const [ordersRes, communitiesRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/communities')
                ]);
                setOrders(ordersRes.data);
                setCommunities(communitiesRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchOrdersAndCommunities();
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

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const filteredOrders = orders.filter(o => {
        let communityMatch = true;
        let dateMatch = true;
        let phoneMatch = true;

        if (filter !== 'All') {
            communityMatch = o.community === filter;
        }
        if (dateFilter) {
            dateMatch = o.createdAt && o.createdAt.startsWith(dateFilter);
        }
        if (phoneFilter) {
            phoneMatch = o.address?.phone && o.address.phone.includes(phoneFilter);
        }

        return communityMatch && dateMatch && phoneMatch;
    });

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full mb-12">
                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mt-4 uppercase font-mono">
                            (Delivery Hub)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start pr-4 md:pr-0">
                        <h1 className="text-[45px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            CAPTAIN<br />DASHBOARD
                        </h1>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-8 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                {/* Filters Section */}
                <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-start md:items-end mb-8 bg-[#0c0c0c] border border-[#1a1a1a] p-6 lg:p-8 rounded-[12px] shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="flex flex-col gap-2 flex-1 md:flex-none">
                            <label className="text-[#666] text-[10px] uppercase tracking-widest font-mono">Date Segment</label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-[#111] border border-[#333] text-white px-4 py-3 rounded-[4px] text-[12px] font-[600] uppercase focus:outline-none focus:border-white/50 cursor-pointer min-w-[150px]"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 md:flex-none">
                            <label className="text-[#666] text-[10px] uppercase tracking-widest font-mono">Phone Tracking</label>
                            <input
                                type="text"
                                placeholder="Digits Match..."
                                value={phoneFilter}
                                onChange={(e) => setPhoneFilter(e.target.value)}
                                className="bg-[#111] border border-[#333] text-white px-4 py-3 rounded-[4px] text-[12px] font-[600] tracking-widest focus:outline-none focus:border-white/50 font-mono placeholder-[#555] min-w-[150px]"
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 md:flex-none">
                            <label className="text-[#666] text-[10px] uppercase tracking-widest font-mono">Region Filter</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-[#111] border border-[#333] text-white pl-4 pr-10 py-3 rounded-[4px] text-[12px] font-[600] uppercase tracking-wider focus:outline-none focus:border-white/50 cursor-pointer min-w-[150px]"
                            >
                                <option value="All">All Regions</option>
                                {communities.map(c => (
                                    <option key={c._id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(filter !== 'All' || dateFilter || phoneFilter) && (
                        <button
                            onClick={() => {
                                setFilter('All');
                                setDateFilter('');
                                setPhoneFilter('');
                            }}
                            className="w-full md:w-auto bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-6 py-3 rounded-[4px] text-[12px] font-[800] uppercase tracking-wider transition-colors mt-2 md:mt-0"
                        >
                            CLEAR FILTERS
                        </button>
                    )}
                </div>

                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                        Delivery Logistics
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="relative z-10 w-full overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#333] text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest font-mono">
                                    <th className="py-4 pr-6">ID / Date</th>
                                    <th className="py-4 px-6">Shipping Address Details</th>
                                    <th className="py-4 px-6 text-center">Payment</th>
                                    <th className="py-4 pl-6 text-center">Deliver Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-[#1a1a1a] hover:bg-[#111]/50 transition-colors group">
                                        <td className="py-5 pr-6 text-[12px] md:text-[13px] text-[#eaeaea] align-top">
                                            <span className="font-mono font-[700] uppercase block mb-1 text-[#888]">{order._id.substring(18)}</span>
                                            <span className="font-[600] block">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="font-mono text-green-400 font-[800] text-[14px]">₹{order.totalPrice}</span>
                                        </td>
                                        <td className="py-5 px-6 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-[800] text-white uppercase text-[12px] md:text-[13px]">{order.address?.fullName}</span>
                                                <span className="text-[12px] font-[600] text-[#aaa]">House: {order.address?.house} | Tower: {order.address?.towerNumber} | {order.community}</span>
                                                <div className="flex flex-col gap-1 mt-1 font-mono tracking-widest">
                                                    <span className="text-[11px] font-[600] text-blue-400">PHONE: {order.address?.phone}</span>
                                                    {order.address?.alternatePhone && <span className="text-[11px] font-[600] text-purple-400">ALT: {order.address?.alternatePhone}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center align-middle">
                                            {order.isPaid ? (
                                                <span className="inline-flex flex-col items-center gap-1.5 px-3 py-2 text-[10px] font-[800] uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 rounded-[4px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> PAID
                                                </span>
                                            ) : (
                                                <span className="inline-flex flex-col items-center gap-1.5 px-3 py-2 text-[10px] font-[800] uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Collect Cash
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-5 pl-6 text-center align-middle flex flex-col items-center justify-center gap-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                className={`w-full max-w-[150px] px-3 py-2 text-[10px] md:text-[11px] font-[800] uppercase tracking-widest rounded-[4px] border border-[#333] cursor-pointer focus:outline-none focus:border-white transition-all ${order.status === 'cancelled' || order.status === 'returned' ? 'bg-red-500/20 text-red-400 border-red-500/30' : order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-white hover:bg-[#222]'}`}
                                            >
                                                <option value="pending" className="text-black">Pending</option>
                                                <option value="confirmed" className="text-black">Confirmed</option>
                                                <option value="out_for_delivery" className="text-black">Out for delivery</option>
                                                <option value="delivered" className="text-black">Delivered</option>
                                                <option value="returned" className="text-black">Returned</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && <div className="py-12 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">No Local Dispatches Found.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaptainDashboardScreen;
