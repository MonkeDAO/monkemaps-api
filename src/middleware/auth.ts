import HttpStatusCodes from "http-status-codes";
import { Response, NextFunction } from 'express';
import Request from "../models/api/request";
import bs58 from "bs58";
import { sign } from "tweetnacl";
import { Connection, ParsedInstruction, PublicKey, SystemProgram } from '@solana/web3.js';
import getJWTSettings from '../utils/jwthelper';
import jwt from "jsonwebtoken";
import assert from 'assert';
import { TxnPayload } from '../models/api/payload';


export default async function (req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const txn = req.header("x-auth-txn");
  const nonce = req.header("x-auth-nonce");
  const message = req.header("x-auth-message");
  const signedMsg = req.header("x-auth-signed");
  const pubKey = req.header("x-auth-pk");
  let verified = false;
  // Check if no token
  if (!signedMsg || (!signedMsg && !txn)) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "No token, authorization denied" });
  }
  // Verify token
  try {
    if (txn && txn !== '') {
      const jwtSettings = getJWTSettings();
      const payload: TxnPayload | any = jwt.verify(signedMsg, jwtSettings.JWTSecret);
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      const sigs = await connection.getConfirmedSignaturesForAddress2(new PublicKey(payload.walletId as string))
      assert(sigs.length > 0);
      assert(sigs[0].signature === txn);
      if (!payload.signature) {
        assert(sigs.length === 1);
      } else {
        assert(sigs[1].signature === payload.signature);
      }

      const tx = await connection.getParsedTransaction(txn, 'confirmed');
      assert(tx);
      assert(tx.transaction.signatures.length === 1);
      assert(tx.transaction.signatures[0] === txn);
      assert(tx.transaction.message.accountKeys.length === 2);
      assert(tx.transaction.message.accountKeys[0].signer);
      assert(tx.transaction.message.accountKeys[0].writable);
      assert(tx.transaction.message.accountKeys[0].pubkey.toString() === payload.walletId);
      assert(!tx.transaction.message.accountKeys[1].signer);
      assert(!tx.transaction.message.accountKeys[1].writable);
      assert(tx.transaction.message.accountKeys[1].pubkey.equals(SystemProgram.programId));
      assert(tx.transaction.message.instructions.length === 1);

      const instr = tx.transaction.message.instructions[0] as ParsedInstruction;
      assert(instr.programId.equals(SystemProgram.programId));
      assert(instr.program === 'system');
      assert(instr.parsed.type === 'transfer');
      assert(instr.parsed.info.destination === payload.destination);
      assert(instr.parsed.info.lamports === payload.lamports);
      assert(instr.parsed.info.source === payload.walletId);
      verified = true;
    }
    else {
      const messageDecoded = Buffer.from(message, 'base64').toString('utf-8');
      console.log('DECODED', messageDecoded);
      const signedMessage = bs58.decode(signedMsg);
      const encodedMessage = new TextEncoder().encode(messageDecoded);
      const publicKey = new PublicKey(pubKey);
      verified = sign.detached.verify(
        encodedMessage,
        signedMessage,
        publicKey.toBytes()
      )
    }
    if (verified) {
      next();
    }
    else {
      res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ msg: "Signature is not valid" });
    }

  } catch (err) {
    console.log(err);
    res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "Token is not valid" });
  }
}