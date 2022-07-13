export type Payload = {
  walletId: string;
  message?: string;
  verified?: boolean;
};
export type TxnPayload = {
  walletId: string;
  lamports: number;
  destination: string;
  message: string;
  signature: string;
  verified?: boolean;
};
