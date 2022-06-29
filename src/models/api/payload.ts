export type Payload = { walletId: string };
export type TxnPayload = {
    walletId: string,
    lamports: number,
    destination: string,
    message: string,
    signature: string
}