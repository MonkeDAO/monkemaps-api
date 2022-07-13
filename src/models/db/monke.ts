import { Document, Model, model, Schema } from 'mongoose';
import { Location } from '../location';

export interface IMonke extends Document {
  nickName: string;
  walletId: string;
  twitter: string;
  github: string;
  telegram: string;
  discord: string;
  id: string;
  monkeId: string;
  location: Location;
  image: string;
  monkeNumber: string;
}

const subSchema = new Schema(
  {
    latitude: {
      type: String,
      required: false,
    },
    longitude: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
  },
  { _id: false },
);

const monkeSchema: Schema = new Schema({
  walletId: {
    type: String,
    required: true,
    unique: true,
  },
  twitter: {
    type: String,
    required: false,
    default: '',
  },
  nickName: {
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
  monkeId: {
    type: String,
    required: false,
    default: '',
  },
  image: {
    type: String,
    required: false,
    default: '',
  },
  monkeNumber: {
    type: String,
    required: false,
    default: '',
  },
  location: {
    type: subSchema,
    required: false,
  },
});

const Monke: Model<IMonke> = model<IMonke>('Monke', monkeSchema);

export default Monke;
