import { Token, TokenType } from "tortoise/token";
import { Printer } from 'tortoise/printer';
import { RuntimeError } from "./error";



export interface Monitor {
  error(location: Token | number, message: string): void;
  runtimeError(error :RuntimeError): void;
}

export class TortoiseMonitor implements Monitor {
  private readonly printer: Printer
  hasError: boolean;
  hasRuntimeError: boolean;
  constructor(printer: Printer) {
    this.printer = printer;
    this.hasError = false;
    this.hasRuntimeError = false;
  }

  private printError(line: number, where: string, message: string): void {
    this.printer.write(`[line ${line}] Error${where}: ${message}`)
  }

  error(location: Token | number, message: string): void {
    this.hasError = true;
    if (typeof location == "number") {
      this.printError(location, "", message);
    } else {
      if (location.type == TokenType.EOF) {
        this.printError(location.line, " at end", message);
      } else {
        this.printError(location.line, " at '" + location.lexeme + "'", message);
      }
    }
  }

  runtimeError(error: RuntimeError) {
    this.printer.write(`[line ${error.token.line}] ${error.message}`)
    this.hasRuntimeError = true;
  }
}