// lib/mongodb.ts
import mongoose from 'mongoose';
import dns from "node:dns/promises";

// Set DNS servers explicitly to resolve Atlas SRV records
console.log("DNS Servers:", await dns.getServers());
await dns.setServers(["8.8.8.8", "4.2.2.2"]);
console.log("DNS Servers:", await dns.getServers());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

        console.log("Attempting to connect to MongoDB Atlas...", MONGODB_URI);

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("Successfully connected to MongoDB Atlas!");
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}