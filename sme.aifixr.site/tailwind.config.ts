import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "integrity-blue": "#0D4ABB",
        "excellence-navy": "#1a2332",
        "courage-pink": "#E91E8C",
        "agility-cyan": "#00D4FF",
        "collaboration-purple": "#8B5CF6",
        // AIFIX Colors
        "aifix-primary": "#5B3BFA",
        "aifix-primary-hover": "#6A7CFD",
        "aifix-primary-light": "#A58DFF",
        "aifix-secondary": "#00B4FF",
        "aifix-secondary-hover": "#60D1FF",
        "aifix-secondary-light": "#E9F5FF",
        "aifix-integrity": "#1A439C",
        "aifix-integrity-light": "#2A64E0",
        "aifix-excellence": "#0B2562",
        "aifix-excellence-light": "#1A439C",
        "aifix-courage": "#E30074",
        "aifix-courage-light": "#FF469E",
        "aifix-together": "#00A3B5",
        "aifix-together-light": "#00D0D9",
        "aifix-for-better": "#6B23C0",
        "aifix-for-better-light": "#9C41E6",
        background: "var(--background)",
        "background-alt": "var(--background-alt)",
        foreground: "var(--foreground)",
        "foreground-muted": "var(--foreground-muted)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        "input-background": "var(--input-background)",
        ring: "var(--ring)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #0D4ABB 0%, #1a2332 50%, #8B5CF6 100%)",
        "gradient-cyan": "linear-gradient(135deg, #00D4FF 0%, #0D4ABB 100%)",
        "gradient-pink": "linear-gradient(135deg, #E91E8C 0%, #8B5CF6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

