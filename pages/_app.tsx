// _app.tsx
import React from "react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../src/context/ThemeContext"; // Adjust the import path as needed
// import { Layout } from "@components/Layout";
import "src/styles/global.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
