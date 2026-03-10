import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../utils/api';

const UserListScreen = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [liveUsers, setLiveUsers] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/users');
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUsers();

        if (socket) {
            socket.on("liveUsersUpdate", (activeUsers) => {
                setLiveUsers(activeUsers);
            });
            socket.emit("requestLiveUsers");
        }

        return () => {
            if (socket) socket.off("liveUsersUpdate");
        };
    }, [user, navigate, socket]);

    return (
        <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-6 md:px-16 w-full relative z-10 overflow-hidden" style={{ fontFamily: 'Froople, sans-serif' }}>
            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start w-full mb-12">
                <div className="w-full flex pb-6 md:pb-12 relative">
                    <div className="w-full md:w-1/4 hidden md:block">
                        <span className="text-[11px] md:text-[13px] font-[600] tracking-widest text-[#777] block mt-4 uppercase font-mono">
                            (User DB Access)
                        </span>
                    </div>
                    <div className="w-full md:w-3/4 text-left flex flex-col items-start pr-4 md:pr-0">
                        <h1 className="text-[45px] md:text-[60px] lg:text-[80px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontWeight: 900 }}>
                            USER<br/>MANAGEMENT
                        </h1>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#333] mb-12 relative flex-shrink-0 flex justify-end">
                    <div className="absolute left-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                    <div className="absolute right-0 -top-[7px] text-[#666] text-[10px] font-mono">+</div>
                </div>

                {/* LIVE USERS SECTION */}
                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col mb-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-[#222] relative z-10 w-full gap-4 md:gap-0">
                        <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase flex items-center gap-4">
                            Active Live Users
                        </h2>
                        
                        <div className="flex items-center justify-center bg-green-500/10 px-4 py-2 text-[12px] rounded-[4px] border border-green-500/20 uppercase tracking-widest font-mono font-[700]">
                            <span className="relative flex h-2 w-2 mr-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-400">{liveUsers.length} ONLINE</span>
                        </div>
                    </div>

                    <div className="relative z-10 w-full overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#333] text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest font-mono">
                                    <th className="py-4 px-6 md:pl-0">Name</th>
                                    <th className="py-4 px-6">Email</th>
                                    <th className="py-4 px-6 text-center">Role</th>
                                    <th className="py-4 px-6 text-right">Connected At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveUsers.map((u, index) => (
                                    <tr key={index} className="border-b border-[#1a1a1a] hover:bg-green-500/5 transition-colors group">
                                        <td className="py-5 px-6 md:pl-0 font-[800] text-green-300 uppercase text-[12px] md:text-[13px]">{u.name}</td>
                                        <td className="py-5 px-6 font-[600] text-[#888] text-[12px] md:text-[13px]">{u.email}</td>
                                        <td className="py-5 px-6 text-center">
                                            <span className={`inline-block px-3 py-1 text-[10px] font-[800] uppercase tracking-widest rounded-[4px] border border-[#333] bg-[#111] ${u.role === 'admin' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-[#eaeaea]'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 font-mono text-[11px] md:text-[12px] font-[600] text-[#777] uppercase text-right">
                                            {new Date(u.connectedAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {liveUsers.length === 0 && <div className="py-12 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">No Active Connections Detected.</div>}
                    </div>
                </div>

                {/* REGISTERED USERS SECTION */}
                <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-[16px] p-6 md:p-10 relative overflow-hidden flex flex-col flex-1">
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/>%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/>%3C/svg%3E')" }}></div>
                    
                    <h2 className="text-[20px] md:text-[24px] font-[800] tracking-tighter uppercase mb-8 border-b border-[#222] pb-6 relative z-10 flex items-center gap-4">
                        Registered Database
                        <span className="h-[1px] flex-1 bg-[#222]"></span>
                    </h2>

                    <div className="relative z-10 w-full overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#333] text-[#777] text-[10px] md:text-[11px] font-[600] uppercase tracking-widest font-mono">
                                    <th className="py-4 pr-6">User / Auth</th>
                                    <th className="py-4 px-6">Email</th>
                                    <th className="py-4 px-6 text-center">Role</th>
                                    <th className="py-4 pl-6 text-right">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-b border-[#1a1a1a] hover:bg-[#111]/50 transition-colors group">
                                        <td className="py-5 pr-6 flex items-center gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {u.profileImage ? (
                                                    <img src={u.profileImage} alt="profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[18px] font-[900] text-[#eaeaea] uppercase font-mono">{u.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-[800] text-white uppercase text-[13px] md:text-[14px] leading-tight mb-1">{u.name}</span>
                                                {u.authProvider === 'google' ? (
                                                    <span className="text-[10px] uppercase font-[700] tracking-widest text-orange-400 font-mono">Google Auth</span>
                                                ) : (
                                                    <span className="text-[10px] uppercase font-[700] tracking-widest text-[#777] font-mono">Email / PW</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 font-[600] text-[#888] text-[12px] md:text-[13px]">{u.email}</td>
                                        <td className="py-5 px-6 text-center">
                                            <span className={`inline-block px-3 py-1 text-[10px] font-[800] uppercase tracking-widest rounded-[4px] border border-[#333] bg-[#111] ${u.role === 'admin' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-[#eaeaea]'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-5 pl-6 font-mono text-[11px] md:text-[12px] font-[600] text-[#777] uppercase text-right">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <div className="py-12 text-center text-[#777] text-[12px] uppercase tracking-widest font-mono">No Registered Users Found.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserListScreen;
