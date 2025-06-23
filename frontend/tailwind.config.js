/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#4C566A", // Nord3
        input: "#434C5E", // Nord2
        ring: "#88C0D0", // Nord8
        background: "#2E3440", // Nord0
        foreground: "#D8DEE9", // Nord4
        primary: {
          DEFAULT: "#81A1C1", // Nord9
          foreground: "#ECEFF4", // Nord6
        },
        secondary: {
          DEFAULT: "#8FBCBB", // Nord7
          foreground: "#D8DEE9", // Nord4
        },
        destructive: {
          DEFAULT: "#BF616A", // Nord11
          foreground: "#ECEFF4", // Nord6
        },
        muted: {
          DEFAULT: "#434C5E", // Nord2
          foreground: "#D8DEE9", // Nord4
        },
        accent: {
          DEFAULT: "#5E81AC", // Nord10
          foreground: "#ECEFF4", // Nord6
        },
        popover: {
          DEFAULT: "#3B4252", // Nord1
          foreground: "#D8DEE9", // Nord4
        },
        card: {
          DEFAULT: "#3B4252", // Nord1
          foreground: "#D8DEE9", // Nord4
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}