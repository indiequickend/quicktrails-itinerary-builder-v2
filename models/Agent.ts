import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'AGENT'], default: 'AGENT' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Agent || mongoose.model('Agent', agentSchema);