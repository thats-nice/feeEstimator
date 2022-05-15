import dotenv = require('dotenv');

dotenv.config();

export const config = {
  port: process.env.PORT,
  projectId: process.env.PROJECT_ID,

  filterOutErc20TransactionTypes: ['0xa9059cbb', '0x23b872dd', '0x095ea7b3'],
};
