import React from "react";
import type { AppProps } from "next/app";
import { Layout } from "@components/Layout";

import "src/styles/global.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
