import flowbite from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './.ladle/**/*.{ts,tsx}', './node_modules/flowbite/**/*.js', './node_modules/flowbite-react/**/*.js'],
  theme: {
    extend: {},
  },
  plugins: [flowbite],
};
