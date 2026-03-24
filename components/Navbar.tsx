'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    // Hide the navbar on the public landing page and login screen
    if (pathname === '/' || pathname === '/login') return null;

    return (
        <nav className="bg-gray-900 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <span className="font-serif font-bold text-xl tracking-wide text-amber-500">
                            QuickTrails
                        </span>
                        <div className="flex space-x-4">
                            <Link
                                href="/itineraries"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${pathname.startsWith('/itineraries') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                Itinerary
                            </Link>
                            <Link
                                href="/catalog"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${pathname.startsWith('/catalog') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                Master Catalog
                            </Link>
                            <Link
                                href="/settings"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${pathname.startsWith('/settings') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                Brand Settings
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                            Admin Mode
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}