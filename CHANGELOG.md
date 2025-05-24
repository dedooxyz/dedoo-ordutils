# Changelog

## [1.0.0] - 2024-12-19

### 🎉 Initial Release as dedoo-ordutils
- **BREAKING CHANGE**: Package renamed from `bel-ord-utils` to `dedoo-ordutils`
- **NEW PACKAGE**: First release under Dedoo Development Team

### 🚀 Major Changes
- **BREAKING CHANGE**: Renamed `createSendBEL` to `createSendCoin` for blockchain-agnostic naming
- **NEW FEATURE**: Added `createMultiSendCoin` function for multi-output transactions
- **BREAKING CHANGE**: Renamed `CreateSendBel` interface to `CreateSendCoin`
- **NEW INTERFACE**: Added `CreateMultiSendCoin` interface

### ✨ New Features
- **Multi-Output Transaction Support**: Now supports creating transactions with multiple outputs (e.g., main payment + donation)
- **Blockchain Agnostic**: Generic naming convention makes library suitable for any Bitcoin-based blockchain
- **Better Fee Handling**: Improved fee calculation for multi-output transactions
- **Receiver Pays Fee**: Support for "include fee in amount" functionality in multi-output transactions

### 🔧 API Changes

#### Before (bel-ord-utils):
```javascript
import { createSendBEL } from 'bel-ord-utils';

const psbt = await createSendBEL({
  utxos,
  toAddress: 'address',
  toAmount: 100000,
  // ... other params
});
```

#### After (dedoo-ordutils v1.0.x):
```javascript
import { createSendCoin, createMultiSendCoin } from 'dedoo-ordutils';

// Single output (renamed)
const psbt = await createSendCoin({
  utxos,
  toAddress: 'address',
  toAmount: 100000,
  // ... other params
});

// Multi-output (new!)
const psbt = await createMultiSendCoin({
  utxos,
  outputs: [
    { address: 'main-address', amount: 100000 },
    { address: 'donation-address', amount: 5000 }
  ],
  // ... other params
});
```

### 🛠 Migration Guide
1. Replace `createSendBEL` with `createSendCoin`
2. Replace `CreateSendBel` interface with `CreateSendCoin`
3. Use `createMultiSendCoin` for transactions with multiple outputs

### 📦 What's Included
- ✅ Single output transactions (`createSendCoin`)
- ✅ Multi-output transactions (`createMultiSendCoin`)
- ✅ Ordinal transactions (`createSendOrd`, `createMultisendOrd`)
- ✅ Proper fee calculation for all transaction types
- ✅ TypeScript support with updated interfaces
