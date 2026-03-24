import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-playfair)', 'serif'],
            },
            colors: {
                // Adding a custom amber color for that premium QuickTrails accent
                amber: {
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                }
            }
        },
    },
    plugins: [],
};

export default config;