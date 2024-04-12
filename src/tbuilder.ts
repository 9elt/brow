import { AND, ARGS, ASSIGN, CLOSE_ARGS, COMMAND, COMMENT, DATA, EOL, NEXT, OPEN_ARGS, OR, VARIABLE } from "./const";
import { Tokens } from "./tokens";
import { Meta } from "./types";

export function tbuild(tokens: Tokens) {
    let meta: Meta[] = [];

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === VARIABLE) {
            let name = tokens[++i];

            while (!name.trim() && i < tokens.length)
                name = tokens[++i];

            meta.push({
                type: VARIABLE,
                name: name.trim(),
            });
        }
        else if (tokens[i] === COMMAND) {
            let name = tokens[++i];

            while (!name.trim())
                name = tokens[++i];

            let args = new Tokens();

            while (tokens[++i] !== CLOSE_ARGS && i < tokens.length) {
                args.push_back(tokens[i]);
            };

            args.push_back(tokens[i]);

            meta.push({
                type: COMMAND,
                name: name.trim(),
                data: tbuild(args),
            });
        }
        else if (tokens[i] === AND) {
            meta.push({
                type: AND,
            });
        }
        else if (tokens[i] === OR) {
            meta.push({
                type: OR,
            });
        }
        else if (tokens[i] === NEXT) {
            meta.push({
                type: NEXT,
            });
        }
        else if (tokens[i] === EOL) {
            meta.push({
                type: EOL,
            });
        }
        else if (tokens[i] === ASSIGN) {
            let value = new Tokens();

            while (tokens[++i] !== EOL && i < tokens.length) {
                value.push_back(tokens[i]);
            }

            meta.push({
                type: ASSIGN,
                data: tbuild(value),
            });

            meta.push({
                type: EOL,
            })
        }
        else if (tokens[i] === OPEN_ARGS) {
            let args = new Tokens();

            while (tokens[++i] !== CLOSE_ARGS && i < tokens.length) {
                args.push_back(tokens[i]);
            }

            meta.push({
                type: ARGS,
                data: tbuild(args),
            });
        }
        else if (tokens[i] === COMMENT) {
            meta.push({
                type: COMMENT,
                data: tokens[++i],
            });
        }
        else if (tokens[i]?.trim()) {
            meta.push({
                type: DATA,
                data: tokens[i],
            });
        }
    };
    return meta;
}
