export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        nexus: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#2f75ff',
          600: '#1f5fe8',
          700: '#184cc0',
          950: '#0a1633'
        }
      },
      boxShadow: {
        enterprise: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
