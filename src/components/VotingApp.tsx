'use client';

/**
 * VotingApp Component
 * 
 * This component implements a decentralized voting dapp with role-based views:
 * 
 * ROLE TOGGLE MECHANISM:
 * - The component reads the contract owner address and compares it with the connected wallet
 * - If the user IS the owner, they can toggle between "Administrator" and "Voter" views via viewMode state
 * - If the user is NOT the owner, they always see the Voter view
 * - The toggle is rendered as a pill-style switcher in the header
 * 
 * ETHEREUM FOUNDATION COLOR PALETTE:
 * - Primary: #627EEA (Ethereum purple) for CTAs, active states, and primary buttons
 * - Dark surfaces: #3C3C3D for cards, panels, and darker backgrounds
 * - Light surfaces: #F7F9FC and #E8EBF2 for subtle backgrounds and borders
 * - Accent: #A0AEC0 for secondary text and disabled states
 * - The palette creates a professional, web3-native aesthetic aligned with Ethereum Foundation branding
 * 
 * All styling is externalized to VotingApp.module.css
 */

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { VOTING_CONTRACT, WORKFLOW_STATUS } from '@/contracts/voting-config';
import { useState, useEffect } from 'react';
import styles from './VotingApp.module.css';
import { config } from '@/wagmi';
import { readContract } from 'wagmi/actions';

type ViewMode = 'admin' | 'voter';

