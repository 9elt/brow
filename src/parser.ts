import { AND, ARGS, ASSIGN, ARGS_CLOSE, COMMAND, COMMENT, DATA, EOL, NEXT, ARGS_OPEN, OR, VARIABLE, GROUP_OPEN, GROUP_CLOSE, GROUP } from "./const";
import { Tokens } from "./tokens";
import { Meta } from "./types";

export function parser(tokens: Tokens) {
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
        else if (tokens[i] === GROUP_OPEN) {
            let group = new Tokens();

            while (tokens[++i] !== GROUP_CLOSE && i < tokens.length) {
                group.push_back(tokens[i]);
            }

            meta.push({
                type: GROUP,
                data: parser(group),
            });
        }
        else if (tokens[i] === COMMAND) {
            let name = tokens[++i];

            while (!name.trim())
                name = tokens[++i];

            let args = new Tokens();

            while (tokens[++i] !== ARGS_CLOSE && i < tokens.length) {
                args.push_back(tokens[i]);
            };

            args.push_back(tokens[i]);

            meta.push({
                type: COMMAND,
                name: name.trim(),
                data: parser(args),
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
                data: parser(value),
            });

            meta.push({
                type: EOL,
            })
        }
        else if (tokens[i] === ARGS_OPEN) {
            let args = new Tokens();

            while (tokens[++i] !== ARGS_CLOSE && i < tokens.length) {
                args.push_back(tokens[i]);
            }

            meta.push({
                type: ARGS,
                data: parser(args),
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
