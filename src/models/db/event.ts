import { Document, Model, model, Schema } from 'mongoose'
import { MonkeLocation } from '../location'

export interface IEvent extends Document {
  name: string
  startDate: string
  endDate: string
  lastModified: string
  virtual: boolean
  type: string
  status: string
  link: string
  extraLink: string
  contacts: string[]
  location: MonkeLocation
  id: string
  image: string
  airtableId: string
}

const subSchema = new Schema(
  {
    link: {
      type: String,
      required: false,
    },
    hasLink: {
      type: Boolean,
      required: false,
      default: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      default: [0, 0],
    },
    text: {
      type: String,
      required: false,
    },
  },
  { _id: false },
)

const eventSchema: Schema = new Schema({
  type: {
    type: 'String',
  },
  name: {
    type: 'String',
  },
  contacts: {
    type: ['String'],
  },
  startDate: {
    type: 'Date',
  },
  endDate: {
    type: 'Date',
  },
  lastModified: {
    type: 'Date',
  },
  extraLink: {
    type: 'String',
  },
  virtual: {
    type: 'Boolean',
  },
  link: {
    type: 'String',
  },
  status: {
    type: 'String',
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
})

const DbEvent: Model<IEvent> = model<IEvent>('DbEvent', eventSchema)

export default DbEvent
