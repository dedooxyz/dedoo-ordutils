import {
  OrdTransaction,
  UnspentOutput,
  UnspentOutputBase,
} from "./OrdTransaction.js";
import { addPsbtInput, calculateFee, satoshisToAmount } from "./utils.js";
import type {
  CreateSendOrd,
  CreateSendCoin,
  CreateMultiSendCoin,
  CreateMultiSendOrd,
} from "./types.js";
import { networks, Psbt } from "dedoo-coinjs-lib";
import { getConfig, setGlobalConfig, BlockchainConfig } from "./config.js";

// Export configuration functions for external use
export { getConfig, setGlobalConfig, BlockchainConfig };

// Use DEFAULT_TICK from config
const DEFAULT_TICK = getConfig().defaultTick;

export async function createSendCoin({
  utxos,
  toAddress,
  toAmount,
  signTransaction,
  network,
  changeAddress,
  receiverToPayFee,
  feeRate,
  pubkey,
  calculateFee,
  enableRBF = true,
  tick,
  config,
}: CreateSendCoin) {
  // Use provided config or create one from network
  const configToUse = config || getConfig({ network });
  const tickToUse = tick || configToUse.defaultTick;
  
  const tx = new OrdTransaction({
    signTransaction,
    network,
    pubkey,
    feeRate,
    calculateFee,
    config: configToUse,
  });
  tx.setEnableRBF(enableRBF);
  tx.setChangeAddress(changeAddress);

  const nonOrdUtxos: UnspentOutput[] = [];
  const ordUtxos: UnspentOutput[] = [];
  utxos.forEach((v) => {
    if (v.ords.length > 0) {
      ordUtxos.push(v);
    } else {
      nonOrdUtxos.push(v);
    }
  });

  tx.addOutput(toAddress, toAmount);

  const outputAmount = tx.getTotalOutput();

  let tmpSum = tx.getTotalInput();
  for (let i = 0; i < nonOrdUtxos.length; i++) {
    const nonOrdUtxo = nonOrdUtxos[i];
    if (tmpSum < outputAmount) {
      tx.addInput(nonOrdUtxo);
      tmpSum += nonOrdUtxo.satoshis;
      continue;
    }

    const fee = await tx.calNetworkFee();
    if (tmpSum < outputAmount + fee) {
      tx.addInput(nonOrdUtxo);
      tmpSum += nonOrdUtxo.satoshis;
    } else {
      break;
    }
  }

  if (nonOrdUtxos.length === 0) {
    throw new Error("Balance not enough");
  }

  if (receiverToPayFee) {
    const unspent = tx.getUnspent();
    if (unspent >= configToUse.utxoDust) {
      tx.addChangeOutput(unspent);
    }

    const networkFee = await tx.calNetworkFee();
    const output = tx.outputs.find((v) => v.address === toAddress);
    if (output.value < networkFee) {
      throw new Error(
        `Balance not enough. Need ${satoshisToAmount(
          networkFee
        )} ${tick} as network fee`
      );
    }
    output.value -= networkFee;
  } else {
    const unspent = tx.getUnspent();
    if (unspent <= 0) {
      throw new Error("Balance not enough to pay network fee.");
    }

    // add dummy output
    tx.addChangeOutput(1);

    const networkFee = await tx.calNetworkFee();
    if (unspent < networkFee) {
      throw new Error(
        `Balance not enough. Need ${satoshisToAmount(
          networkFee
        )} ${tick} as network fee, but only ${satoshisToAmount(
          unspent
        )} ${tick}.`
      );
    }

    const leftAmount = unspent - networkFee;
    if (leftAmount >= configToUse.utxoDust) {
      // change dummy output to true output
      tx.getChangeOutput().value = leftAmount;
    } else {
      // remove dummy output
      tx.removeChangeOutput();
    }
  }

  const psbt = await tx.createSignedPsbt();

  return psbt;
}

