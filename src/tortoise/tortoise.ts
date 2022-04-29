import { Scanner } from 'tortoise/scanner';
import { Printer } from 'tortoise/printer';
import { TortoiseMonitor } from 'tortoise/monitor';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

export class Tortoise {

  printer: Printer;

  constructor(printer: Printer) {
    this.printer = printer;
  }

  public run(source: string): void {
    const monitor = new TortoiseMonitor(this.printer);
    const scanner: Scanner = new Scanner(source, monitor);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, monitor);
    const statements = parser.parse();
    if (monitor.hasError) return;

    const interpreter = new Interpreter(monitor, this.printer);

    interpreter.interpret(statements);
  }
}