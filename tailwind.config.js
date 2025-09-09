// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
       background: '#F9FAFB',   // Light mode background
    darkBg: '#0F172A',       // Dark mode background
    primary: '#1F2935',      // Slate gray text
    darkText: '#F1F5F9',     // Light text for dark mode
    accent: '#6366F1',       // Indigo for buttons/links
    accentDark: '#A78BFA',   // Violet for dark mode accents
    cardLight: '#FFFFFF',    // Card background (light)
    cardDark: '#1E293B',     // Card background (dark)
    borderLight: '#E5E7EB',  // Light border
    borderDark: '#334155',   // Dark border

      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      transitionProperty: {
        spacing: 'margin, padding',
        position: 'top, left, right, bottom',
      },
    },
  },
  plugins: [],
};