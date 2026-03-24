// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login', // Custom login page
    },
    providers: [], // Populated in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith('/builder') || nextUrl.pathname.startsWith('/itineraries');
            const isAdminRoute = nextUrl.pathname.startsWith('/settings');

            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login
            }

            if (isAdminRoute) {
                // Only the three partners can access the global catalog and brand settings
                if (isLoggedIn && auth.user.role === 'ADMIN') return true;
                return false;
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'ADMIN' | 'AGENT';
            }
            return session;
        },
    },
} satisfies NextAuthConfig;