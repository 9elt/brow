import { page } from './browser';

export const commands: {
    [key: string]: (...args: string[]) => Promise<any>
} = {
    async goto(url) {
        try {
            await page.goto(url);
            return true;
        } catch {
            return false;
        }
    },
    async click(selector) {
        if (await this.wait(selector)) {
            await page.click(selector);
            return true;
        }
        return false;
    },
    async focus(selector) {
        if (await this.wait(selector)) {
            await page.focus(selector);
            return true;
        }
        return false;
    },
    async hover(selector) {
        if (await this.wait(selector)) {
            await page.hover(selector);
            return true;
        }
        return false;
    },
    async select(selector) {
        if (await this.wait(selector)) {
            await page.select(selector);
            return true;
        }
        return false;
    },
    async tap(selector) {
        if (await this.wait(selector)) {
            await page.tap(selector);
            return true;
        }
        return false;
    },
    async wait(selector) {
        try {
            await page.waitForSelector(selector);
            return true;
        } catch {
            return false;
        }
    },
    async has(selector) {
        return await page.evaluate((selector) => {
            return document.querySelector(selector) !== null;
        }, selector);
    },
    async scroll(selector) {
        await page.evaluate((selector) => {
            const el = document.querySelector(selector);
            el && el.scrollIntoView({ behavior: 'smooth' });
        }, selector);
        return true;
    },
    async sleep(mss) {
        let ms = parseInt(mss);
        ms && await Bun.sleep(ms)
        return true;
    },
    async press(key) {
        await page.keyboard.press(key.trim() as any);
        return true;
    },
    async type(text) {
        if (await this.wait('*:focus'))
            await page.type('*:focus', text.trim());
        return true;
    },
    async slowtype(text) {
        if (await this.wait('*:focus')) {
            text = text.trim();
            for (const char of text) {
                await page.type('*:focus', char);
                await Bun.sleep(50);
            }
        }
        return true;
    },
    async browser(js) {
        return await page.evaluate((r) => eval(r), js);
    },
    async server(js) {
        return eval(js);
    },
    async save(string) {
        const [filename, ...data] = string.split(' ');
        await Bun.write(filename, data.join(' '));
        return true;
    },
    async yesNO(queystion) {
        console.write(queystion + ' [y/N]: ');
        for await (const _ of console)
            return /y(es)?/.test(_.trim().toLowerCase()) ? 1 : 0;
    },
    async YESno(question) {
        console.write(question + ' [Y/n]: ');
        for await (const _ of console)
            return /n(o)?/.test(_.trim().toLowerCase()) ? 0 : 1;
    },
    async read(question) {
        console.write(question + ': ');
        for await (const _ of console)
            return _;
    },
    async pause(message) {
        console.write(message);
        for await (const _ of console)
            return true;
    },
    async exit(status) {
        process.exit(parseInt(status) || 0);
    },
    async log(args) {
        console.log(args);
        return true;
    },
};
