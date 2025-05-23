// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { extendedColors } from './src/styles/colors';
import { fontFamily } from './src/styles/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: extendedColors,
      fontFamily: {
        sans: fontFamily.sans,
        mono: fontFamily.mono,
      },
    },
  },
  plugins: [],
  darkMode: 'class', // or 'media' if you want to use system preference
};

export default config;