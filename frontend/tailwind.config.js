/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // Prevent Bootstrap override
  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        secondary: "#6610f2",
      },
    },
  },

  plugins: [],
};
