# Dedoo Ordinals Utils (dedoo-ordutils)

[![NPM](https://img.shields.io/npm/v/dedoo-ordutils.svg)](https://www.npmjs.com/package/dedoo-ordutils) [![GitHub](https://img.shields.io/github/license/dedooxyz/dedoo-ordutils)](https://github.com/dedooxyz/dedoo-ordutils/blob/main/LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A **blockchain-agnostic** ordinals utility library for Bitcoin-like cryptocurrencies. Provides comprehensive tools for creating, managing, and transferring ordinal inscriptions with advanced multi-output transaction support.

🚀 **Key Features:**
- **Blockchain Agnostic**: Works with any Bitcoin-like cryptocurrency that supports ordinals
- **Multi-Output Transactions**: Advanced support for complex transaction structures including donations
- **Ordinal Management**: Create, transfer, and manage ordinal inscriptions
- **TypeScript Support**: Full type definitions included
- **UTXO Optimization**: Efficient UTXO selection and management
- **Modern Architecture**: Built on dedoo-coinjs-lib 1.0.7 for maximum compatibility
- **Configurable Constants**: All blockchain-specific constants can be configured

## 🌟 Why Choose dedoo-ordutils?

Unlike traditional ordinals libraries that are hardcoded for specific networks, **dedoo-ordutils** provides true blockchain agnosticism:

- ✅ **Network Flexibility**: Works with any Bitcoin-like blockchain that supports ordinals
- ✅ **Multi-Output Support**: Advanced transaction creation with multiple outputs
- ✅ **Efficient UTXO Management**: Optimized for minimal fees and maximum efficiency
- ✅ **Future Proof**: Easy to extend for new Bitcoin-like cryptocurrencies
- ✅ **Configurable Constants**: Customize dust limits, fee rates, and other blockchain-specific values

## 📦 Installation

```bash
npm install dedoo-ordutils dedoo-coinjs-lib
```

## 🔧 Quick Start

### Configuration

The library now supports a flexible configuration system that allows you to customize blockchain-specific constants:

```javascript
import { setGlobalConfig, getConfig } from 'dedoo-ordutils';
import { networks } from 'dedoo-coinjs-lib';

// Register your blockchain network
networks.register('mycoin', {
  messagePrefix: '\x19MyCoin Signed Message:\n',
  bech32: 'mc',
  bip32: { public: 0x0488b21e, private: 0x0488ade4 },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
});

const network = networks.get('mycoin');

// Set global configuration for your blockchain
setGlobalConfig({
  network: network,
  utxoDust: 1000, // Minimum amount for a UTXO (in satoshis)
  defaultFeeRate: 5, // Default fee rate in satoshis per byte
  denominationFactor: 100000000, // Conversion factor between smallest unit and main unit
  defaultTick: "MYCOIN", // Default ticker symbol
  addressVersions: {
    p2pkh: 0x00,
    p2sh: 0x05,
    p2wpkh: 0x00,
    p2tr: 0x01
  }
});

// Alternatively, provide config per transaction
const myConfig = {
  network: network,
  utxoDust: 500, // Different dust limit for this specific blockchain
  defaultFeeRate: 2,
  denominationFactor: 100000000,
  defaultTick: "MYCOIN",
  addressVersions: {
    p2pkh: 0x00,
    p2sh: 0x05,
    p2wpkh: 0x00,
    p2tr: 0x01
  }
};
```

### Basic Coin Transfer

```javascript
import { createSendCoin } from 'dedoo-ordutils';
import { networks } from 'dedoo-coinjs-lib';

// Register your blockchain network
networks.register('mycoin', {
  messagePrefix: '\x19MyCoin Signed Message:\n',
  bech32: 'mc',
  bip32: { public: 0x0488b21e, private: 0x0488ade4 },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
});

const network = networks.get('mycoin');

// Create a simple coin transfer
const psbt = await createSendCoin({
  utxos: [
    {
      txId: 'utxo_transaction_id',
      outputIndex: 0,
      satoshis: 100000,
      scriptPk: 'utxo_script_hex',
      addressType: 1, // P2WPKH
      address: 'sender_address',
      ords: []
    }
  ],
  toAddress: 'recipient_address',
  toAmount: 50000,
  feeRate: 10, // satoshis per vbyte
  network,
  changeAddress: 'your_change_address',
  pubkey: 'your_public_key_hex',
  signTransaction: async (psbt) => {
    // Your signing logic here
    psbt.signAllInputs(keyPair);
  },
  receiverToPayFee: false,
  enableRBF: true,
  // Optional: provide custom configuration
  config: myConfig
});

console.log('Transaction hex:', psbt.toHex());
```

### Multi-Output Transaction

```javascript
import { createMultiSendCoin } from 'dedoo-ordutils';
import { networks } from 'dedoo-coinjs-lib';

const network = networks.get('mycoin');

// Create a multi-output transaction (perfect for donations)
const multiPsbt = await createMultiSendCoin({
  utxos: [
    {
      txId: 'utxo_transaction_id',
      outputIndex: 0,
      satoshis: 200000,
      scriptPk: 'utxo_script_hex',
      addressType: 1, // P2WPKH
      address: 'sender_address',
      ords: []
    }
  ],
  outputs: [
    { address: 'recipient1_address', amount: 30000 },
    { address: 'recipient2_address', amount: 40000 }, // e.g., donation
    { address: 'recipient3_address', amount: 50000 }
  ],
  feeRate: 15,
  network,
  changeAddress: 'your_change_address',
  pubkey: 'your_public_key_hex',
  signTransaction: async (psbt) => {
    psbt.signAllInputs(keyPair);
  },
  receiverToPayFee: false,
  enableRBF: true,
  // Optional: provide custom configuration
  config: myConfig
});

console.log('Multi-output transaction:', multiPsbt.toHex());
```

## 🏗️ API Reference

### createSendCoin(options)

Creates a simple coin transfer transaction.

**Parameters:**
- `utxos`: Array of UnspentOutput objects with ordinal information
- `toAddress`: Recipient address
- `toAmount`: Amount to send (in satoshis)
- `feeRate`: Fee rate in satoshis per vbyte (default: from config)
- `network`: Network configuration (required)
- `changeAddress`: Address to send change to
- `pubkey`: Public key hex string for signing
- `signTransaction`: Async function to sign the PSBT
- `receiverToPayFee`: Boolean - whether receiver pays the fee
- `enableRBF`: Boolean - enable Replace-By-Fee (default: true)
- `calculateFee`: Optional custom fee calculation function
- `tick`: Optional ticker symbol (default: from config)
- `config`: Optional blockchain configuration object

### createMultiSendCoin(options)

Creates a multi-output transaction with support for donations and complex outputs.

**Parameters:**
- `utxos`: Array of UnspentOutput objects
- `outputs`: Array of {address, amount} objects
- `feeRate`: Fee rate in satoshis per vbyte (default: from config)
- `network`: Network configuration (required)
- `changeAddress`: Address to send change to
- `pubkey`: Public key hex string for signing
- `signTransaction`: Async function to sign the PSBT
- `receiverToPayFee`: Boolean - whether receiver pays the fee
- `enableRBF`: Boolean - enable Replace-By-Fee (default: true)
- `calculateFee`: Optional custom fee calculation function
- `tick`: Optional ticker symbol (default: from config)
- `config`: Optional blockchain configuration object

### createSendOrd(options)

Creates an ordinal inscription transfer transaction.

**Parameters:**
- `utxos`: Array of UnspentOutput objects including ordinal UTXOs
- `toAddress`: Recipient address
- `network`: Network configuration (required)
- `changeAddress`: Address to send change to
- `pubkey`: Public key hex string for signing
- `feeRate`: Fee rate in satoshis per vbyte (default: from config)
- `outputValue`: Value for the ordinal output
- `signTransaction`: Async function to sign the PSBT
- `calculateFee`: Optional custom fee calculation function
- `enableRBF`: Boolean - enable Replace-By-Fee (default: true)
- `tick`: Optional ticker symbol (default: from config)
- `config`: Optional blockchain configuration object

### createMultisendOrd(options)

Creates a multi-ordinal transfer transaction.

**Parameters:**
- `utxos`: Array of UnspentOutputBase objects (ordinal and regular UTXOs)
- `toAddress`: Recipient address for ordinals
- `signPsbtHex`: Function to sign PSBT hex and return signed hex
- `network`: Network configuration (required - no default)
- `changeAddress`: Address to send change to
- `publicKey`: Public key hex string
- `feeRate`: Fee rate in satoshis per vbyte (default: from config)
- `config`: Optional blockchain configuration object

## 🔧 Configuration System

The library now provides a flexible configuration system that allows you to customize blockchain-specific constants:

### BlockchainConfig Interface

```typescript
export interface BlockchainConfig {
  // Network configuration from dedoo-coinjs-lib
  network: Network;
  
  // Minimum amount for a UTXO to be considered valid (in satoshis)
  utxoDust: number;
  
  // Default fee rate to use if not specified (satoshis per byte)
  defaultFeeRate: number;
  
  // Conversion factor between smallest unit and main unit (e.g., 100000000 for BTC)
  denominationFactor: number;
  
  // Default tick symbol for the blockchain
  defaultTick: string;
  
  // Address type versions
  addressVersions: {
    p2pkh: number;
    p2sh: number;
    p2wpkh: number;
    p2tr: number;
  };
  
  // Default sighash type to use
  defaultSighashType?: number;
}
```

### Configuration Functions

- `setGlobalConfig(config: BlockchainConfig)`: Set global configuration for all transactions
- `getConfig(overrides?: Partial<BlockchainConfig>)`: Get current configuration with optional overrides

## 📋 Changelog

### Version 1.0.7 (Latest)
- ✅ **Added blockchain-agnostic configuration system** - customize constants per blockchain
- ✅ **Made UTXO_DUST configurable** - set different dust limits per blockchain
- ✅ **Made fee rates configurable** - customize default fee rates
- ✅ **Added denomination factor configuration** - support different satoshi/coin ratios
- ✅ **Made address versions configurable** - support different address schemes

### Version 1.0.6
- ✅ **Updated to dedoo-coinjs-lib 1.0.7** for enhanced blockchain compatibility
- ✅ **Removed hardcoded blockchain defaults** - now fully blockchain agnostic
- ✅ **Enhanced createMultisendOrd** - network parameter now required (no defaults)
- ✅ **Improved error handling** - better validation for blockchain-agnostic operation
- ✅ **Updated TypeScript definitions** - more accurate type definitions
- ✅ **Multi-output transaction improvements** - better support for donation workflows

### Version 1.0.5
- Multi-output transaction support
- Enhanced ordinal handling
- Improved UTXO management

## 📄 License

MIT © [Dedoo](https://github.com/dedooxyz)
