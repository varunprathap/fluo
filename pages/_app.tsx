import "@/styles/globals.css";
import "@aws-amplify/ui-react/styles.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-tiptap/styles.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import amplifyConfig from '../src/amplifyconfiguration';
import Layout from "@/components/layout";
import { loadGoogleScript } from '@/components/auth/GoogleAuth';
import { useEffect } from 'react';

// Initialize Amplify
Amplify.configure(amplifyConfig);

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    loadGoogleScript();
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
