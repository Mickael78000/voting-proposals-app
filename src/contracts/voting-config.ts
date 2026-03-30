import VotingABI from './Voting.json';

export const VOTING_CONTRACT = {
  address: '0x7d17f866001Db10E0F2b12cD069F86464753ea9c' as `0x${string}`,
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