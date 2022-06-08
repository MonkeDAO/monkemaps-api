import Monke, { IMonke } from "../models/db/monke";
import DbEvent, { IEvent } from "../models/db/event";
import express, { Request, Response } from 'express';
import Airtable from 'airtable';
import dotenv from 'dotenv';
import _ from 'lodash';
import { Location, MonkeLocation } from '../models/location';
import { chunkItems, GoogleMapsCoordinateScraper, GetTextFromCoordinates, GetCoordinatesFromText } from '../utils/util';
dotenv.config();

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

const mapLocation = (location: MonkeLocation): Location => ({
    latitude: `${location.coordinates[0]}`,
    longitude: `${location.coordinates[1]}`,
    text: location.text,
});

function isUrl(text: string): boolean {
    return text.includes('http');
}

const mapEvent = (event: any): MonkeEvent => ({
    id: event.id,
    location: {
        link: isUrl(event.location) ? event.location: '',
        hasLink: isUrl(event.location),
        coordinates: [0,0],
        text: event.location
    },
    type: event.type?.trim(),
    name: event.name?.trim(),
    contacts: event.contacts,
    startDate: event.start_date,
    endDate: event.end_date,
    extraLink: event.externalLink?.trim(),
    virtual: isVirtual(event),
    link: event.location?.trim(),
    status: event.status?.trim()
});

const mapFromDbEvent = (event: IEvent): MonkeEvent => ({
    id: event.airtableId,
    location: event.location,
    type: event.type?.trim(),
    name: event.name?.trim(),
    contacts: event.contacts,
    startDate: event.startDate,
    endDate: event.endDate,
    extraLink: event.extraLink?.trim(),
    virtual: event.virtual,
    link: event.location.hasLink ? event.location.link : '',
    status: event.status
});

const mapToDbEvent = (event: MonkeEvent): any => ({
    airtableId: event.id,
    location: {
        link: event.location.link,
        hasLink: event.location.hasLink,
        coordinates: event.location.coordinates,
        text: event.location.text
    },
    type: event.type?.trim(),
    name: event.name?.trim(),
    contacts: event.contacts,
    startDate: event.startDate,
    endDate: event.endDate,
    extraLink: event.extraLink?.trim(),
    virtual: event.virtual,
    link: event.location.hasLink ? event.location.link : '',
    status: event.status
});



function isVirtual(event: any): boolean {
    if(event.type && (event.type == 'Mainstream Event' || event.type == 'MonkeDAO Event' || event.type == 'MonkeDAO Meet-up')) {
        return false;
    }
    return true;
};

class MonkeMapsController {

    public async get(req: Request, res: Response) {
        try {
            const result: any[] = await getCalendar();
            let mappedEvents = result.map((x: any) => mapEvent(x));
            let eventsFromDb = await DbEvent.find({"airtableId": {"$exists" : true, "$ne" : ""}});
            if (eventsFromDb.length > 0) {
                mappedEvents = mappedEvents.filter(ar => !eventsFromDb.find(rm => (rm.airtableId === ar.id) ));
            }
            console.log(mappedEvents);
            let chunkedEvents = chunkItems(mappedEvents, 3);
            for(let chunk of chunkedEvents) {
                await Promise.all(chunk.map(async (evt, index) => {
                    if(!evt.virtual) {
                        const locationCoords = await GoogleMapsCoordinateScraper.scrape(evt.location.text);
                        if(locationCoords != null) {
                            const text = await GetTextFromCoordinates(locationCoords);
                            evt.location.coordinates = locationCoords;
                            evt.location.text = text;
                            Promise.resolve(evt);
                        }
                        else {
                            const coords = await GetCoordinatesFromText(evt.location.text);
                            evt.location.coordinates = coords;
                            Promise.resolve(evt);
                        }
                    }
                    else Promise.resolve();
                }));
            }

            if(mappedEvents.length > 0) {
                let eventsToSave = mappedEvents.map(e => new DbEvent(mapToDbEvent(e)));
                await DbEvent.collection.insertMany(eventsToSave);
            }
            
            let eventsToReturn = _.concat(mappedEvents, eventsFromDb.map(x => mapFromDbEvent(x.toObject())));

            res.send(JSON.stringify(eventsToReturn));
        } catch (error) {
            console.log(error, error.message)
            res.status(400).send(error);
        }
    }

    public async getAllMonkes(eq: Request, res: Response) {
        try {
            const result = await Monke.find({walletId: {$exists: true}}).select("-signature");
            res.send(JSON.stringify(result.map(x => x.toObject())));
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
            
            let monkeParams = {
                walletId,
                twitter,
                github,
                telegram,
                discord,
                monkeId,
                image,
                location: mapLocation(location),
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
                image, nickName, monkeNumber } = req.body;
            let foundMonke = await Monke.findOne({ walletId: walletId }).select("-signature");
            if (foundMonke) {
                //refactor this
                // const newLocation = verifyLocation(location, foundMonke);
                foundMonke.location = location;
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
                if (validateInput(monkeNumber, foundMonke)) {
                    foundMonke.monkeNumber = monkeNumber;
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
            const monke = await Monke.findOne({ walletId: id }).select("-signature");
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
                    status: record.get('Status '),
                    externalLink: record.get('Form / External Link'),
                    contacts: record.get('IRL Contact')
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
        if(newLocation?.text != currentLocation.text){
            currentLocation.text = newLocation.text;
        }
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