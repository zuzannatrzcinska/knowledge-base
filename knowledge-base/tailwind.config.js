/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
        invert: {
          css: {
            '--tw-prose-body': 'rgb(203 213 225)', // slate-300
            '--tw-prose-headings': 'rgb(241 245 249)', // slate-100
            '--tw-prose-links': 'rgb(34 211 238)', // cyan-400
            '--tw-prose-bold': 'rgb(241 245 249)', // slate-100
            '--tw-prose-code': 'rgb(103 232 249)', // cyan-300
            '--tw-prose-pre-bg': 'rgb(15 23 42)', // slate-900
            '--tw-prose-pre-code': 'rgb(226 232 240)', // slate-200
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
