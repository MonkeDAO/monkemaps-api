import { Document, Model, model, Schema } from "mongoose";


export interface IEvent extends Document {
    name: string,
    host: string,
    date: Date,
    link: string,
    city: string,
    country: string,
    address1: string,
    address2: string,
    zipcode: number,
    latitude: number,
    longitude: number,
    id: string,
    image: string,
    airtableId: string
}

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
    city: {
        type: String,
        required: false,
        default: '',
    },
    country: {
        type: String,
        required: false,
        default: '',
    },
    address1: {
        type: String,
        required: false,
        default: '',
    },
    address2: {
        type: String,
        required: false,
        default: '',
    },
    zipcode: {
        type: Number,
        required: false,
    },
    lattitude: {
        type: Number,
        required: false,
    },
    longitude: {
        type: Number,
        required: false,
    },
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