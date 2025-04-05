import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        freshSage: "var(--fresh-sage)",
        deepEvergreen: "var(--deep-evergreen)",
        darkMoss: "var(--dark-moss)",
        moss: "var(--moss)",
        grayBackground: "var(--gray-bg)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        header: ["Arimo", "sans-serif"],
        body: ["Montserrat", "sans-serif"],
      },
      fontSize: {
        h1: ["36px", { lineHeight: "44px" }],
        h2: ["28px", { lineHeight: "36px" }],
        h3: ["20px", { lineHeight: "28px" }],
        body1: ["16px", { lineHeight: "24px" }],
        body2: ["14px", { lineHeight: "20px" }],
        body3: ["12px", { lineHeight: "16px" }],
        caption: ["12px", { lineHeight: "24px" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
