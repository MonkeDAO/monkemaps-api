import { Response } from 'express';
import { validationResult } from 'express-validator';
import { MIN_LAMPORTS, MAX_LAMPORTS } from '../models/constants/utils';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Payload, TxnPayload } from '../models/api/payload';
import Request from '../models/api/request';
import Monke, { IMonke } from '../models/db/monke';
import getJWTSettings from '../utils/jwthelper';
import assert from 'assert';
import * as Solana from '@solana/web3.js';
import _ from 'lodash';
import bs58 from 'bs58';
import { Connection, PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';

dotenv.config();

class AuthController {
  // @route   POST api/auth
  // @desc    Login user and get token
  // @access  Public
  public async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { walletId, signature, nonce } = req.body;
    try {
      let user: IMonke = await Monke.findOne({ walletId });

      if (!user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: 'Invalid Credentials',
            },
          ],
        });
      }

      const isMatch = false;

      if (!isMatch) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: 'Invalid Credentials',
            },
          ],
        });
      }

      const payload: Payload = {
        walletId: user.walletId,
      };
      const jwtSettings = getJWTSettings();

      jwt.sign(
        payload,
        jwtSettings.JWTSecret,
        { expiresIn: jwtSettings.JWTExpiration },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        },
      );
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }
  }

  public async signedMessage(req: Request, res: Response) {
    try {
      const { walletId, message, signedMsg } = req.body;
      const messageStr = message;
      const publicKey = new PublicKey(walletId);
      const connection = new Connection(
        process.env.RPC_URL || process.env.APPSETTING_RPC_URL,
        'confirmed',
      );
      let nftResult = await getParsedNftAccountsByOwner({
        publicAddress: walletId,
        connection,
      });
      nftResult = nftResult.filter(
        (x) =>
          x.updateAuthority ===
          (process.env.COLLECTION || process.env.APPSETTING_COLLECTION),
      );
      if (nftResult.length === 0) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ msg: 'No monkes, authorization denied' });
      }
      let verified = false;
      const messageDecoded = Buffer.from(messageStr, 'base64').toString(
        'utf-8',
      );
      console.log('DECODED', messageDecoded);
      const signedMessage = bs58.decode(signedMsg);
      const encodedMessage = new TextEncoder().encode(messageDecoded);
      verified = sign.detached.verify(
        encodedMessage,
        signedMessage,
        publicKey.toBytes(),
      );

      const jwtSettings = getJWTSettings();

      assert(jwtSettings.JWTSecret);

      const payload: Payload = {
        walletId: walletId,
        verified,
        message: messageStr,
      };

      jwt.sign(
        payload,
        jwtSettings.JWTSecret,
        { expiresIn: jwtSettings.JWTExpiration },
        (err, token) => {
          if (err) throw err;
          return res.status(HttpStatusCodes.OK).json({ token });
        },
      );
    } catch (e) {
      console.error(e);
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: 'Invalid Credentials',
          },
        ],
      });
    }
  }

  public async initTxnSigned(req: Request, res: Response) {
    try {
      const { walletId, message } = req.body;
      const messageStr = message;
      const from: string = walletId;
      const connection = new Solana.Connection(
        process.env.RPC_URL || process.env.APPSETTING_RPC_URL,
        'confirmed',
      );
      const sigs = await connection.getConfirmedSignaturesForAddress2(
        new Solana.PublicKey(from),
      );
      let nftResult = await getParsedNftAccountsByOwner({
        publicAddress: walletId,
        connection,
      });
      nftResult = nftResult.filter(
        (x) =>
          x.updateAuthority ===
          (process.env.COLLECTION || process.env.APPSETTING_COLLECTION),
      );
      if (nftResult.length === 0) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ msg: 'No monkes, authorization denied' });
      }
      const messageDecoded = Buffer.from(messageStr, 'base64').toString(
        'utf-8',
      );
      
      const lamports = _.random(MIN_LAMPORTS, MAX_LAMPORTS);
      const destination = from;
      const jwtSettings = getJWTSettings();

      assert(jwtSettings.JWTSecret);

      const payload: TxnPayload = {
        walletId: walletId,
        lamports,
        destination,
        signature: sigs && sigs.length > 0 ? sigs[0].signature : null,
        message: messageDecoded,
        verified: false,
      };

      jwt.sign(
        payload,
        jwtSettings.JWTSecret,
        { expiresIn: jwtSettings.JWTExpiration },
        (err, token) => {
          if (err) throw err;
          return res.status(HttpStatusCodes.OK).json({ token, lamports, destination });
        },
      );
    } catch (e) {
      console.error(e);
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: 'Invalid Credentials',
          },
        ],
      });
    }
  }
}
export default AuthController;
