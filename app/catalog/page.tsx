// app/catalog/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCatalogItems, deleteCatalogItem } from '@/actions/catalog';
import { useRouter } from 'next/navigation';

export default function CatalogPage() {
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchItems = async () => {
        setIsLoading(true);
        const data = await getCatalogItems(page, 10, search);
        if (data.success) {
            setItems(data.items);
            setTotalPages(data.totalPages);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Debounce search by 300ms
        const delayDebounceFn = setTimeout(() => {
            fetchItems();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, page]);

    // eslint-disable-next-line react-hooks/exhaustive-deps

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        setIsLoading(true);
        const res = await deleteCatalogItem(id);
        if (res.success) {
            fetchItems();
        } else {
            alert('Failed to delete item.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8 mt-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Master Catalog</h1>
                <Link
                    href="/catalog/new"
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition shadow-sm"
                >
                    + Add New Item
                </Link>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <input
                        type="text"
                        placeholder="Search activities, hotels, or destinations..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full max-w-md p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Duration</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading catalog...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No items found.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-xs font-semibold text-amber-600">{item.type}</td>
                                        <td className="p-4 text-sm font-medium text-gray-900">{item.title}</td>
                                        <td className="p-4 text-sm text-gray-500">{item.location}</td>
                                        <td className="p-4 text-sm text-gray-500">{item.estimatedDuration || '-'}</td>
                                        <td className="p-4 text-sm text-right flex items-center justify-end gap-2">
                                            <Link
                                                href={`/catalog/edit/${item._id}`}
                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
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