import { lexer } from './lexer';
import { evaluate } from './eval';
import { tbuild } from './tbuilder';

let path: string;
try {
    path = Bun.argv[2];
}
catch {
    console.log('provide a file path');
    process.exit(1);
}

let file: string;
try {
    file = await Bun.file(path).text();
}
catch {
    console.log('provide a valid script');
    process.exit(1);
}

evaluate(tbuild(lexer(file)));
