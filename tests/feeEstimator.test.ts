import {expect} from 'chai';
import {FeeEstimator} from '../src/feeEstimator';

describe('Fee Estimator', () => {
  describe('extractLatestBlockNumber', () => {
    it('should return the block number given a new block data', () => {
      const incomingBlock: {} = {
        params: {
          result: {
            number: '0x123',
          },
        },
      };

      const blockNumber: string =
        FeeEstimator.extractLatestBlockNumber(incomingBlock);

      expect(blockNumber, 'Block number did not match.').to.equal('0x123');
    });

    it('should throw an error if no block number is found', () => {
      const incomingBlock: {} = {
        params: {
          result: {
            foo: 'asd',
          },
        },
      };

      expect(
        FeeEstimator.extractLatestBlockNumber.bind(FeeEstimator, incomingBlock)
      ).to.throw('Unable to extract block number from New Header message.');
    });
  });

  describe('extractTransactionHashes', () => {
    it('should return the transaction hashes given a new block data', () => {
      const incomingBlock: {} = {
        result: {
          transactions: ['0x123', '0x456', '0x789'],
        },
      };

      const transactionHashes: string[] =
        FeeEstimator.extractTransactionHashes(incomingBlock);

      expect(transactionHashes[0], 'Transaction hash did not match.').to.equal(
        '0x123'
      );
      expect(transactionHashes[1], 'Transaction hash did not match.').to.equal(
        '0x456'
      );
      expect(transactionHashes[2], 'Transaction hash did not match.').to.equal(
        '0x789'
      );
    });

    it('should throw an error if no transaction hashes are found', () => {
      const incomingBlock: {} = {
        result: {
          foo: 'asd',
        },
      };

      expect(
        FeeEstimator.extractTransactionHashes.bind(FeeEstimator, incomingBlock)
      ).to.throw('No valid transaction hash found in block.');
    });
  });

  describe('extractFees', () => {
    it('should return the transaction fees given a new block data', () => {
      const transactionBlocks: any[] = [
        {
          result: {
            contractAddress: null,
            effectiveGasPrice: 0x1,
            gasUsed: 0x2,
          },
        },
        {
          result: {
            contractAddress: null,
            effectiveGasPrice: 0x2,
            gasUsed: 0x4,
          },
        },
      ];

      const fees: number[] = FeeEstimator.extractFees(transactionBlocks);
      expect(fees[0], 'Fees must equal the calculated value (1)').to.equal(0x2);
      expect(fees[1], 'Fees must equal the calculated value (2)').to.equal(0x8);
    });

    it('should not include erc20 tokens when extracting fees', () => {
      const transactionBlocks: any[] = [
        {
          result: {
            contractAddress: 0x123,
            effectiveGasPrice: 0x1,
            gasUsed: 0x2,
          },
        },
      ];

      const fees: number[] = FeeEstimator.extractFees(transactionBlocks);
      expect(
        fees.length,
        'Transaction block should not include fees that have contract address'
      ).to.equal(0);
    });
  });

  describe('calculate average', () => {
    it('should return the appropriate average', () => {
      const fees: number[] = [1, 2, 3, 4];
      const average: number = FeeEstimator.calculateAverage(fees);
      expect(average, 'average calculated is not correct').to.equal(2.5);

      const emptyFee: number[] = [];
      const emptyAverage = FeeEstimator.calculateAverage(emptyFee);
      expect(emptyAverage, 'should return 0 with empty fee array').to.equal(0);
    });
  });

  describe('getLastBlockFee', () => {
    afterEach(() => {
      FeeEstimator.feeHistory = [];
    });

    it('should return the last block fee when less than 5 blocks', () => {
      FeeEstimator.feeHistory.push({
        blockNumber: '0x1',
        feeEstimate: 0x1,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x2',
        feeEstimate: 0x2,
      });

      const result: {
        lastBlockNumber: string;
        feeEstimate: number;
        lastFiveBlockFeeEstimate: number;
        lastThirtyBlockFeeEstimate: number;
      } = FeeEstimator.getLastBlockFee();

      expect(result.lastBlockNumber, 'lastBlockNumber did not match').to.equal(
        '0x2'
      );
      expect(result.feeEstimate, 'feeEstimate did not match').to.equal(0x2);
      expect(
        result.lastFiveBlockFeeEstimate,
        'lastFiveBlockFeeEstimate did not match'
      ).to.equal('pending');
      expect(
        result.lastThirtyBlockFeeEstimate,
        'lastThirtyBlockFeeEstimate did not match'
      ).to.equal('pending');
    });

    it('should sort the history blocks when non-chronological ordered blocks are received', () => {
      FeeEstimator.feeHistory.push({
        blockNumber: '0x1',
        feeEstimate: 0x1,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x3',
        feeEstimate: 0x3,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x2',
        feeEstimate: 0x2,
      });

      const result: {
        lastBlockNumber: string;
        feeEstimate: number;
        lastFiveBlockFeeEstimate: number;
        lastThirtyBlockFeeEstimate: number;
      } = FeeEstimator.getLastBlockFee();

      expect(result.lastBlockNumber, 'lastBlockNumber did not match').to.equal(
        '0x3'
      );
      expect(result.feeEstimate, 'feeEstimate did not match').to.equal(3);
      expect(
        result.lastFiveBlockFeeEstimate,
        'lastFiveBlockFeeEstimate did not match'
      ).to.equal('pending');
      expect(
        result.lastThirtyBlockFeeEstimate,
        'lastThirtyBlockFeeEstimate did not match'
      ).to.equal('pending');
    });

    it('should return the last block fee after 5 blocks', () => {
      FeeEstimator.feeHistory.push({
        blockNumber: '0x1',
        feeEstimate: 0x1,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x2',
        feeEstimate: 0x2,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x3',
        feeEstimate: 0x3,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x4',
        feeEstimate: 0x4,
      });

      FeeEstimator.feeHistory.push({
        blockNumber: '0x5',
        feeEstimate: 0x5,
      });

      const result: {
        lastBlockNumber: string;
        feeEstimate: number;
        lastFiveBlockFeeEstimate: number;
        lastThirtyBlockFeeEstimate: number;
      } = FeeEstimator.getLastBlockFee();

      expect(result.lastBlockNumber, 'lastBlockNumber did not match').to.equal(
        '0x5'
      );
      expect(result.feeEstimate, 'feeEstimate did not match').to.equal(0x5);
      expect(
        result.lastFiveBlockFeeEstimate,
        'lastFiveBlockFeeEstimate did not match'
      ).to.equal(3);
      expect(
        result.lastThirtyBlockFeeEstimate,
        'lastThirtyBlockFeeEstimate did not match'
      ).to.equal('pending');
    });
  });
});
