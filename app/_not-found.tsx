// app/_not-found/page.tsx
'use client';

import Link from 'next/link';

export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <div style={{ fontFamily: 'sans-serif', background: '#fff', color: '#334155', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>404 – Page Not Found</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#64748b' }}>
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <Link href="/" style={{ padding: '0.75rem 2rem', background: '#334155', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 600, textDecoration: 'none' }}>
                Go Home
            </Link>
        </div>
    );
}
