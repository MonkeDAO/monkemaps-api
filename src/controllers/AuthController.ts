import { Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { Payload } from '../models/api/payload';
import Request from '../models/api/request';
import Monke, { IMonke } from '../models/db/monke';
import getJWTSettings from '../utils/jwtHelper';
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
              msg: "Invalid Credentials"
            }
          ]
        });
      }

      const isMatch = false;

      if (!isMatch) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "Invalid Credentials"
            }
          ]
        });
      }

      const payload: Payload = {
        walletId: user.walletId
      };
      const jwtSettings = getJWTSettings();
      
      jwt.sign(
        payload,
        jwtSettings.JWTSecret,
        { expiresIn: jwtSettings.JWTExpiration },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
  }
}
export default AuthController;