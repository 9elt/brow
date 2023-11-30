import puppeteer, { Browser, Page } from "puppeteer";

const DEBUG = true;

/** @type {Browser} */
let browser;
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

for (const arg of Bun.argv.slice(2))
    await main(arg);

process.exit(0);

async function main(path) {
    let file;
    try {
        file = await Bun.file(path).text();
    }
    catch {
        console.log('provide a valid script');
        return 1;
    }

    /** @type {Page} */
    let page = 0;
    for (const p of await browser.pages())
        if (await p.evaluate(() => document.visibilityState == 'visible')) {
            page = p;
            break;
        }
    if (!page)
        page = await browser.newPage();

    const COMMANDS = {
        async goto(url) {
            await page.goto(url);
        },
        async click(selector) {
            if (await this.wait(selector))
                await page.click(selector);
        },
        async focus(selector) {
            if (await this.wait(selector))
                await page.focus(selector);
        },
        async hover(selector) {
            if (await this.wait(selector))
                await page.hover(selector);
        },
        async select(selector) {
            if (await this.wait(selector))
                await page.select(selector);
        },
        async tap(selector) {
            if (await this.wait(selector))
                await page.tap(selector);
        },
        async wait(selector) {
            try {
                await page.waitForSelector(selector);
                return true;
            } catch {
                return false;
            }
        },
        async scroll(selector) {
            await page.evaluate((selector) => {
                const el = document.querySelector(selector);
                el && el.scrollIntoView({ behavior: 'smooth' });
            }, selector);
        },
        async sleep(ms) {
            ms = parseInt(ms);
            ms && await Bun.sleep(ms)
        },
        async press(key) {
            await page.keyboard.press(key);
        },
        async type(text) {
            if (await this.wait('*:focus'))
                await page.type('*:focus', text);
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
        async yesNO() {
            console.write('[y/N] ');
            for await (const _ of console)
                return /y(es)?/.test(_.trim().toLowerCase()) ? 1 : this.exit(1);
        },
        async YESno() {
            console.write('[Y/n] ');
            for await (const _ of console)
                return /n(o)?/.test(_.trim().toLowerCase()) ? this.exit(1) : 1;
        },
        async log() { }
    };

    const VAR = {};

    function parse_cmd(line) {
        let c = '';
        let i = 0;
        let cmd = '';
        let args = '';
        while ((c = line.charAt(i++)) !== ' ')
            cmd += c;
        while ((c = line.charAt(i++)))
            args += c;
        for (const key in VAR)
            args = args.replace(key, VAR[key]);
        return [cmd, args];
    }

    await parse(file, async (line) => {
        if (!line || line.startsWith('#'))
            return;

        await COMMANDS.sleep(150);

        if (line.startsWith('$')) {
            const [name, _] = parse_cmd(line);
            const [command, args] = parse_cmd(_);
            try {
                VAR[name] = command in COMMANDS
                    ? await COMMANDS[command](args) : _;
            }
            catch { }
            return;
        }

        const [command, args] = parse_cmd(line);
        console.write(esc(command, 38, 5, 244, 1), ' ', args, ' ');

        try {
            await COMMANDS[command](args);
            console.write(esc('OK', 38, 5, 155, 1), '\n');
        }
        catch (err) {
            console.write(esc('ERR', 38, 5, 203, 1), '\n');
            DEBUG && console.log(err);
        }
    });
}

async function parse(str, f) {
    let LF = true;
    let curr = '';
    for (const c of str) {
        if (c === '\n') {
            if (LF) {
                await f(curr.trim());
                curr = '';
                LF = false;
            }
            else {
                LF = true;
                curr += ' ';
            }
            continue;
        }
        curr += c;
        if (LF)
            LF = false;
    }
    await f(curr.trim());
}

function esc(text, ...codes) {
    return '\x1b[' + codes.join(';') + 'm' + text + '\x1b[0m';
}
