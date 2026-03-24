// proxy.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Destructure 'auth' from NextAuth and immediately alias it to 'proxy'
const { auth: proxy } = NextAuth(authConfig);
export default proxy;

export const config = {
    // Protects all routes except static files and images
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};