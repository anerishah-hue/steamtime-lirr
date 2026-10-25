/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coal: {
          dark: '#0C080A',
          DEFAULT: '#120E10',
          surface: '#1A1417',
          panel: '#151013',
        },
        oxblood: {
          dark: '#140609',
          DEFAULT: '#1F0C10',
          surface: '#2B1117',
          hover: '#38161E',
          border: '#4E1D27',
        },
        parchment: {
          50: '#FBF8F1',
          100: '#F5EEDB',
          200: '#EBDCB9',
          300: '#DEC593',
          400: '#CEAC6C',
          500: '#B88E44',
          card: '#F7F2E4',
          DEFAULT: '#F4EEDB',
          border: '#D8CCA8',
          hover: '#EDE4CC',
          900: '#3D2A12',
        },
        ink: {
          DEFAULT: '#1C140E',
          primary: '#1C140E',
          secondary: '#48392F',
          muted: '#6B5749',
          faint: '#927D6E',
        },
        verdigris: {
          DEFAULT: '#2E8872',
          light: '#44BBA4',
          dark: '#1B5648',
          bg: '#E1F2ED',
          border: '#3A9B83',
        },
        brass: {
          light: '#F3E5AB',
          DEFAULT: '#C5A059',
          dark: '#8A6E2D',
          burnished: '#B5942F',
          border: '#9E7D3B',
          glow: 'rgba(197, 160, 89, 0.25)',
        },
        copper: {
          light: '#DA8A67',
          DEFAULT: '#B87333',
          dark: '#874D1B',
        },
        steampunk: {
          dark: '#120E10',
          panel: '#1F0C10',
          metal: '#2B1117',
          gauge: '#0F0B0D',
          rivet: '#484034',
        }
      },
      fontFamily: {
        serif: ['"IM Fell English"', '"Playfair Display"', 'Georgia', 'serif'],
        'im-fell': ['"IM Fell English"', 'serif'],
        'im-fell-sc': ['"IM Fell English SC"', 'serif'],
        playfair: ['"Playfair Display"', 'serif'],
        cinzel: ['"Cinzel"', '"IM Fell English"', 'serif'],
        mono: ['"Share Tech Mono"', '"Courier Prime"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brass': '0 0 15px rgba(212, 175, 55, 0.25)',
        'brass-lg': '0 0 30px rgba(212, 175, 55, 0.4)',
        'copper': '0 0 15px rgba(184, 115, 51, 0.3)',
        'steampunk-inset': 'inset 0 2px 6px rgba(0, 0, 0, 0.8), inset 0 -1px 2px rgba(212, 175, 55, 0.2)',
        'gauge': 'inset 0 0 15px rgba(0,0,0,0.9), 0 4px 10px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'brushed-metal': 'linear-gradient(135deg, #2b2621 0%, #1f1b17 50%, #2b2621 100%)',
        'parchment-pattern': 'radial-gradient(#e5d5b7 15%, transparent 16%)',
      }
    },
  },
  plugins: [],
}
