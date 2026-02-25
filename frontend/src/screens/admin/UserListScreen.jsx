import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const UserListScreen = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

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
    }, [user, navigate]);

    return (
        <div className="max-w-6xl mx-auto mt-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
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
