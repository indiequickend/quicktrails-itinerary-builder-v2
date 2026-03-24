'use server'

import { dbConnect } from '@/lib/mongodb';
import BrandSettings from '@/models/BrandSettings';

export async function updateBrandSettings(formData: any) {
    await dbConnect();
    try {
        // 1. .lean() strips away the heavy Mongoose internal functions
        const settings = await BrandSettings.findOneAndUpdate(
            {},
            formData,
            { new: true, upsert: true }
        ).lean();

        // 2. Sanitize complex types (like ObjectId and Dates) into plain strings
        const plainSettings = JSON.parse(JSON.stringify(settings));

        return { success: true, settings: plainSettings };
    } catch (error) {
        return { success: false, error: 'Failed to update brand settings' };
    }
}

export async function getBrandSettings() {
    await dbConnect();
    try {
        const settings = await BrandSettings.findOne({}).lean();
        if (!settings) return null;

        // Sanitize the Mongoose document into plain JSON
        return JSON.parse(JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}