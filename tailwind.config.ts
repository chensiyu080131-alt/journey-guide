import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 新中式淡雅配色
        'paper-warm': '#F7F3EB',
        'camel': {
          DEFAULT: '#E8DFD0',
          light: '#F0EAE0',
          dark: '#D4C8B8',
        },
        'celadon': {
          50: '#EFF5F3',
          100: '#D8E4E2',
          200: '#B8CCC4',
          300: '#96B0A8',
          400: '#7A9A92',
          500: '#5A7D78',
          600: '#4A6A65',
          700: '#3D5550',
          800: '#334540',
          900: '#2A3835',
        },
        'warm-gray': {
          DEFAULT: '#3D3832',
          light: '#6D6560',
          muted: '#8A8278',
        },
        'seal': '#9E4B42',
        // 《人间滋味》烟火气配色
        'food-paper': '#F8F3E8',
        'food-sauce': '#A65D5D',
        'food-veg': '#7A8C5A',
        'food-tofu': '#F0ECE0',
        // 文学首页参考色
        'literary': {
          cream: '#F9F6F1',
          paper: '#FDFBF7',
          wine: '#8B4545',
          'wine-light': '#A65D5D',
          'wine-dark': '#6B3333',
          ink: '#3D2E2E',
          muted: '#8A7A72',
          card: '#FFFFFF',
          sand: '#EDE8DF',
        },
        // 寻城暖色系 - 旅行感（保留兼容）
        'xuncheng': {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        'ink': {
          50: '#F7F7F5',
          100: '#E8E6E1',
          200: '#D1CDC4',
          300: '#B0A99D',
          400: '#8C8376',
          500: '#6D6357',
          600: '#5A5047',
          700: '#49413B',
          800: '#3D3733',
          900: '#2A2623',
        },
        'paper': '#FDF6EC',
        'charcoal': {
          DEFAULT: '#1A1A1A',
          50: '#2A2A2A',
          100: '#333333',
          900: '#0F0F0F',
        },
        'vermilion': '#E54D42',
        'jade': '#5B8C5A',
        'indigo': '#4A6FA5',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"STSong"', '"SimSun"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
export default config
