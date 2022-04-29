import { RuntimeError } from "./error";
import { TortoiseMonitor } from "./monitor";
import { Printer } from "./printer";
import { Token, TokenType } from "./token";

const printer: Printer = {
  write: jest.fn()
}

const monitor = new TortoiseMonitor(printer);

test("should print formatted error and set error flag when invoking printError()", () => {
  monitor.error(1, "Error with line number");

  expect(monitor.hasError).toEqual(true);
  expect(printer.write).toBeCalledWith("[line 1] Error: Error with line number");
});

test("should print EOF error when invoking printError() with EOF token", () => {
  monitor.error(new Token(TokenType.EOF, "", null, 1), "Error at end of file");

  expect(monitor.hasError).toEqual(true);
  expect(printer.write).toBeCalledWith("[line 1] Error at end: Error at end of file");
});

test("should print token lexeme when invoking printError() with named token", () => {
  monitor.error(new Token(TokenType.IF, "if", null, 1), "Error at named token");

  expect(monitor.hasError).toEqual(true);
  expect(printer.write).toBeCalledWith("[line 1] Error at 'if': Error at named token");
});

test("should print formatted runtime error when invoking runtimeError()", () => {
  monitor.runtimeError(
    new RuntimeError(new Token(TokenType.NIL, "nil", null, 1), "fake runtime error")
  );

  expect(monitor.hasRuntimeError).toEqual(true);
  expect(printer.write).toBeCalledWith("[line 1] fake runtime error");
})