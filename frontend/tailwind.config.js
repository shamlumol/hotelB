import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004630",
        "primary-container": "#1f5e46",
        secondary: "#605e58",
        "secondary-container": "#e6e2d9",
        "inverse-on-surface": "#f3f0f0",
        "surface-container-highest": "#e4e2e1",
        "on-secondary-container": "#66645d",
        "surface-bright": "#fcf9f8",
        "on-primary-container": "#96d5b7",
        "on-background": "#1b1c1c",
        "outline-variant": "#bfc9c2",
        surface: "#fcf9f8",
        "surface-variant": "#e4e2e1",
        error: "#ba1a1a",
        "on-primary": "#ffffff",
        "on-tertiary-fixed": "#261900",
        "inverse-surface": "#303030",
        "on-surface": "#1b1c1c",
        outline: "#707973",
        "on-primary-fixed-variant": "#0d513a",
        "inverse-primary": "#95d4b5",
        "on-error": "#ffffff",
        "on-surface-variant": "#404943",
        "surface-container-high": "#eae7e7",
        "tertiary-fixed": "#ffdea4",
        "on-secondary-fixed-variant": "#484740",
        "on-tertiary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "error-container": "#ffdad6",
        "primary-fixed": "#b0f0d1",
        background: "#fcf9f8",
        "surface-dim": "#dcd9d9",
        "on-tertiary-container": "#f1c05d",
        "surface-container": "#f0eded",
        "on-primary-fixed": "#002115",
        "surface-tint": "#2c6950",
        tertiary: "#503800",
        "on-secondary": "#ffffff",
        "secondary-fixed-dim": "#cac6be",
        "tertiary-fixed-dim": "#f0bf5c",
        "on-error-container": "#93000a",
        "secondary-fixed": "#e6e2d9",
        "primary-fixed-dim": "#95d4b5",
        "on-tertiary-fixed-variant": "#5d4200",
        "tertiary-container": "#6d4e00"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        gutter: "24px",
        "margin-desktop": "64px",
        "container-max": "1280px",
        unit: "8px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        display: ["\"Source Serif 4\"", "serif"],
        headline: ["\"Source Serif 4\"", "serif"],
        body: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    forms
  ],
}
