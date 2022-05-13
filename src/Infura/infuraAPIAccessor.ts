import axios, {AxiosRequestConfig} from 'axios';
import {config} from '../config';

const infuraProjectID: string | undefined = config.projectId;
if (infuraProjectID === undefined) {
  throw new Error('No project ID found for Infura API.');
}

export class InfuraAPIAccessor {
  private static url: string = `https://mainnet.infura.io/v3/${infuraProjectID}`;
  private static header: AxiosRequestConfig = {
    headers: {
      'content-type': 'application/json',
    },
  };

  public static async getBlockByNumber(blockNumberInHex: string): Promise<any> {
    const data: any = {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [blockNumberInHex, false],
      id: 1,
    };

    const response = await axios.post(this.url, data, this.header);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `Could not retrieve block: ${blockNumberInHex}. Status code: ${response.status}.`
      );
    }
  }

  public static async getTransactionReceipt(
    transactionHash: string
  ): Promise<any> {
    const data = {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [transactionHash],
      id: 1,
    };

    const response = await axios.post(this.url, data, this.header);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `Could not retrieve transaction receipt for hash: ${transactionHash}. Status code: ${response.status}.`
      );
    }
  }
}
