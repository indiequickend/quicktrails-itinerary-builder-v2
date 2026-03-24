// app/_global-error/page.tsx
'use client';


export const dynamic = "force-dynamic";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return (
        <div style={{ fontFamily: 'sans-serif', background: '#fff', color: '#b91c1c', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Something went wrong!</h2>
            <pre style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', maxWidth: '90vw', overflowX: 'auto' }}>{error?.message || 'Unknown error'}</pre>
            {error?.digest && <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f1d1d' }}>Error digest: {error.digest}</div>}
            <button onClick={reset} style={{ marginTop: '2rem', padding: '0.75rem 2rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}>
                Try again
            </button>
        </div>
    );
}
