/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                instagram: {
                    light: '#fafafa',
                    border: '#dbdbdb',
                    blue: '#0095f6',
                    blueHover: '#1877f2',
                }
            }
        },
    },
    plugins: [],
}
