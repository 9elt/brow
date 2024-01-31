import puppeteer, { Browser, Page } from "puppeteer";

const DEBUG = false;

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

let path;
try {
    path = Bun.argv[2];
}
catch {
    console.log('provide a file path');
    process.exit(1);
}

let file;
try {
    file = await Bun.file(path).text();
}
catch {
    console.log('provide a valid script');
    process.exit(1);
}

const ARGS = Bun.argv.slice(2)
    .reduce((c, arg, i) => (Object.assign(c, { ['$' + i]: arg })), {
        '$@': Bun.argv.slice(3).join(' '),
    });

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
    },
    async sleep(ms) {
        ms = parseInt(ms);
        ms && await Bun.sleep(ms)
    },
    async press(key) {
        await page.keyboard.press(key.trim());
    },
    async type(text) {
        if (await this.wait('*:focus'))
            await page.type('*:focus', text.trim());
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
    async read() {
        for await (const _ of console)
            return _;
    },
    async exit(status) {
        console.log();
        process.exit(parseInt(status) || 0);
    },
    async if(bool) {
        EXEC_NEXT_CMD = !/^(|false|null|undefined)$/.test(bool.trim());
    },
    async ifnot(bool) {
        EXEC_NEXT_CMD = /^(|false|null|undefined)$/.test(bool.trim());
    },
    async log() { },
};

function parse_cmd(line) {
    let char = '';
    let i = 0;
    let cmd = '';
    let args = '';
    while ((char = line.charAt(i)) && char === ' ')
        i++;
    while ((char = line.charAt(i++)) && char !== ' ')
        cmd += char;
    while ((char = line.charAt(i++)))
        args += char;
    for (const key in ARGS)
        args = args.replace(key, ARGS[key]);
    args = args.replace(/(?<!\\)(\$\S+)/g, '');
    return [cmd, args];
}

async function cmd(command, args) {
    log_CMD(command, args);
    try {
        const res = await COMMANDS[command](args);
        log_OK();
        return res;
    }
    catch (err) {
        log_ERR();
        DEBUG && console.log(err);
    }
}

let EXEC_NEXT_CMD = true;

await parse(file, async (line) => {
    if (!line || line.startsWith('#'))
        return;

    if (!EXEC_NEXT_CMD)
        return EXEC_NEXT_CMD = true;

    await COMMANDS.sleep(150);

    if (line.startsWith('$')) {
        const [name, _] = parse_cmd(line);
        const [command, args] = parse_cmd(_);
        ARGS[name] = command in COMMANDS
            ? await cmd(command, args)
            : _;
        return;
    }

    const [command, args] = parse_cmd(line);
    await cmd(command, args);
});

process.exit(0);

async function parse(str, f) {
    let LF = true;
    let curr = '';
    for (const char of str) {
        if (char === ' ' && LF)
            continue;
        if (char === '\r')
            continue;
        if (char === '\n') {
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
        curr += char;
        LF &&= false;
    }
    await f(curr.trim());
}

function log_CMD(command, args) {
    console.write(esc(command, 38, 5, 244, 1), ' ', args.trim(), ' ');
}

function log_OK() {
    console.write(esc('OK', 38, 5, 155, 1), '\n');
}

function log_ERR() {
    console.write(esc('ERR', 38, 5, 203, 1), '\n');
}

function esc(text, ...codes) {
    return '\x1b[' + codes.join(';') + 'm' + text + '\x1b[0m';
}
