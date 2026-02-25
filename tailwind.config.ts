import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Graphik Web"', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['"Tiempos Headline Web"', 'Georgia', 'serif'],
        body: ['"Graphik Web"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        border: {
          DEFAULT: "#2c3440",
        },
        input: "#2c3440",
        ring: "#00e054",
        background: {
          DEFAULT: "#14181c",
          card: "#1e242b",
        },
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#00e054",
          hover: "#00c048",
          foreground: "#000000",
        },
        like: {
          DEFAULT: "#ff8000",
          hover: "#e67300",
        },
        text: {
          main: "#ffffff",
          muted: "#99aabb",
        },
        secondary: {
          DEFAULT: "#1e242b",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1e242b",
          foreground: "#99aabb",
        },
        accent: {
          DEFAULT: "#1e242b",
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: "#40bcf4",
          foreground: "#0b1014",
        },
        popover: {
          DEFAULT: "#1e242b",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#1e242b",
          foreground: "#ffffff",
        },
        chart: {
          "1": "#ff8000",
          "2": "#00e054",
          "3": "#40bcf4",
          "4": "#fbbf24",
          "5": "#8b5cf6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
