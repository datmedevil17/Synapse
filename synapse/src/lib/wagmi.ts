// lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { rootstockTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [rootstockTestnet],
  transports: {
    [rootstockTestnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY'),
  },
  ssr: true,
});
