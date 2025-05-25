/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",  // If using /app dir (Next.js App Router)
        "./pages/**/*.{js,ts,jsx,tsx}", // If using /pages dir
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
