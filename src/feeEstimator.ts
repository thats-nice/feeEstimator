import {InfuraAPIAccessor} from './Infura/infuraAPIAccessor';
import {InfuraWSAccessor} from './Infura/infuraWSAccessor';

export class FeeEstimator {
  public static feeEstimate: number = 0;

  public static async updateFeeEstimate(wsMessage: any): Promise<void> {
    const latestBlockNumber: string = this.getLatestBlockNumber(wsMessage);
    console.log(
      '🚀 ~ file: feeEstimator.ts ~ line 9 ~ FeeEstimator ~ updateFeeEstimate ~ latestBlockNumber',
      latestBlockNumber
    );
    const block: any = await InfuraAPIAccessor.getBlockByNumber(
      latestBlockNumber
    );
    const transactionHashes: string[] = this.getTransactionHashes(block);
    console.log(
      '🚀 ~ file: feeEstimator.ts ~ line 15 ~ FeeEstimator ~ updateFeeEstimate ~ numOfHashes',
      transactionHashes.length
    );
    const transactionBlocks: any[] = await this.getTransactionBlocks(
      transactionHashes
    );

    transactionBlocks.map(txnBlock => console.log(txnBlock.result.blockNumber));
  }

  public static getLatestBlockNumber(newHeadBlock: any): string {
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

  public static getTransactionHashes(block: any): string[] {
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
}
