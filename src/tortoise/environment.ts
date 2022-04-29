import { RuntimeError } from "./error";
import { Token } from "./token";

export class Environment {
  private readonly values = new Map<string, any>();

  define(name: string, value: any) {
    this.values.set(name, value);
  }

  assign(name: Token, value: any) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`)
  }

  get(name: Token) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}