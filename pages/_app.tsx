import type { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    typeof document !== undefined ? require('bootstrap/dist/js/bootstrap') : null
  }, [])

  return <Component {...pageProps} />
}
