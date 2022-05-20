import { Expr } from "tortoise/expr"
import { RuntimeError } from "./error";
import { Interpreter } from "./interpreter";
import { Monitor } from "./monitor";
import { Printer } from './printer';
import { Stmt } from "./stmt";
import { Token, TokenType } from "./token";

const printer: Printer = {
  write: jest.fn()
}
const monitor: Monitor = {
  error: jest.fn(),
  runtimeError: jest.fn(),
}
const interpreter = new Interpreter(monitor, printer);

afterEach(() => {
  jest.mocked(printer.write).mockClear();
})

test.each([
  {
    input: new Expr.Literal(123),
    expected: 123
  },
  {
    input: new Expr.Literal("abc"),
    expected: "abc"
  },
  {
    input: new Expr.Literal(true),
    expected: true
  },
  {
    input: new Expr.Literal(false),
    expected: false
  }
])("visit literal expression should return value: $expected", ({ input, expected }) => {
  expect(interpreter.visitLiteralExpr(input)).toEqual(expected);
})

test.each([
  {
    input: new Expr.Unary(
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal(123)
    ),
    expected: -123
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(123)
      )
    ),
    expected: 123
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.BANG, "!", null, 1),
      new Expr.Literal(true)
    ),
    expected: false
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.BANG, "!", null, 1),
      new Expr.Unary(
        new Token(TokenType.BANG, "!", null, 1),
        new Expr.Literal(true)
      )
    ),
    expected: true
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.BANG, "!", null, 1),
      new Expr.Literal(123)
    ),
    expected: false
  }
])("visit unary should return interprete value: $expected", ({ input, expected }) => {
  expect(interpreter.visitUnaryExpr(input)).toEqual(expected);
})

test.each([
  {
    input: new Expr.Grouping(
      new Expr.Literal(123)
    ),
    expected: 123
  }
])("visit group expression should interprete value: $expected", ({ input, expected }) => {
  expect(interpreter.visitGroupingExpr(input)).toEqual(expected);
})

test.each([
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.PLUS, "+", null, 1),
      new Expr.Literal(456)
    ),
    expected: 123 + 456
  },
  {
    input: new Expr.Binary(
      new Expr.Literal("abc"),
      new Token(TokenType.PLUS, "+", null, 1),
      new Expr.Literal("def")
    ),
    expected: "abcdef"
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal(456)
    ),
    expected: -333
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.SLASH, "/", null, 1),
      new Expr.Literal(456)
    ),
    expected: 0.26973684210526316
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Literal(456)
    ),
    expected: 56088
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.GREATER, ">", null, 1),
      new Expr.Literal(456)
    ),
    expected: false
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
      new Expr.Literal(456)
    ),
    expected: false
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.LESS, "<", null, 1),
      new Expr.Literal(456)
    ),
    expected: true
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.LESS_EQUAL, "<=", null, 1),
      new Expr.Literal(456)
    ),
    expected: true
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.EQUAL, "==", null, 1),
      new Expr.Literal(456)
    ),
    expected: false
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.EQUAL, "==", null, 1),
      new Expr.Literal(123)
    ),
    expected: true
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.BANG_EQUAL, "==", null, 1),
      new Expr.Literal(456)
    ),
    expected: true
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.BANG_EQUAL, "==", null, 1),
      new Expr.Literal(123)
    ),
    expected: false
  },
])("visit binary expression should interprete value: $expected", ({ input, expected }) => {
  expect(interpreter.visitBinaryExpr(input)).toEqual(expected)
})

test.each([
  {
    input: new Expr.Assign(
      new Token(
        TokenType.IDENTIFIER,
        "hello",
        null,
        1
      ),
      new Expr.Literal("world")
    ),
    expected: "world"
  },
  {
    input: new Expr.Assign(
      new Token(
        TokenType.IDENTIFIER,
        "math",
        null,
        1
      ),
      new Expr.Literal(123)
    ),
    expected: 123
  },
])("visit assign expression should assign right expression to identifier", ({ input, expected }) => {

  // declare variable
  interpreter.visitVarStmt(new Stmt.Var(input.name, null));

  interpreter.visitAssignExpr(input);

  // get variable
  expect(interpreter.visitVariableExpr(new Expr.Variable(input.name))).toEqual(expected);
})

