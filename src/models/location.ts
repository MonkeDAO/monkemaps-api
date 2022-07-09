export type MonkeLocation = {
  hasLink: boolean
  link: string
  text: string
  coordinates: [number, number]
}

export interface Location {
  text?: string
  latitude?: string
  longitude?: string
  city?: string
  state?: string
  zipcode?: string
  country?: string
}

export interface EventLocation extends Location {
  address1?: string
  address2?: string
}
