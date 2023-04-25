import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '@/components/layout'
import { ChakraProvider } from '@chakra-ui/react'
import socketService from "../services/socket"
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:9000")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };
  useEffect(() => {
    console.log("connecting to socket")
    connectSocket();
    console.log("connected to socket")
  }, []);
  return (
  <ChakraProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </ChakraProvider>
  )
}
