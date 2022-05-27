import connectDb from '../connections/database';
import Monke, { IMonke } from "../models/db/monke";
import Event, { IEvent } from "../models/db/event";
import express, { Request, Response } from 'express';
import Airtable from 'airtable';
import dotenv from 'dotenv';
import { Location } from '../models/location';
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
                location,
                image } = req.body;
            
            let mappedLocation: Location;
            if(location) {
                mappedLocation = location as Location;
            }
            
            let monkeParams = {
                walletId,
                twitter,
                github,
                telegram,
                discord,
                monkeIds,
                image,
                location: mappedLocation
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
                location,
                image } = req.body;
            const monkeArr = monkeIds as string[];
            let foundMonke = await Monke.findOne({ walletId: walletId });
            if (foundMonke) {
                //refactor this
                const newLocation = verifyLocation(location, foundMonke);
                foundMonke.location = newLocation;
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
        maxRecords: 10,
        view: "Events List"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
            let evt = {
                name: record.get('Name'),
                type: record.get('Type'),
                location: record.get('Location'),
                start_date: record.get('Starting Date'),
                end_date: record.get('End Date'),
                status: record.get('Status'),
            }
            events.push(evt);
            console.log('Retrieved', record.get('Name'));
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        //fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
        else {
            console.log('done events', events);
            return events;
        }
    });
}

function validateInput(input: string, monke: IMonke): boolean {
    if ((input && monke[`${input}`] && monke[`${input}`] != input) || (input && !monke[`${input}`])) {
        return true;
    }
    return false;
}

function verifyLocation(location: any, monke: IMonke): Location {
    //Refactor?
    let currentLocation = monke.location;
    if(location as Location) {
        const newLocation = location as Location;
        if(newLocation?.city != currentLocation.city){
            currentLocation.city = newLocation.city;
        }
        if(newLocation?.state != currentLocation.state){
            currentLocation.state = newLocation.state;
        }
        if(newLocation?.zipcode != currentLocation.zipcode){
            currentLocation.zipcode = newLocation.zipcode;
        }
        if(newLocation?.country != currentLocation.country){
            currentLocation.country = newLocation.country;
        }
        if(newLocation?.latitude != currentLocation.latitude){
            currentLocation.latitude = newLocation.latitude;
        }
        if(newLocation?.longitude != currentLocation.longitude){
            currentLocation.longitude = newLocation.longitude;
        }
    }
    return currentLocation;
}

export default MonkeMapsController;