import { Monitor } from "./monitor";
import { Scanner } from "./scanner"
import { TokenType } from "./token";

const monitor: Monitor = {
  error: jest.fn(),
  runtimeError: jest.fn()
}

test("should ignore all comments", () => {
  const scanner = new Scanner(
    `// This is a comment`,
    monitor
  );

  const tokens = scanner.scanTokens();
  expect(tokens.length).toEqual(1);
  expect(tokens[0].type).toEqual(TokenType.EOF)
});

test("should respect newline character", () => {
  const scanner = new Scanner(
    "\n abc",
    monitor
  );

  const tokens = scanner.scanTokens();

  expect(tokens.length).toEqual(2);
  expect(tokens[0].type).toEqual(TokenType.IDENTIFIER);
  expect(tokens[0].line).toEqual(2);
});

test("should ignore and post error message when pass in unexpected character", () => {
  const scanner = new Scanner(
    "$",
    monitor
  );

  const tokens = scanner.scanTokens();

  expect(tokens.length).toEqual(1);
  expect(monitor.error).toBeCalledWith(1, "Unexpected character.")
});

test("should write error message when there is unterminated string", () => {
  const scanner = new Scanner(
    "\"123",
    monitor,
  );

  scanner.scanTokens();

  expect(monitor.error).toBeCalledWith(1, "Unterminated string.")
})

test("should scan multi-line string", () => {
  const scanner = new Scanner(
    `"hello
      world"`,
      monitor
  );

  const tokens = scanner.scanTokens();
  expect(tokens[0].type).toEqual(TokenType.STRING);
  expect(tokens[0].literal).toEqual("hello\n      world")
})

test("should scan single character tokens", () => {
  const scanner = new Scanner(
    `(){},.-+;/*`,
    monitor
  )

  const tokens = scanner.scanTokens();

  expect(tokens[0].type).toEqual(TokenType.LEFT_PAREN);
  expect(tokens[1].type).toEqual(TokenType.RIGHT_PAREN);
  expect(tokens[2].type).toEqual(TokenType.LEFT_BRACE);
  expect(tokens[3].type).toEqual(TokenType.RIGHT_BRACE);
  expect(tokens[4].type).toEqual(TokenType.COMMA);
  expect(tokens[5].type).toEqual(TokenType.DOT);
  expect(tokens[6].type).toEqual(TokenType.MINUS);
  expect(tokens[7].type).toEqual(TokenType.PLUS);
  expect(tokens[8].type).toEqual(TokenType.SEMICOLON);
  expect(tokens[9].type).toEqual(TokenType.SLASH);
  expect(tokens[10].type).toEqual(TokenType.STAR);
});

test("should able to scan composite tokens", () => {
  const scanner = new Scanner(
    `!!====>=><=<`,
    monitor
  )

  const tokens = scanner.scanTokens();

  expect(tokens[0].type).toEqual(TokenType.BANG);
  expect(tokens[1].type).toEqual(TokenType.BANG_EQUAL);
  expect(tokens[2].type).toEqual(TokenType.EQUAL_EQUAL);
  expect(tokens[3].type).toEqual(TokenType.EQUAL);
  expect(tokens[4].type).toEqual(TokenType.GREATER_EQUAL);
  expect(tokens[5].type).toEqual(TokenType.GREATER);
  expect(tokens[6].type).toEqual(TokenType.LESS_EQUAL);
  expect(tokens[7].type).toEqual(TokenType.LESS);
})

test("should scan literals", () => {
  const scanner = new Scanner(
    `hello HELLO hello_world "world" 123 123.456 123.`,
    monitor
  );

  const tokens = scanner.scanTokens();

  expect(tokens[0].type).toEqual(TokenType.IDENTIFIER);
  expect(tokens[0].lexeme).toEqual("hello");
  expect(tokens[1].type).toEqual(TokenType.IDENTIFIER);
  expect(tokens[1].lexeme).toEqual("HELLO")
  expect(tokens[2].type).toEqual(TokenType.IDENTIFIER);
  expect(tokens[2].lexeme).toEqual("hello_world")
  expect(tokens[3].type).toEqual(TokenType.STRING);
  expect(tokens[3].literal).toEqual("world")
  expect(tokens[4].type).toEqual(TokenType.NUMBER);
  expect(tokens[4].literal).toEqual(123)
  expect(tokens[5].type).toEqual(TokenType.NUMBER);
  expect(tokens[5].literal).toEqual(123.456)
  expect(tokens[6].type).toEqual(TokenType.NUMBER);
  expect(tokens[6].literal).toEqual(123)
})

test("should scan keywords", () => {
  const scanner = new Scanner(
    `and class else false func for if nil or print return super this true var while`,
    monitor
  );

  const tokens = scanner.scanTokens();

  expect(tokens[0].type).toEqual(TokenType.AND);
  expect(tokens[1].type).toEqual(TokenType.CLASS);
  expect(tokens[2].type).toEqual(TokenType.ELSE);
  expect(tokens[3].type).toEqual(TokenType.FALSE);
  expect(tokens[4].type).toEqual(TokenType.FUNC);
  expect(tokens[5].type).toEqual(TokenType.FOR);
  expect(tokens[6].type).toEqual(TokenType.IF);
  expect(tokens[7].type).toEqual(TokenType.NIL);
  expect(tokens[8].type).toEqual(TokenType.OR);
  expect(tokens[9].type).toEqual(TokenType.PRINT);
  expect(tokens[10].type).toEqual(TokenType.RETURN);
  expect(tokens[11].type).toEqual(TokenType.SUPER);
  expect(tokens[12].type).toEqual(TokenType.THIS);
  expect(tokens[13].type).toEqual(TokenType.TRUE);
  expect(tokens[14].type).toEqual(TokenType.VAR);
  expect(tokens[15].type).toEqual(TokenType.WHILE);
})