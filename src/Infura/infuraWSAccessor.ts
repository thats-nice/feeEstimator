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
    this.ws.on('open', () => {
      console.log('Infura Websocket connection opened.');
      this.ws.send(this.subscribeToNewHeadsRequest);
    });

    this.ws.on('message', async (data: any) => {
      const parsedMessage = JSON.parse(data);
      if (parsedMessage.method && parsedMessage.method === 'eth_subscription') {
        console.log('New block found.');
        try {
          await FeeEstimator.updateFeeEstimate(parsedMessage);
        } catch (error) {
          console.log(`Error occurred while trying to update fee. ${error}`);
        }
      }
    });

    this.ws.on('error', (error: any) => {
      console.log(`Infura WS Error: ${error}`);
    });
  }
}
