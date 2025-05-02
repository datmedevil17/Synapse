// lib/wagmi.ts
import { rootstockTestnet } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';

export const config = createConfig({
  chains: [rootstockTestnet],
  transports: {
    [rootstockTestnet.id]: http(),
  },
  ssr: true,
});
