/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}', './node_modules/flowbite/**/*.js', './node_modules/flowbite-react/**/*.js'],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
};