export function VotingApp() {
  const { address, isConnected, chain } = useAccount();
  
  // Component state
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [voterAddress, setVoterAddress] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [proposalsList, setProposalsList] = useState<Array<{id: number, description: string, voteCount: bigint}>>([]);

  const fetchProposals = async () => {
    const proposals = [];
    let index = 0;
    
    try {
      while (true) {
        const proposal = await readContract(config, {
          ...VOTING_CONTRACT,
          functionName: 'proposals',
          args: [BigInt(index)],
        }) as [string, bigint];
        
        if (proposal) {
          proposals.push({
            id: index,
            description: proposal[0],
            voteCount: proposal[1],
          });
          index++;
        }
      }
    } catch (error) {
      // No more proposals
    }
    
    setProposalsList(proposals);
  };

   const { data: owner } = useReadContract({
    ...VOTING_CONTRACT,
    functionName: 'owner',
  });

  const isOwner = address && owner 
    ? address.toLowerCase() === (owner as string).toLowerCase() 
    : false;

  const displayMode = isOwner ? viewMode : 'voter';

  
  useEffect(() => {
    if (isConnected && displayMode === 'voter') {
      fetchProposals();
    }
  }, [isConnected, displayMode, fetchProposals]);
  
  
  // Contract reads
 

  const { data: workflowStatus } = useReadContract({
    ...VOTING_CONTRACT,
    functionName: 'workflowStatus',
  });

  // Contract writes
  const { writeContract, isPending } = useWriteContract();

  // Computed values
  
  const currentStatus = workflowStatus !== undefined 
    ? WORKFLOW_STATUS[Number(workflowStatus) as keyof typeof WORKFLOW_STATUS] 
    : 'Loading...';

  // Handlers
  const handleRegisterVoter = () => {
    if (!voterAddress) return;
    writeContract({
      ...VOTING_CONTRACT,
      functionName: 'addVoterToWhitelist',
      args: [voterAddress as `0x${string}`],
      gas: 500000n,
    });
    setVoterAddress('');
  };

  const handleWorkflowTransition = (functionName: string) => {
    writeContract({
      ...VOTING_CONTRACT,
      functionName: functionName as any,
      gas: 300000n,
    });
  };

  const handleAddProposal = () => {
    if (!proposalDesc) return;
    writeContract({
      ...VOTING_CONTRACT,
      functionName: 'addProposal',
      args: [proposalDesc],
      gas: 500000n,
    });
    setProposalDesc('');
  };

  const handleVote = () => {
    if (!proposalId) return;
    writeContract({
      ...VOTING_CONTRACT,
      functionName: 'vote',
      args: [BigInt(proposalId)],
      gas: 500000n,
    });
    setProposalId('');
  };

  

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.branding}>
            <h1 className={styles.title}>Voting DApp</h1>
            {chain && (
              <span className={styles.network}>{chain.name}</span>
            )}
          </div>
          
          <div className={styles.headerActions}>
            {address && (
              <span className={styles.addressBadge}>
                {formatAddress(address)}
              </span>
            )}
            <ConnectButton />
          </div>
        </div>

        {/* Role Toggle - only visible if user is owner */}
        {isConnected && isOwner && (
          <div className={styles.roleToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'admin' ? styles.toggleActive : ''}`}
              onClick={() => setViewMode('admin')}
            >
              Administrator
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'voter' ? styles.toggleActive : ''}`}
              onClick={() => setViewMode('voter')}
            >
              Voter
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {!isConnected ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Connect Your Wallet</h2>
            <p className={styles.emptyText}>
              Please connect your wallet to participate in decentralized voting on Sepolia testnet
            </p>
          </div>
        ) : (
          <>
            {/* Status Banner */}
            <div className={styles.statusBanner}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Current Phase:</span>
                <span className={styles.statusValue}>{currentStatus}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Your Role:</span>
                <span className={styles.statusValue}>
                  {isOwner ? (displayMode === 'admin' ? 'Administrator' : 'Voter (Owner)') : 'Voter'}
                </span>
              </div>
            </div>

            {/* Administrator View */}
            {displayMode === 'admin' && (
              <div className={styles.adminSection}>
                <h2 className={styles.sectionTitle}>Administrator Controls</h2>
                
                {/* Voter Registration Card */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Register Voter</h3>
                  <p className={styles.cardDescription}>
                    Add a voter address to the whitelist to allow participation
                  </p>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={voterAddress}
                      onChange={(e) => setVoterAddress(e.target.value)}
                      className={styles.input}
                      disabled={isPending}
                    />
                    <button
                      onClick={handleRegisterVoter}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={!voterAddress || isPending}
                    >
                      Register Voter
                    </button>
                  </div>
                </div>

                {/* Workflow Management Card */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Workflow Management</h3>
                  <p className={styles.cardDescription}>
                    Transition the voting process through its lifecycle phases
                  </p>
                  <div className={styles.workflowButtons}>
                    <button
                      onClick={() => handleWorkflowTransition('startProposalsRegistration')}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={isPending}
                    >
                      Start Proposals
                    </button>
                    <button
                      onClick={() => handleWorkflowTransition('endProposalRegistration')}
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      disabled={isPending}
                    >
                      End Proposals
                    </button>
                    <button
                      onClick={() => handleWorkflowTransition('startVotingSession')}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={isPending}
                    >
                      Start Voting
                    </button>
                    <button
                      onClick={() => handleWorkflowTransition('endVotingSession')}
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      disabled={isPending}
                    >
                      End Voting
                    </button>
                    <button
                      onClick={() => handleWorkflowTransition('tallyVotes')}
                      className={`${styles.button} ${styles.buttonAccent}`}
                      disabled={isPending}
                    >
                      Tally Votes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Voter View */}
            {displayMode === 'voter' && (
              <div className={styles.voterSection}>
                <h2 className={styles.sectionTitle}>Voter Actions</h2>

                {/* Submit Proposal Card */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Submit Proposal</h3>
                  <p className={styles.cardDescription}>
                    Create a new proposal for the community to vote on
                  </p>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      placeholder="Describe your proposal..."
                      value={proposalDesc}
                      onChange={(e) => setProposalDesc(e.target.value)}
                      className={styles.input}
                      disabled={isPending}
                    />
                    <button
                      onClick={handleAddProposal}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={!proposalDesc || isPending}
                    >
                      Add Proposal
                    </button>
                  </div>
                </div>

                {/* Cast Vote Card */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Cast Your Vote</h3>
                  <p className={styles.cardDescription}>
                    Vote for a proposal by entering its ID
                  </p>
                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      placeholder="Proposal ID"
                      value={proposalId}
                      onChange={(e) => setProposalId(e.target.value)}
                      className={styles.input}
                      disabled={isPending}
                      min="0"
                    />
                    <button
                      onClick={handleVote}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={!proposalId || isPending}
                    >
                      Vote
                    </button>
                  </div>
                </div>

                {/* Proposals List Placeholder */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Active Proposals</h3>
                  <p className={styles.cardDescription}>
                    Browse and vote on active proposals
                  </p>
                  <div className={styles.proposalsList}>
                    {proposalsList.length === 0 ? (
                      <p className={styles.emptyText}>
                        No proposals yet. {currentStatus === 'Proposals Registration Started' ? 'Be the first to add one!' : 'Check back later.'}
                      </p>
                    ) : (
                      proposalsList.map((proposal) => (
                        <div key={proposal.id} className={styles.proposalCard}>
                          <div className={styles.proposalHeader}>
                            <span className={styles.proposalId}>#{proposal.id}</span>
                            <span className={styles.voteCount}>{proposal.voteCount.toString()} votes</span>
                          </div>
                          <p className={styles.proposalDescription}>{proposal.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}