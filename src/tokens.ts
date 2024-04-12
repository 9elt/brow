export class Tokens extends Array {
    constructor() {
        super();
    }

    push_back(token: string) {
        if (this[this.length - 1] === "") {
            this[this.length - 1] = token;
        }
        else {
            this.push(token);
        }
    }

    last_size() {
        return this[this.length - 1]?.trim().length;
    }
}
