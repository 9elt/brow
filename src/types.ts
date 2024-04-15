import { AND, ARGS, ASSIGN, COMMAND, COMMENT, DATA, EOL, GROUP, NEXT, OR, VARIABLE } from './const';

export type TokenComment = typeof COMMENT;
export type TokenCommand = typeof COMMAND;
export type TokenVariable = typeof VARIABLE;
export type TokenAnd = typeof AND;
export type TokenOr = typeof OR;
export type TokenNext = typeof NEXT;
export type TokenAssign = typeof ASSIGN;
export type TokenLineEnd = typeof EOL;
export type TokenData = typeof DATA;
export type TokenArgs = typeof ARGS;
export type TokenGroup = typeof GROUP;

export type TokenType =
    TokenComment |
    TokenCommand |
    TokenVariable |
    TokenAnd |
    TokenOr |
    TokenNext |
    TokenAssign |
    TokenLineEnd |
    TokenData |
    TokenArgs |
    TokenGroup;

export type Meta = {
    type: TokenType;
    name?: string;
    data?: Meta[] | string;
};
