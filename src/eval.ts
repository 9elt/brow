import { commands } from "./commands";
import { AND, ARGS, ASSIGN, COMMAND, COMMENT, DATA, DEBUG, EOL, GROUP, NEXT, OR, VARIABLE, VARS } from "./const";
import { Meta } from "./types";

export async function evaluate(meta: Meta[]) {
    let prev: Meta | null = null;
    let result: any = null;

    for (let i = 0; i < meta.length; i++) {
        const type = meta[i].type;

        if (DEBUG) {
            console.log("\x1b[38;5;240m>>>>", JSON.stringify(meta[i], null, 2), "\x1b[0m");
        }

        const data = meta[i].data;
        const name = meta[i].name;

        if (type === COMMENT) {
            continue;
        }
        if (type === EOL) {
            if (i + 1 < meta.length) {
                prev = null;
                result = null;
                continue;
            }
            return result;
        }
        if (type === GROUP) {
            result = await evaluate(data as Meta[]);
            prev = meta[i];
            continue;
        }
        if (type === COMMAND) {
            if (!name) {
                throw new Error(`Invalid command name`);
            }
            if (!(name in commands)) {
                throw new Error("Command not found: " + name);
            }

            try {
                result = await commands[name](evaluateArgs(data as Meta[]));
            } catch (e) {
                if (DEBUG) {
                    console.error(e);
                }
                result = null;
            }

            prev = meta[i];
            continue;
        }
        if (type === VARIABLE) {
            if (!name) {
                throw new Error(`Invalid variable name`);
            }
            result = VARS[name];
            prev = meta[i];
            continue;
        }
        if (type === ASSIGN) {
            if (!prev || prev.type !== VARIABLE) {
                throw new Error(`Invalid assignment`);
            }
            if (!data) {
                throw new Error(`Invalid assignment value`);
            }
            VARS[prev.name as string] = await evaluate(data as Meta[]);
            result = VARS[prev.name as string];
            prev = meta[i];
            continue;
        }
        if (type === AND) {
            if (!boolify(result)) {
                while (i < meta.length && meta[i].type !== EOL)
                    i++;
                i--;
                result = null;
                prev = null;
            }
            continue;
        }
        if (type === OR) {
            if (boolify(result)) {
                while (i < meta.length && meta[i].type !== EOL)
                    i++;
                i--;
                result = null;
                prev = null;
            }
            continue;
        }
        if (type === NEXT) {
            result = null;
            prev = null;
            continue;
        }
        if (type === ARGS) {
            result = evaluateArgs([meta[i]]);
            prev = meta[i];
            continue;
        }
        if (type === DATA) {
            result = data as string;
            prev = meta[i];
            continue;
        }
    }

    return result;
}

function evaluateVariable(meta: Meta): string {
    if (meta.name as string in VARS) {
        return VARS[meta.name as string];
    }
    return "";
}

function evaluateArgs([V]: Meta[]): string {
    const meta = V.data as Meta[];
    let value = "";

    for (const node of meta) {
        if (node.type === VARIABLE) {
            value += evaluateVariable(node);
        }
        else if (node.type === DATA) {
            value += node.data as string;
        }
        else {
            throw new Error("Invalid argument " + JSON.stringify(meta));
        }
    }

    return value;
}

function boolify(bool: any) {
    return typeof bool === "string" ?
        !/^(|0|false|null|undefined)$/.test(bool)
        : !!bool;
}
