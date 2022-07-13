import express, { Application, Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import allRoutes from './routers/AllRouters';
import connectDB from './connections/database';
import Airtable from 'airtable';
import { Express } from 'express-serve-static-core';

class Server {
  private app: Express;

  constructor() {
    this.app = express();
    this.config();
    this.routerConfig();
    this.dbConnect();
  }

  private config() {
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json({ limit: '1mb' })); // 100kb default
    Airtable.configure({ apiKey: process.env.AIRTABLE_API });
  }

  private dbConnect() {
    connectDB().catch((err) => {
      console.error('Connection error', err, err.message);
    });
  }

  private routerConfig() {
    this.app.use(allRoutes);
  }

  public start = (port: number) => {
    return new Promise((resolve, reject) => {
      this.app
        .listen(port, () => {
          resolve(port);
        })
        .on('error', (err: Object) => reject(err));
    });
  };
}

export default Server;
