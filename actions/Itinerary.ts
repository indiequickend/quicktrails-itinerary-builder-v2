'use server'

import { dbConnect } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Zod Schema for strict validation
const ItinerarySchema = z.object({
    tripTitle: z.string().min(3, "Title must be at least 3 characters"),
    durationText: z.string(),
    welcomeMessage: z.string().optional(),
    status: z.enum(['DRAFT', 'FINALIZED']),
    days: z.array(z.object({
        dayNumber: z.number(),
        dayTitle: z.string(),
        hotelInfo: z.string().optional(),
        dayHighlightImage: z.string().optional(),
    }))
});

// actions/itinerary.ts
// Add this to actions/itinerary.ts
export async function createItinerary(itineraryData: any) {
    await dbConnect();
    try {
        // Create a brand new document in MongoDB
        const newItinerary = await Itinerary.create(itineraryData);

        // Return the newly generated ID so the frontend can update its URL
        return { success: true, newId: newItinerary._id.toString() };
    } catch (error) {
        console.error("Create error:", error);
        return { success: false, error: 'Failed to create itinerary' };
    }
}

export async function saveItinerary(id: string, itineraryData: any) {
    await dbConnect();
    try {
        // Update the document in MongoDB
        await Itinerary.findByIdAndUpdate(id, itineraryData, { new: true });
        return { success: true };
    } catch (error) {
        console.error("Save error:", error);
        return { success: false, error: 'Failed to save itinerary' };
    }
}

export async function getItineraries(page = 1, limit = 10, search = '') {
    await dbConnect();
    try {
        const query = search ? { tripTitle: { $regex: search, $options: 'i' } } : {};
        const skip = (page - 1) * limit;

        const items = await Itinerary.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Itinerary.countDocuments(query);

        return {
            success: true,
            items: JSON.parse(JSON.stringify(items)),
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Fetch itineraries error:", error);
        return { success: false, items: [], totalPages: 0, currentPage: 1 };
    }
}

export async function duplicateItinerary(id: string) {
    await dbConnect();
    try {
        const original = await Itinerary.findById(id).lean();
        if (!original) return { success: false, error: 'Itinerary not found' };

        // Remove MongoDB specific ID and timestamps so it creates a fresh record
        const { _id, createdAt, updatedAt, ...rest } = original as any;

        // Append (Copy) to the title and force status back to DRAFT
        rest.tripTitle = `${rest.tripTitle} (Copy)`;
        rest.status = 'DRAFT';

        const duplicated = await Itinerary.create(rest);
        revalidatePath('/itineraries');

        return { success: true, newId: duplicated._id.toString() };
    } catch (error) {
        console.error("Duplicate error:", error);
        return { success: false, error: 'Failed to duplicate' };
    }
}

// Add this to actions/itinerary.ts
export async function getItineraryById(id: string) {
    await dbConnect();
    try {
        const itinerary = await Itinerary.findById(id).lean();
        if (!itinerary) return { success: false, error: 'Itinerary not found' };

        // Sanitize for the client component
        return { success: true, data: JSON.parse(JSON.stringify(itinerary)) };
    } catch (error) {
        console.error("Fetch single itinerary error:", error);
        return { success: false, error: 'Failed to load itinerary' };
    }
}