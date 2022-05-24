import { Document, Model, model, Schema } from "mongoose";
import { EventLocation } from "../location";


export interface IEvent extends Document {
    name: string,
    host: string,
    date: Date,
    link: string,
    location: EventLocation,
    id: string,
    image: string,
    airtableId: string
}

const subSchema = new Schema({
    latitude: {
        type: String,
        required: false,
    },
    longitude: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    state: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    zipcode: {
        type: String,
        required: false,
    },
    address1: {
        type: String,
        required: false,
    },
    address2: {
        type: String,
        required: false,
    }
}, { _id : false });

const eventSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    host: {
        type: String,
        required: false,
        default: 'MonkeDAO',
    },
    date: {
        type: Date,
        required: false,
    },
    link: {
        type: String,
        required: false,
        default: '',
    },
    location: subSchema,
    image: {
        type: String,
        required: false,
        default: '',
    },
    airtableId: {
        type: String,
        required: false,
        default: '',
    },
});

const Monke: Model<IEvent> = model<IEvent>("Event", eventSchema);

export default Event;