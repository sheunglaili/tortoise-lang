import { Expr } from "./expr";
import { Monitor } from "./monitor";
import { Parser } from "./parser";
import { Stmt } from "./stmt";
import { Token, TokenType } from "./token";

const monitor: Monitor = {
  error: jest.fn(),
  runtimeError: jest.fn()
}

test.each([
  {
    tokens: [
      new Token(TokenType.NUMBER, "123", 123, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Literal(123),
  },
  {
    tokens: [
      new Token(TokenType.STRING, "hello", "hello", 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Literal("hello"),
  },
  {
    tokens: [
      new Token(TokenType.TRUE, "true", 123, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Literal(true),
  },
  {
    tokens: [
      new Token(TokenType.FALSE, "false", 123, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Literal(false)
  },
  {
    tokens: [
      new Token(TokenType.NIL, "nil", 123, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Literal(null),
  },
  {
    tokens: [
      new Token(TokenType.LEFT_PAREN, "(", null, 1),
      new Token(TokenType.STRING, "parentheses", "parentheses", 1),
      new Token(TokenType.RIGHT_PAREN, ")", null, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Grouping(new Expr.Literal("parentheses"))
  },
  {
    tokens: [
      new Token(TokenType.IDENTIFIER, 'abc', null, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Variable(new Token(TokenType.IDENTIFIER, 'abc', null, 1))
  }
])("should parse primary expression: $code", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor);
  const [stmt] = parser.parse();
  expect(stmt instanceof Stmt.Expression).toEqual(true);
  expect((stmt as Stmt.Expression).expression).toEqual(expected);
});

test("should ignore statement when parsing unknown primary expression", () => {
  const parser = new Parser([
    new Token(TokenType.RIGHT_PAREN, ")", null, 1),
    new Token(TokenType.STRING, "parentheses", "parentheses", 1),
    new Token(TokenType.LEFT_PAREN, "(", null, 1),
    new Token(TokenType.SEMICOLON, ";", null, 1),
    new Token(TokenType.EOF, "", null, 1)
  ], monitor);
  const stmts = parser.parse();
  expect(stmts.length).toEqual(0);
})


test.each([
  {
    expression: `-123;`,
    tokens: [
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "123", 123, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Unary(
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal(123)
    )
  },
  {
    expression: `!true;`,
    tokens: [
      new Token(TokenType.BANG, "!", null, 1),
      new Token(TokenType.TRUE, "true", null, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Unary(
      new Token(TokenType.BANG, "!", null, 1),
      new Expr.Literal(true)
    )
  }
])("should parse unary expression: $expression", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor);
  const [stmt] = parser.parse();
  expect(stmt instanceof Stmt.Expression).toEqual(true)
  expect((stmt as Stmt.Expression).expression).toEqual(expected);
});

test.each([
  {
    expression: '-1 / -1;',
    tokens: [
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SLASH, "/", null, 1),
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
      new Token(TokenType.SLASH, "/", null, 1),
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
    )
  },
  {
    expression: '-1 * -1;',
    tokens: [
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.STAR, "*", null, 1),
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
    )
  },
  {
    expression: '!1 / !1;',
    tokens: [
      new Token(TokenType.BANG, "!", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SLASH, "/", null, 1),
      new Token(TokenType.BANG, "!", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.BANG, "!", null, 1),
        new Expr.Literal(1),
      ),
      new Token(TokenType.SLASH, "/", null, 1),
      new Expr.Unary(
        new Token(TokenType.BANG, "!", null, 1),
        new Expr.Literal(1),
      ),
    )
  },
])("should parse factor expression: $expression", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor);
  const [stmt] = parser.parse();
  expect(stmt instanceof Stmt.Expression).toEqual(true)
  expect((stmt as Stmt.Expression).expression).toEqual(expected);
})

test.each([
  {
    expression: '-1 + -1;',
    tokens: [
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
      new Token(TokenType.PLUS, "+", null, 1),
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
    )
  },
  {
    expression: '-1 + -1;',
    tokens: [
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.MINUS, "-", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(1),
      ),
    )
  }
])("should parse term expression: $expression", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor);
  const [stmt] = parser.parse();
  expect(stmt instanceof Stmt.Expression).toEqual(true)
  expect((stmt as Stmt.Expression).expression).toEqual(expected);
})

test.each([
  {
    expression: "1 > 2",
    tokens: [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.GREATER, ">", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.GREATER, ">", null, 1),
      new Expr.Literal(2),
    )
  },
  {
    expression: "1 < 2",
    tokens: [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.LESS, "<", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.LESS, "<", null, 1),
      new Expr.Literal(2),
    )
  },
  {
    expression: "1 >= 2",
    tokens: [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
      new Expr.Literal(2),
    )
  },
  {
    expression: "1 <= 2",
    tokens: [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.LESS_EQUAL, "<=", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.LESS_EQUAL, "<=", null, 1),
      new Expr.Literal(2),
    )
  }
])("should parse comparison expression: $expression", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor);
  const [stmt] = parser.parse();
  expect(stmt instanceof Stmt.Expression).toEqual(true)
  expect((stmt as Stmt.Expression).expression).toEqual(expected);
})

