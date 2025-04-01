
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4CAF50",
          light: "#E8F5E9",
          dark: "#388E3C",
        },
        secondary: {
          DEFAULT: "#F5F7FA",
          dark: "#1A1F2C",
        },
        text: {
          DEFAULT: "#222222",
          light: "#666666",
          dark: "#E0E0E0",
        },
        accent: {
          DEFAULT: "#E8F5E9",
          foreground: "#4CAF50",
          dark: "#1A2C1D",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // New dark mode colors from the image
        "dm-primary": "#3182CE", // Blue primary color
        "dm-success": "#38A169", // Green success color
        "dm-alert": "#E05D6F", // Red alert color
        "dm-idle": "#DD8B32", // Orange idle color
        "dm-foreground": "#1E1E1E", // Very dark gray foreground
        "dm-background": "#333333", // Dark gray background
        "dm-text": "#E5E5E5", // Light gray text
        "dm-text-supporting": "#A0A0A0", // Gray supporting text
        "dm-text-shy": "#6E6E6E", // Medium gray shy text
        "dm-mist": "#404040", // Medium-dark gray mist
        "dm-mist-extra": "#4F4F4F", // Slightly lighter mist
        "dm-overlay": "#121212", // Nearly black overlay
        "dm-contrast": "#FFFFFF", // White contrast
        // Labels from the image (you can use these for various UI elements)
        "dm-label-1": "#E05D6F", // Pink/Red
        "dm-label-2": "#DD8B32", // Orange
        "dm-label-3": "#D4CB38", // Yellow
        "dm-label-4": "#A6D037", // Lime green
        "dm-label-5": "#38A169", // Green
        "dm-label-6": "#39C481", // Teal green
        "dm-label-7": "#3ECFCF", // Cyan
        "dm-label-8": "#3182CE", // Blue
        "dm-label-9": "#4553CE", // Indigo
        "dm-label-10": "#7048C6", // Purple
        "dm-label-11": "#B346B3", // Magenta
        "dm-label-12": "#E05D6F", // Pink/Red again
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
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        marquee: "marquee 40s linear infinite",
        "marquee-fast": "marquee 10s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
