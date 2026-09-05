/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0C0D0E',
          900: '#121316',
          850: '#16181C',
          800: '#1B1D22',
          750: '#22252B',
          700: '#2B2E35',
          600: '#3D414B',
        },
        taupe: {
          50: '#FAF8F5',
          100: '#F0EDE6',
          200: '#E4DFD5',
          300: '#C8C2B7',
          400: '#A6A095',
          500: '#88837A',
          600: '#68645C',
          700: '#4A4741',
          800: '#332F2A',
          900: '#24221E',
          950: '#181614',
        },
        olive: {
          50: '#F5F7EF',
          100: '#E8ECDA',
          200: '#D2DBB4',
          300: '#B5C586',
          400: '#94A465',
          500: '#8A9A5B',
          600: '#6E7E44',
          700: '#536031',
          800: '#3B4628',
          900: '#252B1B',
          950: '#161B0F',
        },
        rust: {
          400: '#E88888',
          500: '#E07A7A',
          600: '#C95A5A',
          800: '#4E2B2B',
          900: '#2B1B1B',
        },
        amberTaupe: {
          400: '#E5C07B',
          500: '#DFB56C',
          800: '#4A3D24',
          900: '#2A2317',
        }
      }
    },
  },
  plugins: [],
}
