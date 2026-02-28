import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get Revenue Dashboard Data (Aggregated)
// @route   GET /api/admin/revenue
// @access  Private/Admin
export const getRevenueStats = async (req, res) => {
    try {
        // Aggregate total revenue and split by community
        const aggregateData = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: "$community", // Group by 'Community 1', 'Community 2', etc.
                    totalRevenue: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        let totalRevenue = 0;
        let totalOrders = await Order.countDocuments({ status: { $ne: 'cancelled' } }); // Exclude cancelled from total count
        let community1Revenue = 0;
        let community2Revenue = 0;

        aggregateData.forEach(item => {
            totalRevenue += item.totalRevenue;
            if (item._id === 'Community 1') community1Revenue = item.totalRevenue;
            if (item._id === 'Community 2') community2Revenue = item.totalRevenue;
        });

        res.json({
            totalRevenue,
            totalOrders,
            community1Revenue,
            community2Revenue,
            breakdown: aggregateData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsersList = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
