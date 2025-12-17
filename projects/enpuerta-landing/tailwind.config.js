/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./projects/enpuerta-landing/src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0891b2', // teal-600
                    hover: '#0e7490',   // teal-700
                },
                secondary: {
                    DEFAULT: '#f59e0b', // amber-500
                },
            },
        },
    },
    plugins: [],
}
