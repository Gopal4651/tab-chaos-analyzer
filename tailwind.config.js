/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        chaos: {
          zen: '#10b981',      // emerald-500
          good: '#3b82f6',     // blue-500  
          mild: '#f59e0b',     // amber-500
          bad: '#ef4444',      // red-500
          apocalypse: '#dc2626' // red-600
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
};