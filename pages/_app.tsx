import React from "react";
import type { AppProps } from "next/app";
import { Layout } from "@components/Layout";

import "src/styles/global.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Component {...pageProps} />
  );
}

export default MyApp;
