export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        dark: { 
          bg: '#0f0f1a', 
          card: '#16213e', 
          border: '#1e2d4a',
          hover: '#1c2a45'
        },
        gym: { primary: '#FF6B35', secondary: '#e55a25' }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 53, 0.15)',
        'glow-sm': '0 0 10px rgba(255, 107, 53, 0.1)',
      }
    },
  },
  plugins: [],
}