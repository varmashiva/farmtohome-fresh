import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const AddressScreen = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [addressDetails, setAddressDetails] = useState(() => {
        const saved = localStorage.getItem('checkoutAddress');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                fullName: parsed.fullName || user?.name || '',
                phone: parsed.phone || '',
                alternatePhone: parsed.alternatePhone || '',
                house: parsed.house || '',
                towerNumber: parsed.towerNumber || '',
                community: parsed.community || ''
            };
        }
        return {
            fullName: user?.name || '',
            phone: '',
            alternatePhone: '',
            house: '',
            towerNumber: '',
            community: '' // Start empty to force choice
        };
    });

    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const { data } = await api.get('/communities');
                setCommunities(data);
            } catch (error) {
                console.error('Failed to fetch communities:', error);
            }
        };
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (!user) navigate('/login?redirect=checkout/address');
    }, [user, navigate]);

    const handleInputChange = (e) => {
        setAddressDetails({ ...addressDetails, [e.target.name]: e.target.value });
    };

    const isFormValid = () => {
        return (
            (addressDetails.fullName || '').trim() !== '' &&
            (addressDetails.phone || '').replace(/\D/g, '').length === 10 &&
            (addressDetails.house || '').trim() !== '' &&
            (addressDetails.towerNumber || '').trim() !== '' &&
            (addressDetails.community || '') !== ''
        );
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (isFormValid()) {
            localStorage.setItem('checkoutAddress', JSON.stringify(addressDetails));
            navigate('/checkout/delivery');
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="w-full max-w-4xl mx-auto relative z-10">

                <div className="mb-10 w-full">
                    <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#666] block mb-2 uppercase font-mono text-center">
                        (Checkout Step 1)
                    </span>
                    <h2 className="text-[36px] md:text-[50px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase text-center" style={{ fontWeight: 900 }}>
                        SHIPPING ADDRESS
                    </h2>
                </div>

                <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 md:p-12 relative overflow-hidden">
                    {/* Inner Noise */}
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <form onSubmit={submitHandler} className="space-y-10 relative z-10 w-full">

                        {/* Personal Details */}
                        <div className="pb-8 border-b border-[#222]">
                            <h3 className="text-[18px] md:text-[20px] font-[800] tracking-tight text-[#eaeaea] uppercase mb-6 flex items-center gap-4">
                                Personal Details
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] md:text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Full Name <span className="text-[#555] ml-1">(Required)</span></label>
                                    <input type="text" name="fullName" required value={addressDetails.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] md:text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Phone Number <span className="text-[#555] ml-1">(Required)</span></label>
                                        <input type="tel" name="phone" required pattern="\d{10}" title="10 digit phone number" value={addressDetails.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300" placeholder="10 Digits" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] md:text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Alternate Phone <span className="text-[#555] ml-1">(Optional)</span></label>
                                        <input type="tel" name="alternatePhone" value={addressDetails.alternatePhone} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div>
                            <h3 className="text-[18px] md:text-[20px] font-[800] tracking-tight text-[#eaeaea] uppercase mb-6 flex items-center gap-4">
                                Address Details
                                <span className="h-[1px] flex-1 bg-[#222]"></span>
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] md:text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">House / Flat Number <span className="text-[#555] ml-1">(Required)</span></label>
                                    <input type="text" name="house" required value={addressDetails.house} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300" />
                                </div>

                                <div>
                                    <label className="block text-[10px] md:text-[11px] text-[#777] font-[600] tracking-widest uppercase font-mono mb-2">Tower Number <span className="text-[#555] ml-1">(Required)</span></label>
                                    <input type="text" name="towerNumber" required value={addressDetails.towerNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] focus:outline-none focus:border-white/50 transition duration-300" />
                                </div>

                                <div className="p-6 bg-[#111] border border-[#222] rounded-[8px]">
                                    <label className="block text-[10px] md:text-[11px] text-[#eaeaea] font-[600] tracking-widest uppercase font-mono mb-4 text-center">Select Community <span className="text-[#666] ml-1">(Required)</span></label>
                                    <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 mb-4">
                                        {communities.length === 0 ? (
                                            <div className="py-4 text-center text-[#555] text-[11px] uppercase tracking-widest font-mono">
                                                Loading available communities...
                                            </div>
                                        ) : (
                                            communities.map(comm => (
                                                <div
                                                    key={comm._id}
                                                    onClick={() => setAddressDetails({ ...addressDetails, community: comm.name })}
                                                    className={`py-4 px-6 border rounded-[4px] cursor-pointer text-center transition-all duration-300 min-w-[150px] ${addressDetails.community === comm.name ? 'bg-[#eaeaea] border-[#eaeaea] text-[#111] font-[800] shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-[#0c0c0c] border-[#333] text-[#777] font-[600] hover:border-white/50 hover:text-white'}`}
                                                >
                                                    <span className="text-[13px] tracking-widest uppercase">{comm.name}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="mt-4 text-[11px] text-[#555] text-center uppercase tracking-widest font-mono">
                                        Delivering exclusively in Hyderabad within selected communities.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className={`w-full py-[18px] md:py-[20px] rounded-[4px] font-[800] text-[13px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 mt-8 ${!isFormValid() ? 'bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#333]' : 'bg-[#eaeaea] text-[#111] hover:bg-white pb-4 pt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
                        >
                            CONTINUE TO DELIVERY
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressScreen;
