// actions/catalog.ts
'use server'

import { dbConnect } from '@/lib/mongodb';
import CatalogItem from '@/models/CatalogItem';
import { revalidatePath } from 'next/cache';

export async function saveCatalogItem(formData: any) {
    await dbConnect();
    try {
        const newItem = await CatalogItem.create(formData);
        revalidatePath('/catalog'); // Refresh the catalog list
        return { success: true, id: newItem._id.toString() };
    } catch (error) {
        console.error("Failed to save catalog item:", error);
        return { success: false, error: 'Database Error' };
    }
}

export async function getCatalogItems(page = 1, limit = 10, search = '') {
    await dbConnect();
    try {
        // Case-insensitive search on the title
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};
        const skip = (page - 1) * limit;

        const items = await CatalogItem.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CatalogItem.countDocuments(query);

        return {
            success: true,
            items: JSON.parse(JSON.stringify(items)),
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Fetch catalog error:", error);
        return { success: false, items: [], totalPages: 0, currentPage: 1 };
    }
}

export async function getCatalogItemById(id: string) {
    await dbConnect();
    try {
        const item = await CatalogItem.findById(id).lean();
        return { success: true, item: JSON.parse(JSON.stringify(item)) };
    } catch (error) {
        console.error("Fetch item error:", error);
        return { success: false, item: null };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCatalogItem(id: string, formData: any) {
    await dbConnect();
    try {
        await CatalogItem.findByIdAndUpdate(id, formData);
        return { success: true };
    } catch (error) {
        console.error("Failed to update catalog item:", error);
        return { success: false, error: 'Database Error' };
    }
}

export async function deleteCatalogItem(id: string) {
    await dbConnect();
    try {
        await CatalogItem.findByIdAndDelete(id);
        revalidatePath('/catalog');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete catalog item:", error);
        return { success: false, error: 'Database Error' };
    }
}