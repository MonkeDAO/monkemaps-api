import Geocoding from '@mapbox/mapbox-sdk/services/geocoding';
const puppeteer = require('puppeteer');
const geoService = Geocoding({
  accessToken:
    'pk.eyJ1IjoiMHhkb24iLCJhIjoiY2wzeWtqcmJkMG1yMzNybnh5dDE4amxhYyJ9.bOSRMX8QHTVQ2Nrlhxxb1g',
});

const GoogleMapsLinks = {
  urls: [
    'g.page',
    'goog.gl/maps',
    'goog.gl',
    'maps.google',
    'maps.app.goo.gl',
    'goo.gl',
  ],
  isUrl(url: string) {
    return this.urls.some((link: string) => url?.includes(link));
  },
};

export const chunkItems = <T>(items: T[], chunkSize?: number) =>
  items.reduce((chunks: T[][], item: T, index) => {
    const chunkSz = chunkSize ?? 50;
    const chunk = Math.floor(index / chunkSz);
    chunks[chunk] = ([] as T[]).concat(chunks[chunk] || [], item);
    return chunks;
  }, []);

export const wait = (time: number) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });

export const waitForUrl = async (page: any, retry = 0) => {
  if (retry > 10) return null;
  const matched = urlLoaded(page.url());
  if (matched) {
    console.log(retry);
    return matched;
  } else {
    await wait(1000);
    return waitForUrl(page, retry + 1);
  }
};

export const urlLoaded = (url: string) => {
  const matches = url.match(/@([+-]?\w+\.\w+),([+-]?\w+\.\w+)/);
  if (matches && matches.length === 3) {
    return [Number(matches[1]), Number(matches[2])];
  }
  return null;
};

export const GoogleMapsCoordinateScraper = {
  scrape: async (url: string) => {
    if (GoogleMapsLinks.isUrl(url)) {
      const browser = await puppeteer.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.goto(url);

        const coords = await waitForUrl(page);

        await browser.close();

        return coords;
      } catch (e) {
        throw e;
      } finally {
        await browser.close();
      }
    }
    return null;
  },
};

export async function GetCoordinatesFromText(
  name: string,
): Promise<[number, number]> {
  if (!name) {
    return [0, 0];
  }
  console.log('GetCoordinatesFromText', name);
  const parsedName = name.split(',');
  let country = ['us'];
  let queryString = '';
  if (parsedName.length > 1) {
    queryString = `${parsedName[0]}, ${parsedName[1]}`;
    country = [parsedName[1].toLowerCase()];
  } else {
    queryString = parsedName[0];
    country = undefined;
  }
  const results = await geoService
    .forwardGeocode({
      query: queryString,
      autocomplete: true,
    })
    .send();
  console.log(results);
  let coords = results.body.features[0].geometry.coordinates;
  return [coords[1], coords[0]];
}

export async function GetTextFromCoordinates(
  coords: [number, number],
): Promise<string> {
  console.log('GetTextFromCoordinates', coords);
  const results = await geoService
    .reverseGeocode({
      query: [coords[1], coords[0]],
    })
    .send();
  console.log(results);
  return results.body.features[0].place_name;
}

export function getEnvVariable(varname: string): string {
  return (process.env[varname] || process.env[`APPSETTING_${varname}`]) ?? ""
}