import connectDb from '../connections/database';
import Monke, { IMonke } from "../models/db/monke";
import Event, { IEvent } from "../models/db/event";
import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

class MonkeMapsController {

    public async get(req, res) {
        try {
            //const client = await connectDb();

            const result = await fetchCalendar();


            res.send(JSON.stringify(result));
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }
}

async function fetchCalendar(): Promise<any> {
    var base = new Airtable({ apiKey: process.env.AIRTABLE_API }).base('appntlNIDLaxFCZp0');
    let events: any[] = [];
    base('MonkeDAO Calendar').select({
        // Selecting the first 3 records in Events List:
        maxRecords: 3,
        view: "Events List"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
            events.push(record);
            console.log('Retrieved', record.get('Name'));
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        //fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
    });
    return events;
}

export default MonkeMapsController;