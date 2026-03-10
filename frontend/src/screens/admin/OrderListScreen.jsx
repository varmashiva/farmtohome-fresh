import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../utils/api';

const OrderListScreen = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [filter, setFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
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

    const printBill = (order) => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>INVOICE - ${order._id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; background: #fff; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
                        .header p { margin: 5px 0 0 0; color: #555; }
                        .details { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
                        .details-col { display: flex; flex-direction: column; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; font-size: 14px; }
                        th { border-bottom: 2px solid #111; padding: 12px 0; text-align: left; text-transform: uppercase; font-size: 12px; color: #555; }
                        td { border-bottom: 1px solid #eee; padding: 12px 0; }
                        .text-right { text-align: right; }
                        .total-row { border-top: 2px solid #111; display: flex; justify-content: flex-end; padding-top: 20px; font-size: 18px; font-weight: bold; }
                        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>FARM TO HOME</h1>
                        <p>Invoice / Receipt</p>
                    </div>
                    
                    <div class="details">
                        <div class="details-col">
                            <strong>BILLED TO:</strong>
                            <span>${order.address?.fullName}</span>
                            <span>${order.address?.house} (Tower: ${order.address?.towerNumber})</span>
                            <span>${order.community}</span>
                            <span>Phone: ${order.address?.phone}</span>
                        </div>
                        <div class="details-col" style="text-align: right;">
                            <strong>ORDER DETAILS:</strong>
                            <span>Order ID: ${order._id.substring(18)}</span>
                            <span>Date: ${new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>Status: ${order.status.toUpperCase()}</span>
                            <span>Payment: ${order.isPaid ? 'PAID' : 'PENDING'}</span>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: center;">Qty</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems.map(item => `
                                <tr>
                                    <td>
                                        <strong>${item.name}</strong><br/>
                                        <span style="color: #666; font-size: 12px;">Size: ${item.size}</span>
                                    </td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td class="text-right">₹${item.price}</td>
                                    <td class="text-right">₹${item.quantity * item.price}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-row">
                        <span style="margin-right: 40px;">TOTAL:</span>
                        <span>₹${order.totalPrice}</span>
                    </div>

                    <div class="footer">
                        Thank you for shopping with Farm to Home!
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        // Allow images/styles to load briefly before triggering print dialog
        setTimeout(() => {
            printWindow.print();
        }, 200);
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
        let communityMatch = true;
        let dateMatch = true;
        let phoneMatch = true;

        if (filter !== 'All') {
            communityMatch = o.community === filter;
        }
        if (dateFilter) {
            // Check if ISO string starts with YYYY-MM-DD
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
                            (Orders Log)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start pr-4 md:pr-0">
                        <h1 className="text-[45px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            ORDER<br />DATABASE
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
                        Master Log
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="relative z-10 w-full overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#333] text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest font-mono">
                                    <th className="py-4 pr-6">ID / Date</th>
                                    <th className="py-4 px-6">Customer</th>
                                    <th className="py-4 px-6">Community</th>
                                    <th className="py-4 px-6">Delivery Date</th>
                                    <th className="py-4 px-6 text-right">Total</th>
                                    <th className="py-4 px-6 text-center">Payment</th>
                                    <th className="py-4 pl-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-[#1a1a1a] hover:bg-[#111]/50 transition-colors group">
                                        <td className="py-5 pr-6 text-[12px] md:text-[13px] text-[#eaeaea]">
                                            <span className="font-mono font-[700] uppercase block mb-1 text-[#888]">{order._id.substring(18)}</span>
                                            <span className="font-[600]">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="block font-[800] text-white uppercase text-[12px] md:text-[13px] mb-1">{order.address?.fullName}</span>
                                            <span className="text-[11px] font-[600] text-[#777] tracking-widest font-mono">House: {order.address?.house} | Tower: {order.address?.towerNumber}</span><br />
                                            <span className="text-[11px] font-[600] text-[#777] tracking-widest font-mono">{order.address?.phone}</span>
                                        </td>
                                        <td className="py-5 px-6 text-[12px] md:text-[13px] font-[600] text-[#888]">{order.community}</td>
                                        <td className="py-5 px-6 text-[12px] md:text-[13px] font-[800] text-green-400 font-mono uppercase">{order.deliveryDate}</td>
                                        <td className="py-5 px-6 text-[14px] md:text-[15px] font-[800] text-white font-mono text-right">₹{order.totalPrice}</td>
                                        <td className="py-5 px-6 text-center">
                                            {order.isPaid ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-[800] uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 rounded-[4px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> PAID
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-[800] uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 rounded-[4px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> PNDG
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-5 pl-6 text-center flex flex-col items-center justify-center gap-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                className={`w-full max-w-[140px] px-3 py-1.5 text-[10px] md:text-[11px] font-[800] uppercase tracking-widest rounded-[4px] border border-[#333] cursor-pointer focus:outline-none focus:border-white transition-all ${order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-white hover:bg-[#222]'}`}
                                            >
                                                <option value="pending" className="text-black">Pending</option>
                                                <option value="confirmed" className="text-black">Confirmed</option>
                                                <option value="out_for_delivery" className="text-black">Out for delivery</option>
                                                <option value="delivered" className="text-black">Delivered</option>
                                                <option value="returned" className="text-black">Returned</option>
                                                <option value="cancelled" className="text-black">Cancelled</option>
                                            </select>
                                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                <button
                                                    onClick={() => cancelOrderHandler(order._id)}
                                                    className="w-full max-w-[140px] mt-1 text-[10px] uppercase font-[700] tracking-widest text-red-500/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-[4px] py-1 transition-all"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                            <button
                                                onClick={() => printBill(order)}
                                                className="w-full max-w-[140px] mt-1 text-[10px] uppercase font-[700] tracking-widest text-[#888] hover:text-white hover:bg-white/10 border border-[#333] hover:border-white/50 rounded-[4px] py-1.5 transition-all flex items-center justify-center gap-2 bg-[#111]"
                                            >
                                                Print Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && <div className="py-12 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">No Records Match This Criteria.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderListScreen;
