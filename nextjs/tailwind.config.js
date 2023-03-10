/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    './src/views/**/*.{js,ts,jsx,tsx}"',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
