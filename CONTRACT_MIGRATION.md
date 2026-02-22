# Treasury Contract Migration Summary

## Changes Made

### 1. Updated Contract ID Resolution (`lib/stellar-client.ts`)
- Modified `TREASURY_CONTRACT_ID` constant to prioritize `NEXT_PUBLIC_NEW_CREATE_TREASURY_CONTRACT_ID` from `.env`
- Falls back to `NEXT_PUBLIC_CREATE_TREASURY_CONTRACT_ID` if the new one is not set
- This allows seamless migration to the new contract: `CB2NG4BAHP3ZA2QPLLBPWMI6O27VRGK22GSUJAWHTDPDSNXCBPXPVJ24`

### 2. Added New Helper Functions (`lib/stellar-client.ts`)
- `getGroupBalance(groupId, sourceAddress)` - Query the total balance of a group's treasury
- `hasSufficientGroupBalance(groupId, amount, sourceAddress)` - Check if a group has enough balance for an amount

These are read-only functions that allow checking treasury balance before executing transactions.

### 3. Created New Hooks

#### `hooks/useWithdrawContribution.ts`
- Allows users to withdraw their contribution from a fund round
- Uses `withdraw_contribution(round_id: u64, user: Address)` contract function
- Implements standard error handling and transaction polling

#### `hooks/useCancelReleaseProposal.ts`
- Allows users to cancel a release proposal they created
- Uses `cancel_release_proposal(proposal_id: u64, user: Address)` contract function
- Implements standard error handling and transaction polling

## Contract Signatures Verified ✓

All existing hooks are compatible with the new contract:

| Function | Signature | Status |
|----------|-----------|--------|
| `propose_fund_round` | `(u64, i128, Address) -> u64` | ✓ No changes needed |
| `approve_release` | `(u64, Address) -> Void` | ✓ No changes needed |
| `execute_release` | `(u64) -> Void` | ✓ No changes needed |
| `propose_release` | `(Address, i128, u64, Address) -> u64` | ✓ No changes needed |
| `create_treasury` | `(u64, Address) -> Void` | ✓ No changes needed |
| `contribute_to_fund_round` | `(u64, i128, Address) -> Void` | ✓ No changes needed |

## Environment Setup

Make sure your `.env` file includes:

```dotenv
NEXT_PUBLIC_NEW_CREATE_TREASURY_CONTRACT_ID=CB2NG4BAHP3ZA2QPLLBPWMI6O27VRGK22GSUJAWHTDPDSNXCBPXPVJ24
```

The old `NEXT_PUBLIC_CREATE_TREASURY_CONTRACT_ID` can be kept as a fallback.

## What's Next

The hooks are now ready to use the new contract. All existing functionality (propose fund rounds, contribute, propose releases, approve, execute) continues to work with the new contract. Additionally, you now have:

1. Helper functions to check treasury balance
2. Ability to withdraw contributions
3. Ability to cancel release proposals

These new features enable better UX by allowing users to manage their contributions and proposals more flexibly.

