import VotingABI from './Voting.json';

export const VOTING_CONTRACT = {
  address: '0xA5dF5738a350c56EB928D465bCF84f2A8eAe5458' as `0x${string}`,
  abi: VotingABI.abi,
} as const;

export const WORKFLOW_STATUS = {
  0: 'Registering Voters',
  1: 'Proposals Registration Started',
  2: 'Proposals Registration Ended',
  3: 'Voting Session Started',
  4: 'Voting Session Ended',
  5: 'Votes Tallied',
} as const;