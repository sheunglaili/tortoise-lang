import { Token } from 'tortoise/token';

export class ParserError extends Error { }

export class RuntimeError extends Error {
  readonly token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}