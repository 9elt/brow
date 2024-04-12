import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser;
try {
    browser = await puppeteer.connect({
        browserURL: 'http://127.0.0.1:21222',
        defaultViewport: null,
    });
}
catch {
    console.log('open a debug browser, run:\nchromium --remote-debugging-port=21222');
    process.exit(1);
}

let page: Page = null as unknown as Page;

for (const p of await browser.pages())
    if (await p.evaluate(() => document.visibilityState == 'visible')) {
        page = p;
        break;
    }

if (!page) {
    page = await browser.newPage();
}

export { page };
