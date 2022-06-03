
const puppeteer = require('puppeteer');

const GoogleMapsLinks = {
    urls: ["g.page", "goog.gl/maps", "goog.gl", "maps.google", "maps.app.goo.gl"],
    isUrl(url: string) {
        return this.urls.some((link: string) => url.includes(link));
    }
};

export const chunkItems = <T>(items: T[], chunkSize?: number) =>
    items.reduce((chunks: T[][], item: T, index) => {
        const chunkSz = chunkSize ?? 50;
        const chunk = Math.floor(index / chunkSz);
        chunks[chunk] = ([] as T[]).concat(chunks[chunk] || [], item);
        return chunks;
    }, []);

export const wait = (time: number) => new Promise((resolve, reject) => {
    setTimeout(resolve, time)
})

export const waitForUrl = async (page: any, retry = 0) => {
    if (retry > 10) return null;
    const matched = urlLoaded(page.url());
    if (matched) {
        console.log(retry)
        return matched
    }
    else {
        await wait(1000);
        return waitForUrl(page, retry + 1)
    }
}

export const urlLoaded = (url: string) => {
    const matches = url.match(/@([+-]?\w+\.\w+),([+-]?\w+\.\w+)/);
    if (matches && matches.length === 3) {
        return [matches[1], matches[2]]
    }
    return null
}

export const GoogleMapsCoordinateScraper = {
    scrape: async (url: string) => {
        if (GoogleMapsLinks.isUrl(url)) {
            const browser = await puppeteer.launch({ headless: true });
            try {
                const page = await browser.newPage();
                await page.goto(url);

                const coords = await waitForUrl(page)

                await browser.close();

                return coords;
            } catch (e) {
                throw e
            } finally {
                await browser.close();
            }
        }
        return null;
    }
}