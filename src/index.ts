import express = require('express');
import dotenv = require('dotenv');

import helmet from 'helmet';
import {InfuraAccessor} from './infuraAccessor';

dotenv.config();

const app = express();
const port: string | undefined = process.env.PORT;

InfuraAccessor.startInfuraWS();

app.use(helmet());

app.get('/ethFeeEstimate', async (_req, res) => {
  res.send({feeEstimate: 1});
});

app.listen(port, () => {
  if (port === undefined) {
    throw new Error('Server port undefined.');
  }
  console.log(`Fee Estimator App listening on port ${port}`);
});
