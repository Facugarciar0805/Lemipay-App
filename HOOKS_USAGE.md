# Hook Usage Guide

## Treasury Contract Integration

All hooks have been updated to work with the new treasury contract. Below is a quick reference for using each hook.

### Existing Hooks (All Compatible ✓)

#### 1. useCreateTreasury
Creates a new treasury for a group.

```typescript
const { createTreasury, isLoading, error, txHash, reset } = useCreateTreasury()

const hash = await createTreasury(groupId)
if (hash) console.log('Treasury created:', hash)
```

#### 2. useProposeFundRound
Proposes a new funding round.

```typescript
const { proposeFundRound, isLoading, error, txHash } = useProposeFundRound()

const hash = await proposeFundRound(groupId, totalAmountUsdc)
```

#### 3. useContributeToFundRound
Contribute USDC to an active fund round. Requires two steps: approve, then contribute.

```typescript
const { approve, contribute, isApproving, isContributing, error } = useContributeToFundRound()

// Step 1: Approve USDC spending
await approve(amountUsdc)

// Step 2: Contribute to the round
await contribute(roundId, amountUsdc)
```

#### 4. useProposeRelease
Proposes a payment release from the treasury.

```typescript
const { proposeRelease, isLoading, error, txHash } = useProposeRelease()

const hash = await proposeRelease(groupId, destinationAddress, amountUsdc)
```

#### 5. useApproveRelease
Approves a release proposal (counts toward required approvals).

```typescript
const { approveRelease, isLoading, error } = useApproveRelease()

const hash = await approveRelease(proposalId)
```

#### 6. useExecuteRelease
Executes a release proposal after it has enough approvals.

```typescript
const { executeRelease, isLoading, error } = useExecuteRelease()

const hash = await executeRelease(proposalId)
```

### New Hooks

#### 7. useWithdrawContribution ⭐ NEW
Withdraw your contribution from a fund round that hasn't completed yet.

```typescript
const { withdrawContribution, isLoading, error, txHash } = useWithdrawContribution()

const hash = await withdrawContribution(roundId)
```

**Use case**: User changes their mind about contributing to a round and wants to get their USDC back.

#### 8. useCancelReleaseProposal ⭐ NEW
Cancel a release proposal you created (before it's been fully approved/executed).

```typescript
const { cancelReleaseProposal, isLoading, error, txHash } = useCancelReleaseProposal()

const hash = await cancelReleaseProposal(proposalId)
```

**Use case**: User realizes they proposed a payment to the wrong address or wrong amount and wants to cancel before it's executed.

## Helper Functions

Two new read-only functions are available in `stellar-client.ts` for checking treasury state:

```typescript
import { getGroupBalance, hasSufficientGroupBalance } from '@/lib/stellar-client'

// Get total balance in a group's treasury
const balance = await getGroupBalance(groupId, userAddress)

// Check if treasury has enough to pay an amount
const hasEnough = await hasSufficientGroupBalance(groupId, amountRaw, userAddress)
```

## Error Handling

All hooks follow the same error pattern:

```typescript
const { method, error } = useYourHook()

if (error) {
  switch (error.code) {
    case 'WALLET_NOT_INSTALLED':
      // Show "Install Freighter" message
      break
    case 'WALLET_NOT_CONNECTED':
      // Show "Unlock wallet" message
      break
    case 'USER_REJECTED':
      // User rejected the transaction
      break
    case 'SIMULATION_FAILED':
      // Transaction won't work (not enough balance, etc)
      break
    case 'SEND_FAILED':
      // Network rejected the transaction
      break
    case 'TX_FAILED':
      // Transaction failed on-chain
      break
    case 'UNKNOWN':
      // Unknown error
      break
  }
}
```

## Contract Specifications

The new contract implements these core operations:

| Operation | Hook | Contract Function |
|-----------|------|-------------------|
| Create group treasury | useCreateTreasury | create_treasury |
| Propose funding round | useProposeFundRound | propose_fund_round |
| Contribute to round | useContributeToFundRound | contribute_to_fund_round |
| Withdraw contribution | useWithdrawContribution | withdraw_contribution |
| Propose payment release | useProposeRelease | propose_release |
| Approve release | useApproveRelease | approve_release |
| Execute release | useExecuteRelease | execute_release |
| Cancel proposal | useCancelReleaseProposal | cancel_release_proposal |

## Contract Address

The new treasury contract is deployed at:
```
CB2NG4BAHP3ZA2QPLLBPWMI6O27VRGK22GSUJAWHTDPDSNXCBPXPVJ24
```

This is configured in your `.env` file as:
```dotenv
NEXT_PUBLIC_NEW_CREATE_TREASURY_CONTRACT_ID=CB2NG4BAHP3ZA2QPLLBPWMI6O27VRGK22GSUJAWHTDPDSNXCBPXPVJ24
```

