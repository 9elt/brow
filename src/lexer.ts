import { AND, ASSIGN, CLOSE_ARGS, COMMAND, COMMENT, EOL, ESCAPE, NEXT, OPEN_ARGS, OR, VARIABLE, WORD } from "./const";
import { Tokens } from "./tokens";

export function lexer(str: string) {
    const tokens = new Tokens();

    let escape = false;
    let args = 0;
    let word = false;
    let comment = false;

    for (const char of str) {
        if (!escape && !comment) {
            if (char === ESCAPE) {
                escape = true;
                continue;
            }

            if (char === OPEN_ARGS) {
                if (!args++) {
                    tokens.push_back(char);
                    tokens.push_back("");
                }
                continue;
            }

            if (char === CLOSE_ARGS) {
                if (!--args) {
                    tokens.push_back(char);
                    tokens.push_back("");
                }
                continue;
            }

            if (
                char === VARIABLE ||
                (!args
                    && char === COMMAND
                )
            ) {
                tokens.push_back(char);
                tokens.push_back("");
                word = true;
                continue;
            }

            if (word && tokens.last_size() && !WORD.test(char)) {
                tokens.push_back(char);
                word = false;
                continue;
            }

            if (!args && char === COMMENT) {
                comment = true;
                tokens.push_back(char);
                tokens.push_back("");
                continue;
            }

            if (!args && (
                char === AND ||
                char === OR ||
                char === NEXT ||
                char === ASSIGN ||
                char === EOL
            )) {
                tokens.push_back(char);
                tokens.push_back("");
                continue;
            }
        }
        else if (comment && char === "\n") {
            comment = false;
            tokens.push_back(char);
            continue;
        }

        tokens[tokens.length - 1] += char;
    }

    return tokens;
}
