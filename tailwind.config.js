/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./projects/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': {
                    DEFAULT: '#2B6B6F',
                    hover: '#235659',
                    light: '#348085',
                },
                'background': {
                    DEFAULT: '#EAE4D9',
                    dark: '#DCD4C7',
                },
                'accent': '#BF935B',
            },
        },
    },
    plugins: [],
}
