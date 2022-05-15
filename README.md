# Fee Estimator

The Fee Estimator provides an estimate of ETH transaction fees using the last block as reference. It calculates the average fee of all the transaction in the last block and provides it through an API endpoint.

# Installation

1. Clone the repository.
1. Run `npm install`.
1. Create a `.env` file in the root of the project folder.
1. In the `.env` file, add two variables: `PORT` and `PROJECT_ID`. For instance:

   ```
   PORT=8000
   PROJECT_ID=abcd1234
   ```

   This application makes use of the Infura API, available at https://infura.io/ . The `PROJECT_ID` is the PROJECT_ID provided when you have created a project on the Infura platform.

1. Run `npm run build` to run application. The API endpoint is: `http://localhost:{PORT}/v1/getFeeEstimate` where `PORT` is defined in step `4` above.

# Testing

Assuming you have cloned the repository. Here are the steps:

1. Run `npm install`
1. Run `npm test`
