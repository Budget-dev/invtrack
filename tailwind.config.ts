import type { Config } from 'tailwindcss';

export default {
  darkMode: [],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Sora', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: '#F7F9FC',
        foreground: '#16202E',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#16202E',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#16202E',
        },
        primary: {
          DEFAULT: '#2B7CE9',
          foreground: '#FFFFFF',
          600: '#1D6FE0',
          700: '#1656B4',
          900: '#163E77',
        },
        secondary: {
          DEFAULT: '#F7F9FC',
          foreground: '#5A6B80',
        },
        muted: {
          DEFAULT: '#E3EAF2',
          foreground: '#8494A8',
        },
        accent: {
          DEFAULT: '#EEF5FF',
          foreground: '#16202E',
        },
        border: '#E3EAF2',
        input: '#E3EAF2',
        ring: '#2B7CE9',
        // Role Identity Colors
        client: {
          DEFAULT: '#12855A',
          tint: '#E8F6EF',
        },
        auditor: {
          DEFAULT: '#E0762B',
          tint: '#FDF0E3',
        },
        admin: {
          DEFAULT: '#6D4BC6',
          tint: '#F0EBFB',
        },
        // Functional Colors
        success: '#12855A',
        warning: '#B5730F',
        danger: '#C0362C',
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '4px',
        full: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,33,57,.06), 0 8px 24px -12px rgba(16,33,57,.18)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
