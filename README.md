# Dedoo Ordinals Utils (dedoo-ordutils)

[![NPM](https://img.shields.io/npm/v/dedoo-ordutils.svg)](https://www.npmjs.com/package/dedoo-ordutils) [![GitHub](https://img.shields.io/github/license/dedooxyz/dedoo-ordutils)](https://github.com/dedooxyz/dedoo-ordutils/blob/main/LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A **blockchain-agnostic** ordinals utility library for Bitcoin-like cryptocurrencies. Provides comprehensive tools for creating, managing, and transferring ordinal inscriptions with advanced multi-output transaction support.

🚀 **Key Features:**
- **Blockchain Agnostic**: Works with any Bitcoin-like cryptocurrency that supports ordinals
- **Multi-Output Transactions**: Advanced support for complex transaction structures
- **Ordinal Management**: Create, transfer, and manage ordinal inscriptions
- **TypeScript Support**: Full type definitions included
- **UTXO Optimization**: Efficient UTXO selection and management
- **Keyring Integration**: Seamless integration with wallet keyrings

## 🌟 Why Choose dedoo-ordutils?

Unlike traditional ordinals libraries that are hardcoded for specific networks, **dedoo-ordutils** provides true blockchain agnosticism:

- ✅ **Network Flexibility**: Works with any Bitcoin-like blockchain that supports ordinals
- ✅ **Multi-Output Support**: Advanced transaction creation with multiple outputs
- ✅ **Efficient UTXO Management**: Optimized for minimal fees and maximum efficiency
- ✅ **Future Proof**: Easy to extend for new Bitcoin-like cryptocurrencies

## 📦 Installation

```bash
npm install dedoo-ordutils dedoo-coinjs-lib
```

## 🔧 Quick Start

### Basic Coin Transfer

```javascript
import { createSendCoin } from 'dedoo-ordutils';
import { networks } from 'dedoo-coinjs-lib';

// Register your blockchain network
networks.register('mycoin', {
  messagePrefix: '\\x19MyCoin Signed Message:\\n',
  bech32: 'mc',
  bip32: { public: 0x0488b21e, private: 0x0488ade4 },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
});

const network = networks.get('mycoin');

// Create a simple coin transfer
const transaction = await createSendCoin({
  utxos: [
    {
      txid: 'utxo_transaction_id',
      vout: 0,
      value: 100000,
      script: Buffer.from('utxo_script_hex', 'hex')
    }
  ],
  toAddress: 'recipient_address',
  amount: 50000,
  feeRate: 10, // satoshis per byte
  network,
  changeAddress: 'your_change_address',
  keyring: yourKeyring // Your wallet keyring
});

console.log('Transaction hex:', transaction.toHex());
```

### Multi-Output Transaction

```javascript
import { createMultiSendCoin } from 'dedoo-ordutils';
import { networks } from 'dedoo-coinjs-lib';

const network = networks.get('mycoin');

// Create a multi-output transaction
const multiTransaction = await createMultiSendCoin({
  utxos: [
    {
      txid: 'utxo_transaction_id',
      vout: 0,
      value: 200000,
      script: Buffer.from('utxo_script_hex', 'hex')
    }
  ],
  outputs: [
    { address: 'recipient1_address', amount: 30000 },
    { address: 'recipient2_address', amount: 40000 },
    { address: 'recipient3_address', amount: 50000 }
  ],
  feeRate: 15,
  network,
  changeAddress: 'your_change_address',
  keyring: yourKeyring
});

console.log('Multi-output transaction:', multiTransaction.toHex());
```

## 🏗️ API Reference

### createSendCoin(options)

Creates a simple coin transfer transaction.

**Parameters:**
- `utxos`: Array of UTXOs to spend
- `toAddress`: Recipient address
- `amount`: Amount to send (in satoshis)
- `feeRate`: Fee rate in satoshis per byte
- `network`: Network configuration
- `changeAddress`: Address to send change to
- `keyring`: Wallet keyring for signing

### createMultiSendCoin(options)

Creates a multi-output transaction.

**Parameters:**
- `utxos`: Array of UTXOs to spend
- `outputs`: Array of {address, amount} objects
- `feeRate`: Fee rate in satoshis per byte
- `network`: Network configuration
- `changeAddress`: Address to send change to
- `keyring`: Wallet keyring for signing

### createMultiSendOrd(options)

Creates a multi-output ordinal transaction.

**Parameters:**
- `utxos`: Array of UTXOs to spend
- `ordinalUtxos`: Array of ordinal UTXOs
- `outputs`: Array of output specifications
- `feeRate`: Fee rate in satoshis per byte
- `network`: Network configuration
- `changeAddress`: Address to send change to
- `keyring`: Wallet keyring for signing

## 🔗 Ecosystem

dedoo-ordutils is part of the Dedoo blockchain-agnostic ecosystem:

- **[dedoo-coinjs-lib](https://github.com/dedooxyz/dedoo-coinjs-lib)** - Core blockchain library
- **[dedoopair](https://github.com/dedooxyz/dedoopair)** - ECPair key management
- **[dedoohdw](https://github.com/dedooxyz/dedoohdw)** - HD wallet functionality
- **[dedoo-inscriber](https://github.com/dedooxyz/dedoo-inscriber)** - Inscription support
- **[dedoo-wallet-sdk](https://github.com/dedooxyz/dedoo-wallet-sdk)** - Provider SDK

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/dedoo-ordutils
- **GitHub Repository**: https://github.com/dedooxyz/dedoo-ordutils
- **Documentation**: https://docs.dedoo.xyz
- **Website**: https://dedoo.xyz

## 🆘 Support

- **GitHub Issues**: https://github.com/dedooxyz/dedoo-ordutils/issues
- **Community**: https://discord.gg/dedoo
- **Email**: support@dedoo.xyz

---

Built with ❤️ by the [Dedoo Development Team](https://dedoo.xyz)
