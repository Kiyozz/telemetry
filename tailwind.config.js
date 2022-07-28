/**  @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        nova: ['Proxima Nova', 'sans-serif'],
      },
      colors: {
        primary: {
          300: '#815eec',
          400: '#7f5af0',
          500: '#724aec',
          600: '#7049ea',
          700: '#663be9',
        },
        secondary: '#72757e',
        background: '#16161a',
        'background-lighter': '#1e1e22',
        headline: '#fffffe',
        paragraph: '#94a1b2',
        text: '#fffffe',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
