import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');
    const userInfoString = localStorage.getItem('userInfo');

    // If completely unauthenticated natively and locally
    if (!token && !userInfoString && !user) {
        return <Navigate to="/login" replace />;
    }

    // If route is admin only but user isn't admin
    if (adminOnly) {
        let role = user?.role;
        if (!role && userInfoString) {
            try {
                const parsed = JSON.parse(userInfoString);
                role = parsed.role;
            } catch (e) {
                // ignore
            }
        }

        if (role && role !== 'admin') {
            return <Navigate to="/" replace />;
        }
    }

    // Render protected route
    return <Outlet />;
};

export default ProtectedRoute;
