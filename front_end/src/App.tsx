import React from 'react';
import { ChainId, DAppProvider } from '@usedapp/core';
import { Header } from "./components/Header"
import Container from '@mui/material/Container';

const config = {
  supportedChains: [ChainId.Goerli, ChainId.Sepolia, 1337]
};

function App() {
  return (
    <DAppProvider config={config}>
      <Header />
      <Container maxWidth = 'md'>
        <div> Hello World </div>
      </Container>
    </DAppProvider>
  );
}

export default App;
