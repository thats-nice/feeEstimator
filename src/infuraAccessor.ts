import dotenv = require('dotenv');
import WebSocket = require('ws');

dotenv.config();
const infuraProjectID: string | undefined = process.env.PROJECT_ID;
if (infuraProjectID === undefined) {
  throw new Error('No project ID found for Infura API.');
}

export class InfuraAccessor {
  private static ws = new WebSocket(
    `wss://mainnet.infura.io/ws/v3/${infuraProjectID}`
  );

  public static startInfuraWS() {
    console.log('Starting Infura WS');

    this.ws.on('open', () => {
      console.log('Connection Opened!!!!!');
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_subscribe',
          params: ['newHeads'],
        })
      );
    });

    this.ws.on('message', (data: any) => {
      console.log(
        '🚀 ~ file: infuraAccessor.ts ~ line 31 ~ InfuraAccessor ~ this.ws.on ~ data',
        JSON.parse(data)
      );
    });

    this.ws.on('error', (error: any) => {
      console.log(`Error: ${error}`);
    });
  }
}
