import { Document, Model, model, Schema } from "mongoose";


export interface IMonke extends Document {
    walletId: string,
    twitter: string,
    github: string,
    telegram: string,
    discord: string,
    id: string,
    monkeIds: string[],
    image: string
}

const monkeSchema: Schema = new Schema({
    walletId: {
        type: String,
        required: true,
        unique: true
    },
    twitter: {
        type: String,
        required: false,
        default: '',
    },
    github: {
        type: String,
        required: false,
        default: '',
    },
    telegram: {
        type: String,
        required: false,
        default: '',
    },
    discord: {
        type: String,
        required: false,
        default: '',
    },
    monkeIds: [{
        type: String,
        required: false,
        default: '',
    }],
    image: {
        type: String,
        required: false,
        default: '',
    },
});

const Monke: Model<IMonke> = model<IMonke>("Monke", monkeSchema);

export default Monke;