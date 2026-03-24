import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        await dbConnect();

        // 1. Check if the admin already exists
        const existingAdmin = await Agent.findOne({ email: 'admin@quicktrails.com' });
        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin account already exists!' });
        }

        // 2. Hash the temporary password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash('Admin123!', saltRounds);

        // 3. Create the foundational ADMIN account
        const admin = await Agent.create({
            name: 'System Admin',
            email: 'admin@quicktrails.com',
            passwordHash: passwordHash,
            role: 'ADMIN',
            isActive: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Admin created successfully. PLEASE DELETE THIS FILE NOW.',
            credentials: {
                email: admin.email,
                password: 'Admin123!'
            }
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}