import express = require('express');

import helmet from 'helmet';
import {InfuraWSAccessor} from './Infura/infuraWSAccessor';

import {config} from './config';
import {FeeEstimator} from './feeEstimator';

const app = express();
const port: string | undefined = config.port;
const apiVersion: number = 1;

InfuraWSAccessor.startInfuraWS();

app.use(helmet());

app.get(`/v${apiVersion}/ethFeeEstimate`, async (_req, res) => {
  res.send(FeeEstimator.getLastBlockFee());
});

app.listen(port, () => {
  if (port === undefined) {
    throw new Error('Server port undefined.');
  }
  console.log(`Fee Estimator App listening on port ${port}`);
});
