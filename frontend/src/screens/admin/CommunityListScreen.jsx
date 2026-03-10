import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const CommunityListScreen = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [communities, setCommunities] = useState([]);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchCommunities = async () => {
            try {
                const { data } = await api.get('/communities');
                setCommunities(data);
            } catch (error) {
                console.error(error);
                alert('Failed to load communities');
            }
        };

        fetchCommunities();
    }, [user, navigate]);

    const submitCreateCommunityHandler = async (e) => {
        e.preventDefault();
        if (!newCommunityName.trim()) return;

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/communities', { name: newCommunityName }, config);
            setCommunities([...communities, data]);
            setNewCommunityName('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create community');
        } finally {
            setLoading(false);
        }
    };

    const deleteCommunityHandler = async (id) => {
        if (window.confirm('Are you sure you want to remove this community?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await api.delete(`/communities/${id}`, config);
                setCommunities(communities.filter(c => c._id !== id));
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete community');
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-4xl mx-auto relative z-10 w-full mb-12 flex flex-col items-center">
                <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mb-4 uppercase font-mono">
                    (Administration)
                </span>
                <h1 className="text-[40px] md:text-[60px] lg:text-[70px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase text-center" style={{ fontWeight: 900 }}>
                    MANAGE<br />COMMUNITIES
                </h1>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-10">
                {/* Add Community Form */}
                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-6 flex items-center gap-4 relative z-10">
                        Add New Community
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <form onSubmit={submitCreateCommunityHandler} className="relative z-10 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] md:text-[11px] font-[600] tracking-widest text-[#666] uppercase font-mono block mb-2">Community Name</label>
                            <input
                                type="text"
                                required
                                value={newCommunityName}
                                onChange={(e) => setNewCommunityName(e.target.value)}
                                className="w-full px-4 py-4 bg-[#111] border border-[#333] rounded-[4px] text-white text-[14px] font-[600] focus:outline-none focus:border-white/50 transition duration-300 uppercase tracking-wide"
                                placeholder="E.G. SRKR ENGINEERING COLLEGE"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !newCommunityName.trim()}
                            className="w-full md:w-auto py-4 px-10 rounded-[4px] font-[800] text-[12px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 bg-[#eaeaea] text-[#111] border border-[#eaeaea] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? 'Adding...' : 'Add Community'}
                        </button>
                    </form>
                </div>

                {/* Communities List */}
                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-8 relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-6 flex items-center gap-4 relative z-10">
                        Active Communities
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="flex flex-col gap-4 relative z-10">
                        {communities.length === 0 ? (
                            <div className="py-10 text-center text-[#555] text-[12px] font-mono tracking-widest uppercase">
                                No communities registered yet.
                            </div>
                        ) : (
                            communities.map((community) => (
                                <div key={community._id} className="bg-[#111] border border-[#222] p-5 rounded-[8px] flex justify-between items-center hover:border-[#444] transition-colors">
                                    <h3 className="text-[16px] md:text-[20px] font-[800] uppercase tracking-wide text-[#eaeaea] leading-tight">
                                        {community.name}
                                    </h3>
                                    <button
                                        onClick={() => deleteCommunityHandler(community._id)}
                                        className="text-[10px] uppercase font-[700] tracking-widest text-[#777] hover:text-white bg-[#1a1a1a] hover:bg-red-500/20 border border-[#333] hover:border-red-500/40 focus:ring focus:ring-red-500/10 rounded-[4px] px-4 py-3 transition-all flex-shrink-0 ml-4"
                                    >
                                        REDACT
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityListScreen;
