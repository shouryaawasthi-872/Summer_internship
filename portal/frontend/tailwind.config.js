/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // KR Mangalam University brand colors
        primary: {
          50:  '#e6ecf5',
          100: '#b3c4e0',
          200: '#809dcc',
          300: '#4d75b8',
          400: '#2657a9',
          500: '#003087',   // Official KR Blue
          600: '#002876',
          700: '#001f5c',
          800: '#001548',
          900: '#000c30',
        },
        accent: {
          50:  '#fce8ec',
          100: '#f5b7c3',
          200: '#ed879a',
          300: '#e55671',
          400: '#de3450',
          500: '#C8102E',   // Official KR Red
          600: '#a50d24',
          700: '#820a1b',
          800: '#5f0713',
          900: '#3c040c',
        },
        surface: '#ffffff',
        navy: {
          50:  '#eef1f8',
          900: '#001f5c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgba(0,48,135,0.08), 0 1px 2px -1px rgba(0,48,135,0.05)',
        'card-md': '0 4px 12px 0 rgba(0,48,135,0.10), 0 2px 4px -1px rgba(0,48,135,0.06)',
        'card-lg': '0 8px 24px 0 rgba(0,48,135,0.12), 0 4px 8px -2px rgba(0,48,135,0.08)',
      },
      backgroundImage: {
        'kr-gradient':      'linear-gradient(135deg, #003087, #001f5c)',
        'kr-gradient-soft': 'linear-gradient(135deg, #003087 0%, #0041b5 100%)',
        'kr-hero':          'linear-gradient(135deg, #003087 0%, #001f5c 60%, #000c30 100%)',
      },
    },
  },
  plugins: [],
};
