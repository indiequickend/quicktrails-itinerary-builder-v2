// components/B2BPanel.tsx
'use client';

import { useItineraryStore } from '@/store/useItineraryStore';
import { CldUploadWidget } from 'next-cloudinary';

export default function B2BPanel() {
    const { b2bDetails, setB2bDetails } = useItineraryStore();

    const handleToggle = () => {
        setB2bDetails({ ...b2bDetails, isB2B: !b2bDetails.isB2B });
    };

    return (
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-md font-serif font-semibold text-gray-900">B2B White-Labeling</h3>
                    <p className="text-sm text-gray-500">Generate this package for a partner agency.</p>
                </div>

                {/* Elegant Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={b2bDetails.isB2B} onChange={handleToggle} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-600 transition-all after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
            </div>

            {b2bDetails.isB2B && (
                <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Partner Agency Name</label>
                        <input
                            type="text"
                            value={b2bDetails.agencyName}
                            onChange={(e) => setB2bDetails({ ...b2bDetails, agencyName: e.target.value })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-amber-500"
                            placeholder="e.g., Global Escapes"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Agency Logo</label>
                        <CldUploadWidget
                            uploadPreset="quicktrails_preset"
                            onSuccess={(result: any) => setB2bDetails({ ...b2bDetails, logoUrl: result.info.secure_url })}
                        >
                            {({ open }) => (
                                <button type="button" onClick={() => open()} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                                    Upload Partner Logo
                                </button>
                            )}
                        </CldUploadWidget>

                        {b2bDetails.logoUrl && (
                            <img src={b2bDetails.logoUrl} alt="Partner Logo" className="mt-4 h-12 object-contain" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}