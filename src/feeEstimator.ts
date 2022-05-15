import {InfuraAPIAccessor} from './Infura/infuraAPIAccessor';
import {config} from '../src/config';

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

    const transactions: any[] = await this.getTransactions(transactionHashes);
    const filteredNonErc20Hashes: string[] =
      this.filterNonErc20Transactions(transactions);

    const transactionReceipts: any[] = await this.getTransactionReceipts(
      filteredNonErc20Hashes
    );

    const fees: number[] = this.extractFees(transactionReceipts);
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

  public static async getTransactions(transactions: string[]): Promise<any[]> {
    const getTransactionPromises: Promise<any>[] = transactions.map(txn =>
      InfuraAPIAccessor.getTransactionByHash(txn)
    );
    return await Promise.all(getTransactionPromises);
  }

  public static filterNonErc20Transactions(transactions: any[]): string[] {
    let nonEr20TxnHashes: string[] = [];
    transactions.map(txn => {
      if (txn.result && txn.result.input && txn.result.input !== null) {
        const hexString: string = txn.result.input;

        const dataNotIgnoredCode: boolean =
          config.filterOutErc20TransactionTypes.indexOf(
            hexString.substring(0, 10)
          ) === -1;

        if (dataNotIgnoredCode) {
          nonEr20TxnHashes.push(txn.result.hash);
        }
      }
    });
    return nonEr20TxnHashes;
  }

  public static async getTransactionReceipts(
    transactions: string[]
  ): Promise<any[]> {
    const getTransactionPromises: Promise<any>[] = transactions.map(txn =>
      InfuraAPIAccessor.getTransactionReceipt(txn)
    );
    return await Promise.all(getTransactionPromises);
  }

  public static extractFees(transactionBlocks: any[]): number[] {
    let fees: number[] = [];

    transactionBlocks.map(txn => {
      if (txn.result && txn.result.effectiveGasPrice && txn.result.gasUsed) {
        fees.push(
          Number(txn.result.effectiveGasPrice) * Number(txn.result.gasUsed)
        );
      }
    });

    return fees;
  }

  public static calculateAverage(fees: number[]): number {
    if (fees.length === 0) return 0;
    return fees.reduce((x, y) => x + y, 0) / fees.length;
  }

  public static getLastBlockFee(): any {
    if (this.feeHistory.length === 0) {
      return {
        message: 'No block found yet. Please wait a few seconds.',
      };
    } else {
      this.sortFeeHistory();
      const lastBlockFee = this.feeHistory[this.feeHistory.length - 1];

      let lastFiveBlocksFees: number = -1;
      let lastThirtyBlocksFees: number = -1;

      if (this.feeHistory.length >= 5) {
        lastFiveBlocksFees = this.getLastBatchBlockFeesEstimate(5);
      }

      if (this.feeHistory.length >= 30) {
        lastThirtyBlocksFees = this.getLastBatchBlockFeesEstimate(30);
      }

      return {
        lastBlockNumber: lastBlockFee.blockNumber,
        feeEstimate: lastBlockFee.feeEstimate,
        lastFiveBlockFeeEstimate:
          lastFiveBlocksFees === -1 ? 'pending' : lastFiveBlocksFees,
        lastThirtyBlockFeeEstimate:
          lastThirtyBlocksFees === -1 ? 'pending' : lastThirtyBlocksFees,
      };
    }
  }

  private static sortFeeHistory() {
    this.feeHistory.sort((x, y) => (x.blockNumber < y.blockNumber ? -1 : 1));
  }

  private static getLastBatchBlockFeesEstimate(numberOfBlocks: number): number {
    const historyLength: number = this.feeHistory.length;
    const lastBlockBatch: blockFee[] = this.feeHistory.slice(
      historyLength - numberOfBlocks,
      historyLength
    );
    return this.calculateAverage(lastBlockBatch.map(x => x.feeEstimate));
  }
}
