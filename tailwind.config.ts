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
        // The Royal Convergence 색상 팔레트 - 확장판
        primary: {
          crimson: {
            DEFAULT: '#9A212D',
            light: '#C83E4D',
            dark: '#7A1A24',
            pale: '#F5E6E8',
            glow: 'rgba(154, 33, 45, 0.4)',
          },
          navy: {
            DEFAULT: '#1A2B50',
            light: '#2A3F6E',
            dark: '#0F1A30',
            pale: '#E8EBF2',
            glow: 'rgba(26, 43, 80, 0.4)',
          },
          gold: {
            DEFAULT: '#C5A059',
            light: '#D4B56A',
            dark: '#9A7B3A',
            pale: '#FBF7F0',
            glow: 'rgba(197, 160, 89, 0.5)',
          },
        },
        neutral: {
          marble: '#F9FAFB',
          warmGray: '#8B8680',
          charcoal: '#2C2C2C',
          ivory: '#FAF8F5',
        },
        accent: {
          sapphire: {
            DEFAULT: '#0066CC',
            light: '#3399FF',
            dark: '#004C99',
            pale: '#E6F2FF',
            glow: 'rgba(0, 102, 204, 0.4)',
          },
          emerald: {
            DEFAULT: '#00A86B',
            light: '#00CC82',
            dark: '#008555',
            pale: '#E6F9F1',
            glow: 'rgba(0, 168, 107, 0.4)',
          },
          amber: {
            DEFAULT: '#FFC107',
            light: '#FFD54F',
            dark: '#FFA000',
            pale: '#FFF8E1',
            glow: 'rgba(255, 193, 7, 0.4)',
          },
          rose: {
            DEFAULT: '#E91E63',
            light: '#F48FB1',
            dark: '#C2185B',
            pale: '#FCE4EC',
            glow: 'rgba(233, 30, 99, 0.4)',
          },
          violet: {
            DEFAULT: '#7C3AED',
            light: '#A78BFA',
            dark: '#5B21B6',
            pale: '#EDE9FE',
            glow: 'rgba(124, 58, 237, 0.4)',
          },
        },
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'Playfair Display', 'serif'],
        sans: ['Pretendard', 'sans-serif'],
        display: ['Cormorant Garamond', 'Noto Serif KR', 'serif'],
      },
      borderRadius: {
        'neo': '8px',
        'neo-md': '12px',
        'neo-lg': '16px',
        'neo-xl': '24px',
      },
      boxShadow: {
        'neo': '0 4px 12px rgba(26, 43, 80, 0.08)',
        'neo-md': '0 8px 24px rgba(26, 43, 80, 0.12)',
        'neo-lg': '0 16px 48px rgba(26, 43, 80, 0.16)',
        'neo-xl': '0 24px 64px rgba(26, 43, 80, 0.2)',
        'glow-gold': '0 0 20px rgba(197, 160, 89, 0.4), 0 0 40px rgba(197, 160, 89, 0.2)',
        'glow-crimson': '0 0 20px rgba(154, 33, 45, 0.4), 0 0 40px rgba(154, 33, 45, 0.2)',
        'glow-sapphire': '0 0 20px rgba(0, 102, 204, 0.4), 0 0 40px rgba(0, 102, 204, 0.2)',
        'glow-emerald': '0 0 20px rgba(0, 168, 107, 0.4), 0 0 40px rgba(0, 168, 107, 0.2)',
        'inner-glow': 'inset 0 0 20px rgba(197, 160, 89, 0.1)',
      },
      backgroundImage: {
        'gradient-royal': 'linear-gradient(135deg, #9A212D 0%, #C5A059 50%, #1A2B50 100%)',
        'gradient-royal-reverse': 'linear-gradient(135deg, #1A2B50 0%, #C5A059 50%, #9A212D 100%)',
        'gradient-hero': 'radial-gradient(ellipse at top center, #2A3F6E 0%, #1A2B50 40%, #0F1A30 100%)',
        'gradient-laurel': 'linear-gradient(180deg, #C5A059 0%, #D4B56A 50%, #C5A059 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #9A212D 0%, #C83E4D 50%, #FFC107 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #1A2B50 0%, #0066CC 50%, #00A86B 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(197, 160, 89, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(154, 33, 45, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(0, 102, 204, 0.1) 0px, transparent 50%)',
        'gradient-shine': 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.4) 55%, transparent 60%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1.5s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-pulse-slow': 'glow-pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'scale-pulse': 'scale-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'laurel-draw': 'laurel-draw 2s ease-out forwards',
        'particle-rise': 'particle-rise 4s ease-out infinite',
        'text-reveal': 'text-reveal 0.8s ease-out forwards',
        'border-dance': 'border-dance 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'laurel-draw': {
          '0%': { strokeDashoffset: '1000', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { strokeDashoffset: '0', opacity: '1' },
        },
        'particle-rise': {
          '0%': { transform: 'translateY(100%) scale(0)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) scale(1)', opacity: '0' },
        },
        'text-reveal': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'border-dance': {
          '0%, 100%': { borderColor: '#C5A059' },
          '33%': { borderColor: '#9A212D' },
          '66%': { borderColor: '#0066CC' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
