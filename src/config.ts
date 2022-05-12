import dotenv = require('dotenv');

dotenv.config();

export const config = {
  port: process.env.PORT,
  projectId: process.env.PROJECT_ID,
};
