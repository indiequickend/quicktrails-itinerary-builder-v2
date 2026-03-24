import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { dbConnect } from "@/lib/mongodb";
import Agent from "@/models/Agent";
import bcrypt from "bcrypt";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            // 1. You MUST define this in v5 so it knows what to extract from the form
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("🔑 Login attempt for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("❌ Missing email or password in request");
                    return null;
                }

                await dbConnect();
                const user = await Agent.findOne({ email: credentials.email });

                if (!user) {
                    console.log("❌ No user found in database with that email");
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (passwordsMatch) {
                    console.log("✅ Password matched! Logging in.");
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                }

                console.log("❌ Invalid password");
                return null;
            }
        })
    ]
});