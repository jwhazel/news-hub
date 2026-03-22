import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          300: '#66bffe',
          400: '#33adfe',
          500: '#0098fe',
          600: '#007fd4',
          700: '#0066aa',
          800: '#004d80'
        }
      }
    }
  }
} satisfies Config
