import connectDb from '../connections/database';
import Monke, { IMonke } from "../models/db/monke";
import Event, { IEvent } from "../models/db/event";
import express, { Request, Response } from 'express';
import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

class MonkeMapsController {

    public async get(req: Request, res: Response) {
        try {
            //const client = await connectDb();

            const result = await fetchCalendar();
            res.send(JSON.stringify(result));
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async createmonke(req: Request, res: Response) {
        try {
            const { walletId,
                twitter,
                github,
                telegram,
                discord,
                monkeIds,
                image } = req.body;

            let monkeParams = {
                walletId,
                twitter,
                github,
                telegram,
                discord,
                monkeIds,
                image
            };
            let newMonke = new Monke(monkeParams);
            await newMonke.save();
            res.status(200).send(newMonke);
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async updatemonke(req: Request, res: Response) {
        try {
            const { walletId,
                twitter,
                github,
                telegram,
                discord,
                monkeIds,
                image } = req.body;
            const monkeArr = monkeIds as string[];
            let foundMonke = await Monke.findOne({ walletId: walletId });
            if (foundMonke) {
                //refactor this
                if (validateInput(twitter, foundMonke)) {
                    foundMonke.twitter = twitter;
                }
                if (validateInput(github, foundMonke)) {
                    foundMonke.github = github;
                }
                if (validateInput(telegram, foundMonke)) {
                    foundMonke.telegram = telegram;
                }
                if (validateInput(discord, foundMonke)) {
                    foundMonke.discord = discord;
                }
                if (validateInput(image, foundMonke)) {
                    foundMonke.image = image;
                }
                if ((monkeArr && foundMonke.monkeIds && foundMonke.monkeIds.length != monkeArr?.length) || (monkeArr && foundMonke.monkeIds.length == 0)) {
                    foundMonke.monkeIds = monkeArr;
                }
            }
            await foundMonke.save();
            res.status(200).send(foundMonke);
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async deleteMonke(req: Request, res: Response) {
        try {
            const { id } = req.query;
            await Monke.deleteOne({ walletId: id });
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async getUser(req: Request, res: Response) {
        try {
            //const client = await connectDb();
            const { id } = req.query;
            const monke = await Monke.findOne({ walletId: id });
            if (monke) {
                res.status(200).json(monke);
            }
            else {
                res.status(404).json('Not found');
            }
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

function validateInput(input, monke: IMonke): boolean {
    if ((input && monke[`${input}`] && monke[`${input}`] != input) || (input && !monke[`${input}`])) {
        return true;
    }
    return false;
}

export default MonkeMapsController;