import Monke, { IMonke } from "../models/db/monke";
import Event, { IEvent } from "../models/db/event";
import express, { Request, Response } from 'express';
import Airtable from 'airtable';
import dotenv from 'dotenv';

import { Location } from '../models/location';
dotenv.config();

type MonkeLocation = {
    hasLink: boolean,
    link: string,
    text: string,
    coordinates: [number, number],
}

type Monke = {
    walletId: string,
    nickName: string,
    twitter: string,
    github: string,
    telegram: string,
    discord: string,
    monkeId: string,
    image: string,
    location: MonkeLocation
}

type MonkeEvent = {
    id: string,
    location: MonkeLocation
    name: string,
    startDate: string,
    endDate: string,
    virtual: boolean,
    type: string,
    status: string,
    link: string,
    extraLink: string,
    contacts: string[]
}

class MonkeMapsController {

    public async get(req: Request, res: Response) {
        try {
            const result = await getCalendar();

            // get corresponding events from ddb
            // check if they need to be re-scraped
            //      scrape
            //      return events

            res.send(JSON.stringify(result));
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async getAllMonkes(eq: Request, res: Response) {
        try {
            const result = await Monke.find({walletId: {$exists: true}});
            res.send(JSON.stringify(result));
        }
        catch (error) {
            console.log(error, error.message);
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
                monkeId,
                location,
                image, nickName } = req.body;
            
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
                monkeId,
                image,
                location: mappedLocation,
                nickName
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
                monkeId,
                location,
                image, nickName } = req.body;
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
                if (validateInput(nickName, foundMonke)) {
                    foundMonke.nickName = nickName;
                }
                if (validateInput(monkeId, foundMonke)) {
                    foundMonke.monkeId = monkeId;
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
            const { id } = req.params;
            await Monke.deleteOne({ walletId: id });
            res.status(200).send();
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async getUser(req: Request, res: Response) {
        try {
            //const client = await connectDb();
            const { id } = req.params;
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

function getCalendar (): Promise<any> {
    return new Promise((resolve, reject) => {
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API,
        }).base(process.env.AIRTABLE_BASE_ID);
        const table = base('MonkeDAO Calendar');
    
        const events = [];
    
        console.log('starting fetch');
        
        table.select({
            view: 'Events List'
        }).eachPage((records, processNextPage) => {
            console.log('found records ', records)
            records.forEach((record) => {
                console.log('Record: ', record)
                events.push({
                    id: record.id,
                    name: record.get('Name'),
                    type: record.get('Type'),
                    location: record.get('Location'),
                    coordinates: [],
                    start_date: record.get('Starting Date'),
                    end_date: record.get('End Date'),
                    status: record.get('Status'),
                });
                console.log('Retrieved', record.get('Name'));
            });
    
            processNextPage();
        }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(events);
            }
        })
    })
}

async function fetchCalendar(): Promise<any> {
    var base = new Airtable({ apiKey: process.env.AIRTABLE_API }).base('appntlNIDLaxFCZp0');
    let events: any[] = [];
    console.log('fetching')
    base('MonkeDAO Calendar').select({
        // Selecting the first 3 records in Events List:
        maxRecords: 10,
        view: "Events List"
    }).eachPage(function page(records, fetchNextPage) {
        console.log('found: ', records)
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