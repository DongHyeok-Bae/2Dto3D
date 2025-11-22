import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // The Royal Convergence 색상 팔레트
        primary: {
          crimson: '#9A212D',      // Kyung Hee Crimson
          navy: '#1A2B50',         // Intellectual Navy
          gold: '#C5A059',         // Laurel Gold
        },
        neutral: {
          marble: '#F9FAFB',       // Marble White
          warmGray: '#8B8680',     // Warm Gray
          charcoal: '#2C2C2C',     // Charcoal
        },
        accent: {
          sapphire: '#0066CC',     // Royal Sapphire
          emerald: '#00A86B',      // Renaissance Emerald
          amber: '#FFC107',        // Amber Highlight
        },
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'serif'],
        sans: ['Pretendard', 'sans-serif'],
      },
      borderRadius: {
        'neo': '8px',
        'neo-md': '12px',
        'neo-lg': '16px',
      },
      boxShadow: {
        'neo': '0 4px 12px rgba(26, 43, 80, 0.08)',
        'neo-md': '0 8px 24px rgba(26, 43, 80, 0.12)',
        'neo-lg': '0 16px 48px rgba(26, 43, 80, 0.16)',
      },
    },
  },
  plugins: [],
}

export default config
