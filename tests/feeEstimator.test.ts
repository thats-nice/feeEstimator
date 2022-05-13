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
});
