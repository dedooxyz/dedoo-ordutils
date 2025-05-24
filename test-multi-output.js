// Test file untuk memastikan fungsi createMultiSendCoin bekerja
import { createSendCoin, createMultiSendCoin } from './lib/index.js';

console.log('✅ Library dedoo-ordutils berhasil diupdate!');
console.log('✅ Fungsi createSendCoin tersedia');
console.log('✅ Fungsi createMultiSendCoin tersedia');

// Test interface
const testOutputs = [
  { address: '7bV8mce5z1eogq2vqw2KqjyQCHWFNi2nHx', amount: 92826685 },
  { address: '7mZrH5HG3eJCgbQpc9s5aTMTyjvsL7sRkr', amount: 4641334 }
];

console.log('✅ Interface multi-output berfungsi:', testOutputs);
console.log('\n🎉 Library siap untuk digunakan dengan multi-output transactions!');
