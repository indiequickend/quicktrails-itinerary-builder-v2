// app/catalog/new/page.tsx
'use client';

import { useState } from 'react';
import { saveCatalogItem } from '@/actions/catalog';
import dynamic from 'next/dynamic';



const CldUploadWidget = dynamic(() => import('next-cloudinary').then(mod => mod.CldUploadWidget), { ssr: false });

export default function NewCatalogItem() {
    const [formData, setFormData] = useState({
        type: 'ACTIVITY',
        title: '',
        location: '',
        description: '',
        estimatedDuration: '',
        images: [] as { url: string; isHighRes: boolean }[]
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await saveCatalogItem(formData);
        if (res.success) {
            alert('Catalog Item Saved!');
            // Reset form or redirect
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-sm mt-10 rounded-sm border border-gray-100">
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">Add to Master Catalog</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-amber-500"
                        >
                            <option value="ACTIVITY">Sightseeing / Activity</option>
                            <option value="HOTEL">Accommodation</option>
                            <option value="TRANSFER">Transport / Transfer</option>
                            <option value="DESTINATION">Destination Overview</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
                        <input
                            type="text"
                            placeholder="e.g., 2 Hours"
                            value={formData.estimatedDuration}
                            onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-amber-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        placeholder="e.g., Sunrise at Tiger Hill"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-amber-500" required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        placeholder="e.g., Darjeeling, West Bengal"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-amber-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Rich Description</label>
                    <textarea
                        rows={5}
                        placeholder="Write an elegant, engaging description for the PDF export..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-amber-500"
                    />
                </div>

                {/* Media Upload */}
                <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">High-Resolution Media</label>
                    <CldUploadWidget
                        uploadPreset="quicktrails_preset"
                        onSuccess={(result: any) => {
                            setFormData({
                                ...formData,
                                images: [...formData.images, { url: result.info.secure_url, isHighRes: true }]
                            });
                        }}
                    >
                        {({ open }) => (
                            <button type="button" onClick={() => open()} className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition">
                                Upload Image
                            </button>
                        )}
                    </CldUploadWidget>

                    {formData.images.length > 0 && (
                        <div className="flex gap-4 mt-4 overflow-x-auto">
                            {formData.images.map((img, i) => (
                                <img key={i} src={img.url} alt="Uploaded preview" className="h-20 w-20 object-cover rounded shadow-sm" />
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-3 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition">
                    {isSaving ? 'Saving to Catalog...' : 'Save to Master Catalog'}
                </button>
            </form>
        </div>
    );
}