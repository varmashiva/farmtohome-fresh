import mongoose from 'mongoose';

const communitySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const Community = mongoose.model('Community', communitySchema);

export default Community;
