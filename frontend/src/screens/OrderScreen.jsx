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

    if (loading) return <div className="min-h-screen bg-black text-[#ededed] flex items-center justify-center pt-32 pb-24 font-mono text-sm tracking-widest uppercase">Fetching Order Data...</div>;
    if (!order) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center pt-32 pb-24 font-mono text-sm tracking-widest uppercase">Order Not Found.</div>;

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full">

                {/* Back Link */}
                <Link to="/profile" className="inline-flex items-center gap-2 text-[10px] md:text-[12px] font-[600] tracking-widest text-[#777] uppercase font-mono mb-8 md:mb-12 hover:text-white transition-colors duration-300">
                    <span className="text-[16px] leading-none -mt-[2px]">&larr;</span> MY ORDERS
                </Link>

                <div className="w-full flex flex-col md:flex-row md:items-end justify-between pb-6 md:pb-12 relative gap-6 md:gap-0">
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-green-400 block mb-4 uppercase font-mono border border-green-500/30 bg-green-500/10 px-3 py-1 rounded-[4px] shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                            Order Confirmed
                        </span>
                        <h1 className="text-[40px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            ORDER<br />DETAILS
                        </h1>
                    </div>
                    <div className="w-full md:w-1/4 flex flex-col items-start md:items-end">
                        <span className="text-[#666] text-[10px] uppercase tracking-widest font-mono mb-1">Receipt No.</span>
                        <span className="text-[14px] md:text-[16px] font-[700] tracking-widest text-white uppercase font-mono break-all text-right">{order._id}</span>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                <div className="w-full flex flex-col xl:flex-row gap-12 lg:gap-20">

                    {/* Left: Info Blocks */}
                    <div className="w-full xl:w-[55%] flex flex-col gap-8">

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Order Status */}
                            <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 lg:p-8 relative overflow-hidden flex flex-col">
                                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                                <h2 className="text-[16px] font-[800] mb-6 text-[#eaeaea] border-b border-[#222] pb-4 uppercase tracking-wider relative z-10 w-full flex items-center justify-between">
                                    Status
                                    <span className="h-[4px] w-[4px] rounded-full bg-[#eaeaea]"></span>
                                </h2>
                                <div className="relative z-10">
                                    <span className={`inline-block px-4 py-2 rounded-[4px] font-[700] text-[12px] uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-[#eaeaea] text-[#111] border border-[#eaeaea]'}`}>
                                        {order.status}
                                    </span>
                                    <p className="mt-6 font-[700] text-[12px] text-[#777] uppercase tracking-widest font-mono">
                                        Expected Delivery:<br />
                                        <span className="text-white text-[14px] mt-1 inline-block">{order.deliveryDate}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 lg:p-8 relative overflow-hidden flex flex-col">
                                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                                <h2 className="text-[16px] font-[800] mb-6 text-[#eaeaea] border-b border-[#222] pb-4 uppercase tracking-wider relative z-10 w-full flex items-center justify-between">
                                    Payment
                                    <span className="h-[4px] w-[4px] rounded-full bg-[#eaeaea]"></span>
                                </h2>
                                <div className="relative z-10">
                                    <p className="font-[600] text-[#888] text-[12px] uppercase tracking-widest font-mono mb-4">Method: <span className="text-white ml-2">{order.paymentMethod}</span></p>
                                    {order.isPaid ? (
                                        <div className="text-green-400 font-[800] bg-green-500/5 p-4 rounded-[8px] border border-green-500/20 flex flex-col gap-1 text-[12px] uppercase tracking-widest">
                                            <span>✓ Transaction Paid</span>
                                            <span className="text-[10px] text-green-400/70 font-mono mt-1">{new Date(order.paidAt).toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="text-red-400 font-[800] bg-red-500/5 p-4 rounded-[8px] border border-red-500/20 text-[12px] uppercase tracking-widest">
                                            Pending Payment
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-10 relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <h2 className="text-[18px] md:text-[20px] font-[800] tracking-tight text-[#eaeaea] uppercase mb-6 flex items-center gap-4 relative z-10">
                                Shipping Address
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h2>

                            <div className="relative z-10 flex flex-col gap-3">
                                <span className="text-[16px] md:text-[18px] font-[800] tracking-wide text-white font-mono uppercase">{order.address?.fullName}</span>
                                <span className="text-[13px] md:text-[14px] font-[600] tracking-widest text-[#888] uppercase font-mono mt-2">{order.address?.house}</span>
                                {order.address?.towerNumber && <span className="text-[13px] md:text-[14px] font-[600] tracking-widest text-[#888] uppercase font-mono mt-1">Tower: {order.address?.towerNumber}</span>}
                                <span className="text-[13px] md:text-[14px] font-[600] tracking-widest text-[#888] uppercase font-mono">{order.community}</span>
                                <div className="mt-4 pt-4 border-t border-[#222]">
                                    <span className="text-[13px] md:text-[14px] font-[600] tracking-widest text-[#555] uppercase font-mono">
                                        TEL: <span className="text-white ml-2">{order.address?.phone}</span>
                                        {order.address?.alternatePhone && <><span className="mx-3 text-[#333]">|</span>ALT: <span className="text-white ml-2">{order.address?.alternatePhone}</span></>}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right: Order Items & Summary */}
                    <div className="w-full xl:w-[45%]">
                        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-10 sticky top-[120px] relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                            <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 leading-none">
                                Itemized Receipt
                            </h2>

                            <div className="relative z-10 flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 border-b border-[#222] pb-6 last:border-0 last:pb-0">
                                        <img src={item.imageUrl || item.image} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 object-cover bg-[#111] rounded-[8px]" />
                                        <div className="flex-1 flex flex-col">
                                            <Link to={`/product/${item.product}`} className="text-[14px] md:text-[16px] font-[800] tracking-tight text-[#eaeaea] hover:text-white transition-colors uppercase leading-tight">
                                                {item.name}
                                            </Link>
                                            <span className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#777] uppercase font-mono mt-1.5 block">
                                                Size: {item.size}
                                            </span>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-[12px] font-[600] tracking-widest text-[#555] uppercase font-mono">{item.quantity} kg &times; ₹{item.price}</span>
                                                <span className="text-[16px] md:text-[18px] font-[800] tracking-tight text-white font-mono leading-none">
                                                    ₹{item.quantity * item.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="relative z-10 mt-8 pt-8 border-t border-[#333] flex flex-col gap-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[14px] font-[800] tracking-widest uppercase text-[#888]">Grand Total</span>
                                    <span className="font-[800] text-[36px] md:text-[45px] tracking-tighter leading-none text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                        ₹{order.totalPrice}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;
