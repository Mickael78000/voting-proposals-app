import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'VotingDApp',
  projectId: 'cd221d05f0eedfba8d4b92e36c2a81ae',
  chains: [
    sepolia
  ],
  ssr: true,
});