test("visited assign expression should allow right expression to be assignment", () => {

  const a = new Token(TokenType.IDENTIFIER, "a", null, 1);

  interpreter.visitVarStmt(
    new Stmt.Var(
      a,
      null
    )
  );

  const b = new Token(TokenType.IDENTIFIER, "b", null, 1);

  interpreter.visitVarStmt(
    new Stmt.Var(
      b,
      null
    )
  );

  interpreter.visitAssignExpr(new Expr.Assign(
    a,
    new Expr.Assign(
      b,
      new Expr.Literal(1)
    )
  ));

  expect(interpreter.visitVariableExpr(new Expr.Variable(a))).toEqual(1);
  expect(interpreter.visitVariableExpr(new Expr.Variable(b))).toEqual(1);
})

test.each([
  {
    input: new Expr.Unary(
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal("123")
    ),
    error: new RuntimeError(
      new Token(TokenType.MINUS, "-", null, 1),
      "Operand must be number."
    )
  }
])("throw runtime error when running prohibited unary expression", ({ input, error }) => {
  expect(() => interpreter.visitUnaryExpr(input)).toThrow(error);
})

test.each([
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.MINUS, "-", null, 1),
      "Operands must be numbers."
    )
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.GREATER, ">", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.GREATER, ">", null, 1),
      "Operands must be numbers."
    )
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
      "Operands must be numbers."
    )
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.LESS, "<", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.LESS_EQUAL, "<=", null, 1),
      "Operands must be numbers."
    )
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.SLASH, "/", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.SLASH, "/", null, 1),
      "Operands must be numbers."
    )
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.STAR, "*", null, 1),
      "Operands must be numbers."
    )
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.PLUS, "+", null, 1),
      new Expr.Literal("123123")
    ),
    error: new RuntimeError(
      new Token(TokenType.PLUS, "+", null, 1),
      "Operands must be two numbers or two strings."
    )
  }
])("throw runtime error when running prohibited binary expression", ({ input, error }) => {
  expect(() => interpreter.visitBinaryExpr(input)).toThrow(error);
})

test("runtime error should not thrown to interpreter.interpret() call", () => {
  expect(() => interpreter.interpret([
    new Stmt.Expression(new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal("123123")
    ))
  ])).not.toThrowError();
});

test.each([
  {
    input: [new Stmt.Print(new Expr.Literal("123"))],
    print: "123"
  },
  {
    input: [new Stmt.Print(new Expr.Literal("456"))],
    print: "456"
  }
])("should able interpret print statements", ({ input, print }) => {
  interpreter.interpret(input);
  expect(printer.write).toBeCalledWith(print);
})

test("should be able to interpret multiple statements", () => {
  interpreter.interpret([
    new Stmt.Print(new Expr.Literal("123")),
    new Stmt.Print(new Expr.Literal("456"))
  ]);
  expect(printer.write).toHaveBeenNthCalledWith(1, "123");
  expect(printer.write).toHaveBeenNthCalledWith(2, "456");
})

test("should get variable in enclosing scope if not defined in current scope", () => {
  interpreter.interpret([
    new Stmt.Var(
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Expr.Literal(1)
    ),
    new Stmt.Block([
      new Stmt.Print(new Expr.Variable(new Token(TokenType.IDENTIFIER, "a", null, 2)))
    ])
  ]);

  expect(printer.write).toBeCalledWith("1");
});

test("should restore to enclosing scope after finishing block", () => {
  interpreter.interpret([
    new Stmt.Var(
      new Token(TokenType.IDENTIFIER, "a", null, 1),
      new Expr.Literal(1)
    ),
    new Stmt.Block([
      new Stmt.Var(
        new Token(TokenType.IDENTIFIER, "a", null, 2),
        new Expr.Literal(2)
      ),
      new Stmt.Print(new Expr.Variable(new Token(TokenType.IDENTIFIER, "a", null, 3)))
    ]),
    new Stmt.Print(
      new Expr.Variable(new Token(TokenType.IDENTIFIER, "a", null, 4)) 
    )
  ]);
  expect(printer.write).toHaveBeenNthCalledWith(1, "2");
  expect(printer.write).toHaveBeenNthCalledWith(2, "1");
});

test.each([
  {
    description: "should run thenBranch statements", 
    statements: [
      new Stmt.If(
        new Expr.Literal(true),
        new Stmt.Print(new Expr.Literal("true")),
        new Stmt.Print(new Expr.Literal("false"))
      )
    ],
    assertion: () => {
      expect(printer.write).toBeCalledWith("true")
    }
  },
  {
    description: "should run elseBranch statements", 
    statements: [
      new Stmt.If(
        new Expr.Literal(false),
        new Stmt.Print(new Expr.Literal("true")),
        new Stmt.Print(new Expr.Literal("false"))
      )
    ],
    assertion: () => {
      expect(printer.write).toBeCalledWith("false")
    }
  }
])("should interpret if-else statment: $description", ({ statements, assertion }) => {
  interpreter.interpret(statements);
  assertion();
})