test.each([
  {
    expression: "1 == 1;",
    tokens: [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
      new Expr.Literal(1)
    )
  },
  {
    expression: "1 != 1;",
    tokens: [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.BANG_EQUAL, "!=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    expected: new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.BANG_EQUAL, "!=", null, 1),
      new Expr.Literal(1)
    )
  }
])("should parse equality expression: $expression", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor);

  const [stmt] = parser.parse();

  expect(stmt instanceof Stmt.Expression).toEqual(true);
  expect((stmt as Stmt.Expression).expression).toEqual(expected);
});

test("should parse assignment expression: var a; a = 1 + 2;", () => {
  const parser = new Parser(
    [
      new Token(TokenType.VAR, "var", null, 1),
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    monitor
  );

  const stmts = parser.parse();

  expect(stmts[0] instanceof Stmt.Var).toEqual(true);
  const varStmt = stmts[0] as Stmt.Var;
  expect(varStmt.name).toEqual(new Token(TokenType.IDENTIFIER, "a", null, 1))
  expect(varStmt.initializer).toEqual(null);

  expect(stmts[1] instanceof Stmt.Expression).toEqual(true);
  const assignStmt = stmts[1] as Stmt.Expression;
  expect(assignStmt.expression).toEqual(new Expr.Assign(
    new Token(TokenType.IDENTIFIER, "a", null, 1),
    new Expr.Binary(
      new Expr.Literal(1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Expr.Literal(2)
    )
  ));
});

test("should print error if expression is not ended with ;", () => {
  const parser = new Parser(
    [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.EOF, "", null, 1),
    ],
    monitor,
  )

  parser.parse();

  expect(monitor.error).toBeCalledWith(
    new Token(TokenType.EOF, "", null, 1),
    "Expect ';' after expression."
  );
});

test("should print error if var declaration is not ended with ;", () => {
  const parser = new Parser(
    [
      new Token(TokenType.VAR, "var", null, 1),
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    monitor,
  )

  parser.parse();

  expect(monitor.error).toBeCalledWith(
    new Token(TokenType.EOF, "", null, 1),
    "Expect ';' after variable declaration."
  );
});

test("should print error if print statement is not ended with ;", () => {
  const parser = new Parser(
    [
      new Token(TokenType.PRINT, "print", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    monitor,
  )

  parser.parse();

  expect(monitor.error).toBeCalledWith(
    new Token(TokenType.EOF, "", null, 1),
    "Expect ';' after value."
  );
});

test.each([
  {
    tokens: [
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.VAR, "var", null, 2),
      new Token(TokenType.IDENTIFIER, "a", null, 2),
      new Token(TokenType.EQUAL, "=", null, 2),
      new Token(TokenType.NUMBER, "1", 1, 2),
      new Token(TokenType.PLUS, "+", null, 2),
      new Token(TokenType.NUMBER, "2", 2, 2),
      new Token(TokenType.SEMICOLON, ";", null, 2),
      new Token(TokenType.EOF, "", null, 2)
    ],
    expected: [
      new Stmt.Var(
        new Token(TokenType.IDENTIFIER, "a", null, 2),
        new Expr.Binary(
          new Expr.Literal(1),
          new Token(TokenType.PLUS, "+", null, 2),
          new Expr.Literal(2),
        )
      )
    ]
  },
  {
    tokens: [
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.PRINT, "print", null, 2),
      new Token(TokenType.NUMBER, "2", 2, 2),
      new Token(TokenType.SEMICOLON, ";", null, 2),
      new Token(TokenType.EOF, "", null, 2)
    ],
    expected: [
      new Stmt.Print(
        new Expr.Literal(2)
      )
    ]
  },
  {
    tokens: [
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.LEFT_PAREN, "(", null, 1),
      new Token(TokenType.RIGHT_PAREN, ")", null, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.VAR, "var", null, 2),
      new Token(TokenType.IDENTIFIER, "a", null, 2),
      new Token(TokenType.EQUAL, "=", null, 2),
      new Token(TokenType.NUMBER, "1", 1, 2),
      new Token(TokenType.PLUS, "+", null, 2),
      new Token(TokenType.NUMBER, "2", 2, 2),
      new Token(TokenType.SEMICOLON, ";", null, 2),
      new Token(TokenType.EOF, "", null, 2)
    ],
    expected: [
      new Stmt.Var(
        new Token(TokenType.IDENTIFIER, "a", null, 2),
        new Expr.Binary(
          new Expr.Literal(1),
          new Token(TokenType.PLUS, "+", null, 2),
          new Expr.Literal(2),
        )
      )
    ]
  }
])("should be able to discard problematic token till new expression starts", ({ tokens, expected }) => {
  const parser = new Parser(tokens, monitor)

  expect(parser.parse()).toEqual(expected);
})

test("should parse print statement", () => {
  const parser = new Parser([
    new Token(TokenType.PRINT, "print", null, 1),
    new Token(TokenType.STRING, "abc", "abc", 1),
    new Token(TokenType.SEMICOLON, ";", null, 1),
    new Token(TokenType.EOF, "", null, 1)
  ], monitor);

  const [stmt] = parser.parse();

  expect(stmt).toEqual(new Stmt.Print(
    new Expr.Literal("abc")
  ));
})

test("should print error if left side of equal is not a variable", () => {
  const parser = new Parser(
    [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.SEMICOLON, ";", null, 1),
      new Token(TokenType.EOF, "", null, 1)
    ],
    monitor
  );

  parser.parse();

  expect(monitor.error).toBeCalledWith(
    new Token(TokenType.EQUAL, "=", null, 1),
    "Invalid assignment target."
  );
})

test("factor expression should have higher priority than term expression", () => {
  // -1 * 5 - 3
  const tokens = [
    new Token(TokenType.MINUS, "-", null, 1),
    new Token(TokenType.NUMBER, "1", 1, 1),
    new Token(TokenType.STAR, "*", null, 1),
    new Token(TokenType.NUMBER, "5", 5, 1),
    new Token(TokenType.MINUS, "-", null, 1),
    new Token(TokenType.NUMBER, "3", 3, 1),
    new Token(TokenType.SEMICOLON, ";", null, 1),
    new Token(TokenType.EOF, "", null, 1)
  ];
  const parser = new Parser(tokens, monitor);
  const [stmt] = parser.parse();
  expect((stmt as Stmt.Expression).expression).toEqual(
    new Expr.Binary(
      new Expr.Binary(
        new Expr.Unary(
          new Token(TokenType.MINUS, "-", null, 1),
          new Expr.Literal(1)
        ),
        new Token(TokenType.STAR, "*", null, 1),
        new Expr.Literal(5)
      ),
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal(3)
    )
  );
});