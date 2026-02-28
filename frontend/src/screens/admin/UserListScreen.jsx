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
        <div className="max-w-6xl mx-auto mt-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            {/* LIVE USERS SECTION */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <span className="relative flex h-3 w-3 mr-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xl font-bold text-green-400">{liveUsers.length} Users Online</span>
                    </div>
                </div>

                <div className="glass-card rounded-xl overflow-hidden border border-green-500/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-black/20 text-accent border-b border-white/10 uppercase text-xs font-bold tracking-wider">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Connected At</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {liveUsers.map((u, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition bg-green-500/5">
                                        <td className="p-4 font-bold text-green-100">{u.name}</td>
                                        <td className="p-4 opacity-80">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm opacity-70">
                                            {new Date(u.connectedAt).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                                            <span className="text-green-400 font-bold text-sm tracking-wide">Online</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {liveUsers.length === 0 && <div className="text-center p-6 opacity-50 font-medium">No active users currently connected.</div>}
                    </div>
                </div>
            </div>

            {/* REGISTERED USERS SECTION */}
            <h2 className="text-2xl font-bold border-b-2 border-accent pb-2 mb-4 inline-block">Registered Database</h2>
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-black/20 text-accent border-b border-white/10 uppercase text-xs font-bold tracking-wider">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Provider</th>
                                <th className="p-4">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-white/5 transition">
                                    <td className="p-4 font-bold flex items-center gap-3">
                                        {u.profileImage && <img src={u.profileImage} alt="profile" className="w-8 h-8 rounded-full border border-white/20" />}
                                        {u.name}
                                    </td>
                                    <td className="p-4 opacity-80">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {u.authProvider === 'google' ? (
                                            <span className="text-orange-400 font-bold text-sm">Google</span>
                                        ) : (
                                            <span className="text-gray-400 font-bold text-sm">Email</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-sm opacity-70">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <div className="text-center p-10 opacity-70">No users found.</div>}
                </div>
            </div>
        </div>
    );
};

export default UserListScreen;
