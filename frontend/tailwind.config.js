/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'Inter', 'ui-sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace'],
      },
      colors: {
        // Career360 Official Color Palette
        brand: {
          navy:      '#001D39', // Primary Dark (Sidebar, Main Headings, Strong Text, Major Dark Sections)
          primary:   '#0A4174', // Primary Interaction (Buttons, Links, Active Nav, Main CTAs)
          slate:     '#49769F', // Secondary Blue (Secondary Buttons, Supporting Cards/Charts)
          teal:      '#4E8EA2', // Teal Blue (Skills, Analytics, Data Viz, Secondary Indicators)
          mutedTeal: '#6EA2B3', // Muted Teal (Subtle Indicators, Progress Elements)
          sky:       '#7BBDE8', // Sky Blue (Highlights, Hover States, Progress Indicators)
          lightBlue: '#BDD8E9', // Light Blue (Soft BG, Selected States, Light Sections)
          white:     '#FFFFFF', // White (Main Content, Cards, Forms, Tables, Clean Surfaces)
        },
        // Integrated primary scale for Career360
        primary: {
          50:  '#F0F6FA',
          100: '#E1EFF8',
          200: '#BDD8E9', // Light Blue
          300: '#7BBDE8', // Sky Blue
          400: '#6EA2B3', // Muted Teal
          500: '#4E8EA2', // Teal Blue
          600: '#0A4174', // Primary Blue (Interaction)
          700: '#083660',
          800: '#052749',
          900: '#001D39', // Dark Navy
          950: '#001224',
        },
        surface: {
          50:  '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#BDD8E9', // Light Blue accent
          500: '#6EA2B3', // Muted Teal
          600: '#4E8EA2', // Teal
          700: '#49769F', // Slate Blue
          800: '#0A4174', // Primary Blue
          900: '#001D39', // Dark Navy (Sidebar & Dark brand sections)
          950: '#F4F7FB', // Light clean page background
        },
        // Semantic status colors
        accent: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        danger: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #001D39 0%, #0A4174 100%)',
        'gradient-subtle':  'linear-gradient(135deg, #0A4174 0%, #49769F 100%)',
        'gradient-light':   'linear-gradient(135deg, #FFFFFF 0%, #F0F6FA 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(10,65,116,0.04) 0%, rgba(189,216,233,0.12) 100%)',
        'gradient-navy':    'linear-gradient(135deg, #001D39 0%, #083660 100%)',
      },
      boxShadow: {
        sm:          '0 1px 3px 0 rgba(0, 29, 57, 0.06)',
        md:          '0 4px 6px -1px rgba(0, 29, 57, 0.08), 0 2px 4px -2px rgba(0, 29, 57, 0.04)',
        lg:          '0 10px 15px -3px rgba(0, 29, 57, 0.1), 0 4px 6px -4px rgba(0, 29, 57, 0.05)',
        glow:        '0 0 20px rgba(10, 65, 116, 0.25)',
        'glow-lg':   '0 0 40px rgba(10, 65, 116, 0.35)',
        card:        '0 2px 12px rgba(0, 29, 57, 0.06)',
        'card-hover':'0 8px 24px rgba(0, 29, 57, 0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(-10px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
