// app/itineraries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItineraries, duplicateItinerary, deleteItinerary } from '@/actions/Itinerary';
import { useRouter } from 'next/navigation';

export default function ItinerariesPage() {
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

    const fetchItineraries = async () => {
        setIsLoading(true);
        const data = await getItineraries(page, 10, search);
        if (data.success) {
            setItems(data.items);
            setTotalPages(data.totalPages);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchItineraries();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, page]);

    const handleDuplicate = async (id: string) => {
        setIsDuplicating(id);
        const res = await duplicateItinerary(id);
        if (res.success) {
            await fetchItineraries(); // Refresh list to show the new copy
        } else {
            alert('Failed to duplicate itinerary.');
        }
        setIsDuplicating(null);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 mt-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Saved Itineraries</h1>
                <Link
                    href="/builder"
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 transition shadow-sm"
                >
                    + Create New Package
                </Link>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <input
                        type="text"
                        placeholder="Search by trip title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full max-w-md p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                <th className="p-4 font-medium">Trip Title</th>
                                <th className="p-4 font-medium">Duration</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading itineraries...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No itineraries found.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            <Link href={`/builder?id=${item._id}`}>{item.tripTitle}</Link>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{item.durationText}</td>
                                        <td className="p-4 text-sm text-gray-500">{item.totalPrice}</td>
                                        <td className="p-4 text-xs font-semibold text-gray-500">
                                            {item.b2bDetails?.isB2B ? (
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">B2B: {item.b2bDetails.agencyName}</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200">Direct</span>
                                            )}
                                        </td>

                                        <td className="p-4 text-right space-x-3">
                                            <button
                                                onClick={() => handleDuplicate(item._id)}
                                                disabled={isDuplicating === item._id}
                                                className="text-sm text-gray-500 hover:text-gray-900 font-medium disabled:opacity-50"
                                            >
                                                {isDuplicating === item._id ? 'Copying...' : 'Duplicate'}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/builder?id=${item._id}`)}
                                                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete this itinerary?')) {
                                                        setIsLoading(true);
                                                        const res = await deleteItinerary(item._id);
                                                        if (res.success) {
                                                            await fetchItineraries();
                                                        } else {
                                                            alert('Failed to delete itinerary.');
                                                        }
                                                        setIsLoading(false);
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                                                disabled={isLoading}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
                    <span className="text-gray-500">Page {page} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}