import HttpStatusCodes from "http-status-codes";
import { Response, NextFunction } from 'express';
import Request from "../models/api/request";
import bs58 from "bs58";
import { sign } from "tweetnacl";
import { PublicKey } from '@solana/web3.js';


export default function(req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const nonce = req.header("x-auth-nonce");
  const message = req.header("x-auth-message");
  const signedMsg = req.header("x-auth-signed");
  const pubKey = req.header("x-auth-pk");
  // Check if no token
  if (!signedMsg) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "No token, authorization denied" });
  }
  // Verify token
  try {
    const messageDecoded = Buffer.from(message, 'base64').toString('utf-8');
    console.log('DECODED', messageDecoded);
    const signedMessage = bs58.decode(signedMsg);
    const encodedMessage = new TextEncoder().encode(messageDecoded);
    const publicKey = new PublicKey(pubKey);
    if (sign.detached.verify(
      encodedMessage,
      signedMessage,
      publicKey.toBytes()
    )) {
      next();
    }
    else {
      res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "Signature is not valid" });
    }

  } catch (err) {
    res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "Token is not valid" });
  }
}