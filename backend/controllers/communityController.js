import Community from '../models/Community.js';

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
export const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find({}).sort({ name: 1 });
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a community
// @route   POST /api/communities
// @access  Private/Admin
export const createCommunity = async (req, res) => {
    try {
        const { name } = req.body;

        const communityExists = await Community.findOne({ name });

        if (communityExists) {
            return res.status(400).json({ message: 'Community already exists' });
        }

        const community = new Community({
            name
        });

        const createdCommunity = await community.save();
        res.status(201).json(createdCommunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a community
// @route   DELETE /api/communities/:id
// @access  Private/Admin
export const deleteCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);

        if (community) {
            await community.deleteOne();
            res.json({ message: 'Community removed' });
        } else {
            res.status(404).json({ message: 'Community not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
