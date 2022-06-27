import express, { Application, Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import monkeMapsRouter from './routers/MonkeMapsRouter';
import defaultRouter from './routers/DefaultRouter';
import connectDB from './connections/database';
import Airtable from 'airtable';


class Server {
    private app;

    constructor() {
        this.app = express();
        this.config();
        this.routerConfig();
        this.dbConnect();
    }

    private config() {
        this.app.use(cors())
        this.app.use(bodyParser.urlencoded({ extended:true }));
        this.app.use(bodyParser.json({ limit: '1mb' })); // 100kb default
        Airtable.configure({ apiKey: process.env.AIRTABLE_API })
    }

    private dbConnect() {
        connectDB()
        .catch((err) => {
            console.error('Connection error', err, err.message);
        }); 
    }

    private routerConfig() {
        this.app.use('/monkemaps', monkeMapsRouter);
        this.app.use('/', defaultRouter);
    }

    public start = (port: number) => {
        return new Promise((resolve, reject) => {
            this.app.listen(port, () => {
                resolve(port);
            }).on('error', (err: Object) => reject(err));
        });
    }
}

export default Server;