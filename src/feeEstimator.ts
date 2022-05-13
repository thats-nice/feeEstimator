import {InfuraAPIAccessor} from './Infura/infuraAPIAccessor';

interface blockFee {
  blockNumber: string;
  feeEstimate: number;
}

export class FeeEstimator {
  public static feeHistory: blockFee[] = [];

  public static async updateFeeEstimate(wsMessage: any): Promise<void> {
    const latestBlockNumber: string = this.extractLatestBlockNumber(wsMessage);
    const block: any = await InfuraAPIAccessor.getBlockByNumber(
      latestBlockNumber
    );
    const transactionHashes: string[] = this.extractTransactionHashes(block);
    const transactionBlocks: any[] = await this.getTransactionBlocks(
      transactionHashes
    );

    const fees: number[] = this.extractFees(transactionBlocks);
    const averageBlockFee: number = this.calculateAverage(fees);

    this.feeHistory.push({
      blockNumber: latestBlockNumber,
      feeEstimate: averageBlockFee,
    });
    console.log(
      `Block number: ${latestBlockNumber}. Estimated fee: ${averageBlockFee}`
    );
  }

  public static extractLatestBlockNumber(newHeadBlock: any): string {
    if (
      newHeadBlock &&
      newHeadBlock.params &&
      newHeadBlock.params.result &&
      newHeadBlock.params.result.number
    ) {
      return newHeadBlock.params.result.number;
    } else {
      throw new Error(
        'Unable to extract block number from New Header message.'
      );
    }
  }

  public static extractTransactionHashes(block: any): string[] {
    if (
      block.result &&
      block.result.transactions &&
      block.result.transactions.length > 0
    ) {
      return block.result.transactions;
    } else {
      throw new Error('No valid transaction hash found in block.');
    }
  }

  public static async getTransactionBlocks(
    transactions: string[]
  ): Promise<any[]> {
    const getTransactionPromises: Promise<any>[] = transactions.map(txn =>
      InfuraAPIAccessor.getTransactionBlock(txn)
    );
    return await Promise.all(getTransactionPromises);
  }

  public static extractFees(transactionBlocks: any[]): number[] {
    let fees: number[] = [];

    transactionBlocks.map(txn => {
      if (txn.result && txn.result.effectiveGasPrice && txn.result.gasUsed)
        fees.push(
          Number(txn.result.effectiveGasPrice) * Number(txn.result.gasUsed)
        );
    });

    return fees;
  }

  public static calculateAverage(fees: number[]): number {
    return fees.reduce((x, y) => x + y, 0);
  }

  public static getLastBlockFee(): any {
    if (this.feeHistory.length === 0) {
      return {
        message: 'No block found yet. Please wait a few seconds.',
      };
    } else {
      const lastBlockFee = this.feeHistory[this.feeHistory.length - 1];
      return {
        last_block_number: lastBlockFee.blockNumber,
        fee_estimate: lastBlockFee.feeEstimate,
      };
    }
  }
}
