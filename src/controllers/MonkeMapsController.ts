import connectDb from '../connections/database';
import Monke, { IMonke } from "../models/db/monke";
import Event, { IEvent } from "../models/db/event";

class MonkeMapsController {

    public async get(req, res) {
        try {
            const client = await connectDb();

            // const sql = "SELECT * FROM todos";
            // const { rows } = await client.query(sql);
            // const todos = rows;

            // //client.release();

            res.send({});
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default MonkeMapsController;