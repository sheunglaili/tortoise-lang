import { AstPrinter } from "tortoise/ast_printer";
import { Expr } from "./expr";
import { Token, TokenType } from "./token";

const printer = new AstPrinter()

test.each([
  { input: "string", output: "string" },
  { input: 123, output: "123" },
  { input: true, output: "true" },
  { input: false, output: "false" }
])("should printer literal expression", ({ input, output }) => {
  const literal: Expr.Literal = new Expr.Literal(input);

  expect(printer.print(literal)).toEqual(`${output}`)
})

test.each([
  {
    input: new Expr.Literal("string"),
    output: "string"
  },
  {
    input: new Expr.Literal(123),
    output: "123"
  },
  {
    input: new Expr.Literal(true),
    output: "true"
  },
  {
    input: new Expr.Literal(false),
    output: "false"
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Literal(123)
    ),
    output: '(- 123)'
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.MINUS, "-", null, 1),
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(123)
      )
    ),
    output: '(- (- 123))'
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.BANG, "!", null, 1),
      new Expr.Literal(true)
    ),
    output: '(! true)'
  },
  {
    input: new Expr.Unary(
      new Token(TokenType.BANG, "!", null, 1),
      new Expr.Unary(
        new Token(TokenType.BANG, "!", null, 1),
        new Expr.Literal(true)
      )
    ),
    output: '(! (! true))'
  },
  {
    input: new Expr.Binary(
      new Expr.Literal(123),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Literal(456),
    ),
    output: '(* 123 456)'
  },
  {
    input: new Expr.Grouping(
      new Expr.Literal(123)
    ),
    output: '(group 123)'
  }
])("should print $output", ({ input, output }) => {
  expect(printer.print(input)).toEqual(output)
})