export async function createMultiSendCoin({
  utxos,
  outputs,
  signTransaction,
  network,
  changeAddress,
  receiverToPayFee,
  feeRate,
  pubkey,
  calculateFee,
  enableRBF = true,
  tick,
  config,
}: CreateMultiSendCoin) {
  // Use provided config or create one from network
  const configToUse = config || getConfig({ network });
  const tickToUse = tick || configToUse.defaultTick;
  
  const tx = new OrdTransaction({
    signTransaction,
    network,
    pubkey,
    feeRate,
    calculateFee,
    config: configToUse,
  });
  tx.setEnableRBF(enableRBF);
  tx.setChangeAddress(changeAddress);
  console.log(`📋 LIBRARY: Set change address to: ${changeAddress}`);

  const nonOrdUtxos: UnspentOutput[] = [];
  const ordUtxos: UnspentOutput[] = [];
  utxos.forEach((v) => {
    if (v.ords.length > 0) {
      ordUtxos.push(v);
    } else {
      nonOrdUtxos.push(v);
    }
  });

  // Add all outputs
  console.log(`📋 LIBRARY: Adding ${outputs.length} outputs:`);
  outputs.forEach((output, index) => {
    console.log(`  Library adding output ${index}: ${output.amount} satoshis to ${output.address}`);
    tx.addOutput(output.address, output.amount);
  });

  // Log current outputs in transaction
  console.log(`📋 LIBRARY: Current outputs in transaction:`);
  tx.outputs.forEach((output, index) => {
    console.log(`  TX Output ${index}: ${output.value} satoshis to ${output.address}`);
  });

  const outputAmount = tx.getTotalOutput();

  let tmpSum = tx.getTotalInput();
  for (let i = 0; i < nonOrdUtxos.length; i++) {
    const nonOrdUtxo = nonOrdUtxos[i];
    if (tmpSum < outputAmount) {
      tx.addInput(nonOrdUtxo);
      tmpSum += nonOrdUtxo.satoshis;
      continue;
    }

    const fee = await tx.calNetworkFee();
    if (tmpSum < outputAmount + fee) {
      tx.addInput(nonOrdUtxo);
      tmpSum += nonOrdUtxo.satoshis;
    } else {
      break;
    }
  }

  if (nonOrdUtxos.length === 0) {
    throw new Error("Balance not enough");
  }

  if (receiverToPayFee) {
    // For multi-output transactions with receiverToPayFee, we need to be careful
    // not to add change output before calculating the fee, as it will interfere
    // with the intended outputs

    console.log(`📋 LIBRARY: Starting receiverToPayFee flow with ${tx.outputs.length} outputs`);
    tx.outputs.forEach((output, index) => {
      console.log(`  Current Output ${index}: ${output.value} satoshis to ${output.address}`);
    });

    const networkFee = await tx.calNetworkFee();
    console.log(`📋 LIBRARY: Calculated network fee: ${networkFee} satoshis`);

    // Verify outputs are still intact after fee calculation
    console.log(`📋 LIBRARY: Outputs after fee calculation:`);
    tx.outputs.forEach((output, index) => {
      console.log(`  Output ${index}: ${output.value} satoshis to ${output.address}`);
    });

    // Deduct fee from first output (main payment)
    const firstOutput = tx.outputs[0];
    console.log(`📋 LIBRARY: Before fee deduction - first output: ${firstOutput.value} satoshis to ${firstOutput.address}`);
    if (firstOutput.value < networkFee) {
      throw new Error(
        `Balance not enough. Need ${satoshisToAmount(
          networkFee
        )} ${tick} as network fee`
      );
    }
    firstOutput.value -= networkFee;
    console.log(`📋 LIBRARY: After fee deduction - first output: ${firstOutput.value} satoshis to ${firstOutput.address}`);

    // Verify all outputs are still intact after fee deduction
    console.log(`📋 LIBRARY: All outputs after fee deduction:`);
    tx.outputs.forEach((output, index) => {
      console.log(`  Output ${index}: ${output.value} satoshis to ${output.address}`);
    });

    // Now check if there's any unspent amount left for change
    const unspent = tx.getUnspent();
    console.log(`📋 LIBRARY: After fee deduction, unspent: ${unspent} satoshis`);
    // Use the config from parameters or create one from network
    const config = getConfig({ network });
    if (unspent >= config.utxoDust) {
      console.log(`📋 LIBRARY: Adding change output: ${unspent} satoshis to ${tx.changedAddress}`);
      tx.addChangeOutput(unspent);
    } else {
      console.log(`📋 LIBRARY: No change output needed (unspent ${unspent} < dust ${config.utxoDust})`);
    }

    // Log final outputs before creating PSBT
    console.log(`📋 LIBRARY: Final outputs before PSBT creation:`);
    tx.outputs.forEach((output, index) => {
      console.log(`  Final TX Output ${index}: ${output.value} satoshis to ${output.address}`);
    });
  } else {
    const unspent = tx.getUnspent();
    if (unspent <= 0) {
      throw new Error("Balance not enough to pay network fee.");
    }

    // add dummy output
    tx.addChangeOutput(1);

    const networkFee = await tx.calNetworkFee();
    if (unspent < networkFee) {
      throw new Error(
        `Balance not enough. Need ${satoshisToAmount(
          networkFee
        )} ${tick} as network fee, but only ${satoshisToAmount(
          unspent
        )} ${tick}.`
      );
    }

    const leftAmount = unspent - networkFee;
    // Use the config from parameters or create one from network
    const config = getConfig({ network });
    if (leftAmount >= config.utxoDust) {
      // change dummy output to true output
      tx.getChangeOutput().value = leftAmount;
    } else {
      // remove dummy output
      tx.removeChangeOutput();
    }
  }

  const psbt = await tx.createSignedPsbt();
  return psbt;
}

