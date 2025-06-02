import { UnspentOutput } from "./OrdTransaction.js";
import { OrdUnit } from "./OrdUnit.js";
import { getConfig } from "./config.js";

// We no longer export a hardcoded UTXO_DUST constant
// Instead, we use the configuration system to get the dust threshold

export class OrdUnspendOutput {
  ordUnits: OrdUnit[];
  utxo: UnspentOutput;
  constructor(utxo: UnspentOutput, outputValue?: number, config?: { utxoDust?: number }) {
    this.utxo = utxo;
    const utxoDust = config?.utxoDust || getConfig().utxoDust;
    this.split(utxo.satoshis, utxo.ords, outputValue, utxoDust);
  }

  private split(
    satoshis: number,
    ords: { id: string; offset: number }[],
    splitOutputValue?: number,
    utxoDust?: number
  ) {
    // Use provided splitOutputValue or utxoDust from config or get it from the global config
    splitOutputValue = splitOutputValue || utxoDust || getConfig().utxoDust;
    const ordUnits: OrdUnit[] = [];
    let leftAmount = satoshis;
    for (let i = 0; i < ords.length; i++) {
      const id = ords[i].id;
      const offset = ords[i].offset;

      const usedSatoshis = satoshis - leftAmount;
      const curOffset = offset - usedSatoshis;
      if (curOffset < 0 || leftAmount < splitOutputValue) {
        if (ordUnits.length == 0) {
          ordUnits.push(
            new OrdUnit(leftAmount, [
              {
                id: id,
                outputOffset: offset,
                unitOffset: curOffset,
              },
            ])
          );
          leftAmount = 0;
        } else {
          // injected to previous
          const preUnit = ordUnits[ordUnits.length - 1];
          preUnit.ords.push({
            id,
            outputOffset: offset,
            unitOffset: preUnit.satoshis + curOffset,
          });
          continue;
        }
      }

      if (leftAmount >= curOffset) {
        if (leftAmount > splitOutputValue * 2) {
          if (curOffset >= splitOutputValue) {
            ordUnits.push(new OrdUnit(curOffset, []));
            ordUnits.push(
              new OrdUnit(splitOutputValue, [
                {
                  id,
                  outputOffset: offset,
                  unitOffset: 0,
                },
              ])
            );
          } else {
            ordUnits.push(
              new OrdUnit(curOffset + splitOutputValue, [
                {
                  id,
                  outputOffset: offset,
                  unitOffset: curOffset,
                },
              ])
            );
          }
        } else {
          ordUnits.push(
            new OrdUnit(curOffset + splitOutputValue, [
              { id, outputOffset: offset, unitOffset: curOffset },
            ])
          );
        }
      }

      leftAmount -= curOffset + splitOutputValue;
    }

    const dustThreshold = utxoDust || getConfig().utxoDust;
    if (leftAmount > dustThreshold) {
      ordUnits.push(new OrdUnit(leftAmount, []));
    } else if (leftAmount > 0) {
      if (ordUnits.length > 0) {
        ordUnits[ordUnits.length - 1].satoshis += leftAmount;
      } else {
        ordUnits.push(new OrdUnit(leftAmount, []));
      }
    }

    this.ordUnits = ordUnits;
  }

  /**
   * Get non-Ord satoshis for spending
   */
  getNonOrdSatoshis() {
    return this.ordUnits
      .filter((v) => v.ords.length == 0)
      .reduce((pre, cur) => pre + cur.satoshis, 0);
  }

  /**
   * Get last non-ord satoshis for spending.
   * Only the last one is available
   * @returns
   */
  getLastUnitSatoshis() {
    const last = this.ordUnits[this.ordUnits.length - 1];
    if (last.ords.length == 0) {
      return last.satoshis;
    }
    return 0;
  }

  hasOrd() {
    return this.utxo.ords.length > 0;
  }

  dump() {
    this.ordUnits.forEach((v) => {
      console.log("satoshis:", v.satoshis, "ords:", v.ords);
    });
  }
}
