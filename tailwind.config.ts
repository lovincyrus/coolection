import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Semantic background tokens */
        bg: "var(--color-bg)",
        surface: "var(--color-bg-surface)",
        "surface-hover": "var(--color-bg-surface-hover)",
        "surface-active": "var(--color-bg-surface-active)",
        "input-bg": "var(--color-bg-input)",
        overlay: "var(--color-bg-overlay)",
        skeleton: "var(--color-bg-skeleton)",
        highlight: "var(--color-bg-highlight)",
        inverted: "var(--color-bg-inverted)",

        /* Semantic text tokens */
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-quaternary": "var(--color-text-quaternary)",
        "text-inverted": "var(--color-text-inverted)",
        "text-accent": "var(--color-text-accent)",

        /* Semantic border tokens */
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",

        /* Semantic icon/spinner tokens */
        "icon-default": "var(--color-icon-default)",
        spinner: "var(--color-spinner)",

        /* Shadcn compatibility tokens */
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
    },
  },
  plugins: [],
};
export default config;