export async function createSendOrd({
  utxos,
  toAddress,
  network,
  changeAddress,
  pubkey,
  feeRate,
  outputValue,
  signTransaction,
  calculateFee,
  enableRBF = true,
  tick,
  config,
}: CreateSendOrd) {
  // Use provided config or create one from network
  const configToUse = config || getConfig({ network });
  const tickToUse = tick || configToUse.defaultTick;
  
  const tx = new OrdTransaction({
    network,
    pubkey,
    signTransaction,
    calculateFee,
    feeRate,
    config: configToUse,
  });
  tx.setEnableRBF(enableRBF);
  tx.setChangeAddress(changeAddress);

  const nonOrdUtxos: UnspentOutput[] = [];
  const ordUtxos: UnspentOutput[] = [];
  utxos.forEach((v) => {
    if (v.ords.length > 0) {
      ordUtxos.push(v);
    } else {
      nonOrdUtxos.push(v);
    }
  });

  // find NFT
  let found = false;

  for (let i = 0; i < ordUtxos.length; i++) {
    const ordUtxo = ordUtxos[i];
    if (ordUtxo.ords.length > 1) {
      throw new Error("Multiple inscriptions! Please split them first.");
    }
    tx.addInput(ordUtxo);
    tx.addOutput(toAddress, ordUtxo.satoshis);
    found = true;
  }

  if (!found) {
    throw new Error("inscription not found.");
  }

  // format NFT
  tx.outputs[0].value = outputValue;

  // select non ord utxo
  const outputAmount = tx.getTotalOutput();
  let tmpSum = tx.getTotalInput();
  for (let i = 0; i < nonOrdUtxos.length; i++) {
    const nonOrdUtxo = nonOrdUtxos[i];
    if (tmpSum < outputAmount) {
      tx.addInput(nonOrdUtxo);
      tmpSum += nonOrdUtxo.satoshis;
      continue;
    }

    const fee = await tx.calNetworkFee();
    if (tmpSum < outputAmount + fee) {
      tx.addInput(nonOrdUtxo);
      tmpSum += nonOrdUtxo.satoshis;
    } else {
      break;
    }
  }

  const unspent = tx.getUnspent();
  if (unspent <= 0) {
    throw new Error("Balance not enough to pay network fee.");
  }

  // add dummy output
  tx.addChangeOutput(1);

  const networkFee = await tx.calNetworkFee();
  if (unspent < networkFee) {
    throw new Error(
      `Balance not enough. Need ${satoshisToAmount(
        networkFee,
        configToUse.denominationFactor
      )} ${tickToUse} as network fee, but only ${satoshisToAmount(
        unspent,
        configToUse.denominationFactor
      )} ${tickToUse}`
    );
  }

  const leftAmount = unspent - networkFee;
  if (leftAmount >= configToUse.utxoDust) {
    // change dummy output to true output
    tx.getChangeOutput().value = leftAmount;
  } else {
    // remove dummy output
    tx.removeChangeOutput();
  }

  const psbt = await tx.createSignedPsbt();
  return psbt;
}

export async function createMultisendOrd({
  utxos,
  toAddress,
  signPsbtHex,
  network,
  changeAddress,
  publicKey,
  feeRate,
  config,
}: CreateMultiSendOrd) {
  // Ensure network is provided - no hardcoded defaults for blockchain agnosticism
  if (!network) {
    throw new Error("Network parameter is required for blockchain-agnostic operation");
  }
  
  // Use provided config or create one from network
  const configToUse = config || getConfig({ network });
  
  let tx = new Psbt({ network });
  tx.setVersion(1);

  const nonOrdUtxos: UnspentOutputBase[] = [];
  const ordUtxos: UnspentOutputBase[] = [];
  utxos.forEach((v) => {
    if (v.ords.length > 0) {
      ordUtxos.push(v);
    } else {
      nonOrdUtxos.push(v);
    }
  });

  for (let i = 0; i < ordUtxos.length; i++) {
    const ordUtxo = ordUtxos[i];
    if (ordUtxo.ords.length > 1) {
      throw new Error("Multiple inscriptions! Please split them first.");
    }
    addPsbtInput({ network, psbt: tx, publicKey, utxo: ordUtxo });
    tx.addOutput({ address: toAddress, value: ordUtxo.satoshis });
  }

  let amount = 0;
  for (let i = 0; i < nonOrdUtxos.length; i++) {
    const nonOrdUtxo = nonOrdUtxos[i];
    amount += nonOrdUtxo.satoshis;
    addPsbtInput({ network, psbt: tx, publicKey, utxo: nonOrdUtxo });
  }

  const fee = await calculateFee(
    tx.clone(),
    feeRate,
    changeAddress,
    signPsbtHex
  );
  const change = amount - fee;
  if (change < 0) {
    throw new Error("Balance not enough to pay network fee.");
  }
  tx.addOutput({ address: changeAddress, value: change });
  tx = Psbt.fromHex(await signPsbtHex(tx.toHex()));
  tx.finalizeAllInputs();
  return tx.extractTransaction(true).toHex();
}
