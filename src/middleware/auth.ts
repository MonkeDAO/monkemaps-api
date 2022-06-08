import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import express, { Response, NextFunction } from 'express';
import getJWTSettings from '../utils/jwthelper';
import { Payload } from "../models/api/payload";
import Request from "../models/api/request";


export default function(req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "No token, authorization denied" });
  }
  // Verify token
  try {
    const jwtSettings = getJWTSettings();
    const payload: Payload | any = jwt.verify(token, jwtSettings.JWTSecret);
    req.walletId = payload.walletId;
    next();
  } catch (err) {
    res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "Token is not valid" });
  }
}