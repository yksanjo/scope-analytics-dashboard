/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D1117',
        surface: '#161B22',
        elevated: '#21262D',
        border: '#30363D',
        primary: '#58A6FF',
        success: '#3FB950',
        warning: '#D29922',
        error: '#F85149',
        strategic: '#A371F7',
        tactical: '#79C0FF',
        'text-primary': '#F0F6FC',
        'text-secondary': '#8B949E',
        'text-muted': '#6E7681',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(88, 166, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
