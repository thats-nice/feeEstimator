import WebSocket = require('ws');
import {FeeEstimator} from '../feeEstimator';
import axios from 'axios';
import {config} from './../config';

const infuraProjectID: string | undefined = config.projectId;
if (infuraProjectID === undefined) {
  throw new Error('No project ID found for Infura API.');
}

export class InfuraWSAccessor {
  private static ws = new WebSocket(
    `wss://mainnet.infura.io/ws/v3/${infuraProjectID}`
  );

  private static subscribeToNewHeadsRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['newHeads'],
  });

  public static startInfuraWS() {
    console.log('Starting Infura WS');

    this.ws.on('open', () => {
      console.log('Websocket connection opened.');
      this.ws.send(this.subscribeToNewHeadsRequest);
    });

    this.ws.on('message', async (data: any) => {
      const parsedMessage = JSON.parse(data);
      if (parsedMessage.method && parsedMessage.method === 'eth_subscription') {
        console.log('New block found.');
        await FeeEstimator.updateFeeEstimate(parsedMessage);
      }
    });

    this.ws.on('error', (error: any) => {
      console.log(`Error: ${error}`);
    });
  }
}
