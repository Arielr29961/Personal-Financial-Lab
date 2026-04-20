import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ['var(--font-heebo)', 'Heebo', 'sans-serif'],
      },
      colors: {
        // Design tokens
        surface: {
          DEFAULT: '#1e293b', // slate-800
          elevated: '#0f172a', // slate-950
          card: '#1e293b',    // slate-800
          input: '#0f172a',   // slate-950
        },
      },
    },
  },
  plugins: [],
};

export default config;
