/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f0ff',
          purple: '#b44aff',
          pink: '#ff2d7c',
          green: '#39ff14',
          orange: '#ff6a00',
        },
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#252540',
        },
        light: {
          50: '#fafbfe',
          100: '#f4f6fb',
          200: '#e8ecf4',
          300: '#d4dae8',
          400: '#b0b9d1',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'float-orb': 'float-orb 20s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'tilt-in': 'tilt-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up-fade': 'slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'magnetic-hover': 'magnetic-hover 0.3s ease forwards',
        'aurora': 'aurora 8s ease-in-out infinite',
        'aurora-slow': 'aurora 12s ease-in-out infinite',
        'holographic': 'holographic 6s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
        'constellation': 'constellation 20s linear infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blur-in': 'blur-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'bubble-rise': 'bubble-rise 6s linear infinite',
        'score-pulse': 'score-pulse 0.6s ease-in-out 1.2s 1',
        'gauge-bounce': 'gauge-bounce 0.5s ease-in-out 0.3s 1',
        'page-fade-in': 'page-fade-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color, rgba(0, 240, 255, 0.2))' },
          '50%': { boxShadow: '0 0 40px var(--glow-color, rgba(0, 240, 255, 0.5))' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        'float-orb': {
          '0%': { transform: 'translate(-50%, -50%) translateY(0px) translateX(0px)' },
          '25%': { transform: 'translate(-50%, -50%) translateY(-30px) translateX(15px)' },
          '50%': { transform: 'translate(-50%, -50%) translateY(-10px) translateX(-20px)' },
          '75%': { transform: 'translate(-50%, -50%) translateY(-40px) translateX(10px)' },
          '100%': { transform: 'translate(-50%, -50%) translateY(0px) translateX(0px)' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'tilt-in': {
          '0%': { opacity: '0', transform: 'perspective(800px) rotateX(8deg) translateY(20px)' },
          '100%': { opacity: '1', transform: 'perspective(800px) rotateX(0deg) translateY(0)' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'magnetic-hover': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        'aurora': {
          '0%': { transform: 'translateX(-25%) translateY(-5%) rotate(0deg) scale(1)', opacity: '0.5' },
          '33%': { transform: 'translateX(10%) translateY(5%) rotate(120deg) scale(1.1)', opacity: '0.7' },
          '66%': { transform: 'translateX(-15%) translateY(-10%) rotate(240deg) scale(0.9)', opacity: '0.4' },
          '100%': { transform: 'translateX(-25%) translateY(-5%) rotate(360deg) scale(1)', opacity: '0.5' },
        },
        'holographic': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%' },
          '75%': { borderRadius: '60% 40% 60% 30% / 70% 30% 50% 60%' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'constellation': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'blur-in': {
          '0%': { opacity: '0', filter: 'blur(12px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        'bubble-rise': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '50%': { opacity: '0.2' },
          '100%': { transform: 'translateY(-400px) scale(0.3)', opacity: '0' },
        },
        'score-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        'gauge-bounce': {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'page-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      opacity: {
        '3': '0.03',
        '8': '0.08',
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
