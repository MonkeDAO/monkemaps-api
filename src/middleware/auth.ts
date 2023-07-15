import HttpStatusCodes from 'http-status-codes';
import { Response, NextFunction } from 'express';
import Request from '../models/api/request';
import {
  Connection,
  ParsedInstruction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import getJWTSettings from '../utils/jwthelper';
import jwt from 'jsonwebtoken';
import assert from 'assert';
import { Payload, TxnPayload } from '../models/api/payload';
import { searchAssetsByCollection, Asset } from '../utils/helius';
import { getEnvVariable } from '../utils/util';

export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Get token from header
  const token = req.header('x-auth-token');
  const txn = req.header('x-auth-txn');
  const hardware = req.header('x-auth-hw');
  const reqParamList = Object.keys(req.params);
  let walletToUse = '';

  if(reqParamList.length > 0 && reqParamList.includes('id') || reqParamList.includes('walletId')) {
    walletToUse = req.params.id || req.params.walletId;
  }
  else {
    walletToUse = req.body?.walletId ?? req.body?.id;
  }
  let verified = false;
  // Check if no token
  if (!token || token === '') {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: 'No token, authorization denied' });
  }
  try {
    const jwtSettings = getJWTSettings();
    const payload: TxnPayload | Payload | any = jwt.verify(
      token,
      jwtSettings.JWTSecret,
    );
    if (walletToUse !== payload.walletId && req.method !== 'GET') {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: 'Invalid Credentials',
          },
        ],
      });
    }
    // Verify token

    const connection = new Connection(
      process.env.RPC_URL || process.env.APPSETTING_RPC_URL,
      'confirmed',
    );
    const promiseAllResult = await Promise.all([searchAssetsByCollection(payload.walletId, getEnvVariable('COLLECTION')), searchAssetsByCollection(payload.walletId, getEnvVariable('COLLECTION2'))]);
    const nftResult = (promiseAllResult as Asset[][]).flatMap(x => x);
    if (nftResult.length === 0) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ msg: 'No monkes, authorization denied' });
    }

    if (hardware && hardware !== '') {
      const sigs = await connection.getConfirmedSignaturesForAddress2(
        new PublicKey(payload.walletId as string),
      );
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
      assert(tx.transaction.message.accountKeys.length >= 2);
      assert(tx.transaction.message.accountKeys[0].signer);
      assert(tx.transaction.message.accountKeys[0].writable);
      assert(
        tx.transaction.message.accountKeys[0].pubkey.toString() ===
          payload.walletId,
      );
      assert(!tx.transaction.message.accountKeys[1].signer);
      assert(!tx.transaction.message.accountKeys[1].writable);
      assert(
        tx.transaction.message.accountKeys[1].pubkey.equals(
          SystemProgram.programId,
        ),
      );
      assert(tx.transaction.message.instructions.length >= 1);

      const instr = tx.transaction.message.instructions[0] as ParsedInstruction;
      assert(instr.programId.equals(SystemProgram.programId));
      assert(instr.program === 'system');
      assert(instr.parsed.type === 'transfer');
      assert(instr.parsed.info.destination === payload.destination);
      assert(instr.parsed.info.lamports === payload.lamports);
      assert(instr.parsed.info.source === payload.walletId);
      verified = true;
    } else {
      verified = payload.verified;
    }
    if (verified) {
      next();
    } else {
      res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ msg: 'Signature is not valid' });
    }
  } catch (err) {
    console.log(err);
    res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: 'Token is not valid' });
  }
}
