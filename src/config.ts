import type { Network } from "dedoo-coinjs-lib";

/**
 * Configuration interface for blockchain-specific constants
 * This allows the library to be used with different blockchains
 */
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

/**
 * Default Bitcoin configuration
 */
export const BITCOIN_CONFIG: BlockchainConfig = {
  network: undefined, // This should be provided by the application
  utxoDust: 1000,
  defaultFeeRate: 5,
  denominationFactor: 100000000,
  defaultTick: "BTC",
  addressVersions: {
    p2pkh: 0x00,
    p2sh: 0x05,
    p2wpkh: 0x00,
    p2tr: 0x01
  },
  defaultSighashType: undefined
};

/**
 * Global configuration that can be set by the application
 */
let globalConfig: BlockchainConfig | null = null;

/**
 * Set the global configuration for the library
 * @param config The blockchain configuration
 */
export function setGlobalConfig(config: BlockchainConfig): void {
  globalConfig = config;
}

/**
 * Get the current global configuration or a default one if not set
 * @param overrides Optional overrides for specific config values
 * @returns The blockchain configuration
 */
export function getConfig(overrides?: Partial<BlockchainConfig>): BlockchainConfig {
  const baseConfig = globalConfig || BITCOIN_CONFIG;
  
  if (!overrides) {
    return baseConfig;
  }
  
  return {
    ...baseConfig,
    ...overrides,
    addressVersions: {
      ...baseConfig.addressVersions,
      ...(overrides.addressVersions || {})
    }
  };
}
