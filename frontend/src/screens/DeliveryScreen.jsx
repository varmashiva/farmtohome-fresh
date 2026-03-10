import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DeliveryScreen = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [deliveryDate, setDeliveryDate] = useState(() => {
        const saved = localStorage.getItem('deliveryDate');
        return saved || '30 minutes';
    });

    const [dateType, setDateType] = useState(() => {
        const saved = localStorage.getItem('deliveryDate');
        return saved === '30 minutes' || !saved ? '30 minutes' : 'specific';
    });

    useEffect(() => {
        if (!user) navigate('/login');

        // Ensure address step was completed
        const savedAddress = localStorage.getItem('checkoutAddress');
        if (!savedAddress) {
            navigate('/checkout/address');
        }
    }, [user, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        localStorage.setItem('deliveryDate', dateType === '30 minutes' ? '30 minutes' : deliveryDate);
        navigate('/payment');
    };

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="w-full max-w-4xl mx-auto relative z-10">

                <div className="mb-10 w-full">
                    <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#666] block mb-2 uppercase font-mono text-center">
                        (Checkout Step 2)
                    </span>
                    <h2 className="text-[36px] md:text-[50px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase text-center" style={{ fontWeight: 900 }}>
                        DELIVERY INFO
                    </h2>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-12 relative overflow-hidden">
                    {/* Inner Noise */}
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <form onSubmit={submitHandler} className="space-y-10 relative z-10 w-full">

                        {/* Delivery Details */}
                        <div className="pb-8 border-b border-[#222]">
                            <h3 className="text-[18px] md:text-[20px] font-[800] tracking-tight text-[#eaeaea] uppercase mb-6 flex items-center gap-4">
                                Preferred Date
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h3>

                            <div className="space-y-4">
                                <label className={`flex items-center space-x-4 p-4 border rounded-[8px] cursor-pointer transition-all duration-300 ${dateType === '30 minutes' ? 'bg-[#111] border-[#eaeaea] shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border-[#222] hover:border-white/30'}`}>
                                    <input type="radio" checked={dateType === '30 minutes'} onChange={() => setDateType('30 minutes')} className="w-5 h-5 accent-white cursor-pointer" />
                                    <span className="text-[14px] font-[600] uppercase tracking-wider text-white">⚡ Quick Delivery – In Just 30 Minutes</span>
                                </label>
                                <label className={`flex items-center space-x-4 p-4 border rounded-[8px] cursor-pointer transition-all duration-300 ${dateType === 'specific' ? 'bg-[#111] border-[#eaeaea] shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border-[#222] hover:border-white/30'}`}>
                                    <input type="radio" checked={dateType === 'specific'} onChange={() => setDateType('specific')} className="w-5 h-5 accent-white cursor-pointer" />
                                    <span className="text-[14px] font-[600] uppercase tracking-wider text-white">Specific Date</span>
                                </label>

                                {dateType === 'specific' && (
                                    <div className="mt-4 pl-4 border-l-2 border-[#333] pt-2">
                                        <input
                                            type="date"
                                            required
                                            value={deliveryDate === '30 minutes' ? '' : deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                            className="w-full md:w-1/2 p-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] font-mono focus:outline-none focus:border-white/50 cursor-pointer"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/checkout/address')}
                                className="w-full md:w-1/3 py-[18px] md:py-[20px] rounded-[4px] font-[800] text-[13px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#111] text-[#888] border border-[#333] hover:text-white hover:border-white/50"
                            >
                                BACK
                            </button>
                            <button
                                type="submit"
                                className="w-full md:w-2/3 py-[18px] md:py-[20px] rounded-[4px] font-[800] text-[13px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#eaeaea] text-[#111] hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                CONTINUE TO PAYMENT
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeliveryScreen;
