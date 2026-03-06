import os

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/admin/OrderListScreen.jsx', 'r') as f:
    text = f.read()

start_idx = text.find('    return (\n        <div className="max-w-7xl mx-auto mt-6">')

imports_and_logic = text[:start_idx]

new_return = """    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/>%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full mb-12">
                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mt-4 uppercase font-mono">
                            (Orders Log)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start pr-4 md:pr-0">
                        <h1 className="text-[45px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            ORDER<br/>DATABASE
                        </h1>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0 flex justify-end">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="hidden md:flex absolute right-4 -top-8 items-center gap-3">
                        <span className="text-[#666] text-[11px] font-[600] tracking-widest uppercase font-mono">FILTER:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-[#111] border border-[#333] text-white px-4 py-2 rounded-[4px] text-[12px] font-[600] uppercase tracking-wider focus:outline-none focus:border-white/50 cursor-pointer"
                        >
                            <option value="All">All Communities</option>
                            <option value="Community 1">Community 1</option>
                            <option value="Community 2">Community 2</option>
                        </select>
                    </div>
                </div>

                <div className="md:hidden w-full flex items-center justify-between mb-8 pb-8 border-b border-[#222]">
                    <span className="text-[#666] text-[11px] font-[600] tracking-widest uppercase font-mono">FILTER REGION:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-[#111] border border-[#333] text-white px-4 py-2 rounded-[4px] text-[11px] md:text-[12px] font-[600] uppercase tracking-wider focus:outline-none focus:border-white/50 cursor-pointer max-w-[50%]"
                    >
                        <option value="All">All Regions</option>
                        <option value="Community 1">Community 1</option>
                        <option value="Community 2">Community 2</option>
                    </select>
                </div>

                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/>%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/>%3C/svg%3E')" }}></div>
                    
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
"""

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/admin/OrderListScreen.jsx', 'w') as f:
    f.write(imports_and_logic + new_return)
