'use client'

import { FC, PropsWithChildren } from 'react'
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { optimism, optimismGoerli } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: "wdTgzo6QiXtOb9HI8z-uqNaVfZ1PCLCP", // mainnet
    // alchemyId: "GM0NI7rm9xRUUFpPs6bT5wKsM2YTaCuR", // testnet
    walletConnectProjectId: "5a2cb35e0ed7f091a5c2c9a5cf4ed988",
    chains: [optimismGoerli, mainnet],

    // Required
    appName: "Sign up for Farcaster",

    // Optional
    appDescription: "Simple app illustrating how to sing up Farcaster. Educational purposes only.",
    appUrl: "https://www.farcaster.xyz/", // your app's url
    appIcon: "https://framerusercontent.com/modules/jVMp8b8ZfTZpbLnhDiml/NV8p4XHr9GEQFJDJsKKb/assets/DE2CvWySqIW7eDC8Ehs5bCK6g.svg", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={config}>
    <ConnectKitProvider>{children}</ConnectKitProvider>
  </WagmiConfig>
)

export default Web3Provider