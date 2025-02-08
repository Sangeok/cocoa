import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f0f1f3',
          200: '#e2e4e7',
          300: '#d1d4d8',
          400: '#9da3a9',
          500: '#848a91',
          600: '#6b7178',
          700: '#565b61',
          800: '#2f3237',
          900: '#1a1c20',
          950: '#111214',
        },
      },
    },
  },
  plugins: [],
};

export default config;
