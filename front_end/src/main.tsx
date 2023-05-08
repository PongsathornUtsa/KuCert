import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { WagmiConfig, configureChains, createClient } from 'wagmi'
import { mainnet, sepolia, goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'

import '@rainbow-me/rainbowkit/styles.css'
import './index.css'

const { chains, provider } = configureChains(
  [mainnet, sepolia, goerli],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'NFT minter',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider coolMode chains={chains} theme={lightTheme ({
        accentColor: '#046b63',
        accentColorForeground: 'white',
        fontStack: 'system',
        overlayBlur: 'small',
      })}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
)
