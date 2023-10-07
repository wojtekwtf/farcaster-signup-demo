'use client'

import { FC, PropsWithChildren } from 'react'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    walletConnectProjectId: "5a2cb35e0ed7f091a5c2c9a5cf4ed988",

    // Required
    appName: "Sign up for Farcaster",

    // Optional
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={config}>
    <ConnectKitProvider>{children}</ConnectKitProvider>
  </WagmiConfig>
)

export default Web3Provider