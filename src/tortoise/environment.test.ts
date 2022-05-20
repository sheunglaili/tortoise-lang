import { Environment } from "tortoise/environment"
import { RuntimeError } from "./error";
import { Token, TokenType } from "./token";


test("should be able to define and retrieve value", () => {
  const environment = new Environment();

  environment.define("values", 123);

  expect(environment.get(new Token(
    TokenType.IDENTIFIER,
    "values",
    null,
    1
  ))).toEqual(123);
});

test("should be able to re-define the variable with same name", () => {
  const environment = new Environment();

  environment.define("values", 123);
  environment.define("values", 456);

  expect(environment.get(
    new Token(
      TokenType.IDENTIFIER,
      "values",
      null,
      1
    )
  )).toEqual(456);
});

test("should be able to assign to existing variable", () => {
  const environment = new Environment();

  environment.define("hello", "world");
  const token = new Token(
    TokenType.IDENTIFIER,
    "hello",
    null,
    1
  );
  environment.assign(token, "tortoise");

  expect(environment.get(token)).toEqual("tortoise");
})

test("should throw runtime error when assigning to undefined variable", () => {
  const environment = new Environment();

  const undefinedToken = new Token(
    TokenType.IDENTIFIER,
    "nothing",
    null,
    1
  )

  expect(() => environment.assign(undefinedToken, 123))
    .toThrowError(new RuntimeError(undefinedToken, "Undefined variable 'nothing'."));
});

test("should throw runtime error when accessing undefined variable", () => {
  const environment = new Environment();

  const undefinedToken = new Token(
    TokenType.IDENTIFIER,
    "notExisted",
    null,
    1
  )

  expect(() => environment.get(undefinedToken))
    .toThrowError(new RuntimeError(undefinedToken, "Undefined variable 'notExisted'."));
});

test("should assign to enclosing scope variable if not found in currenct scope", () => {
  const enclosing = new Environment();
  enclosing.define("hello", 1);
  const env = new Environment(enclosing);

  const token = new Token(TokenType.VAR, "hello", null, 1);

  env.assign(token, 2);

  expect(enclosing.get(token)).toEqual(2);
});

test("should retrive enclosing scope variable if not found in current scope", () => {
  const enclosing = new Environment();
  enclosing.define("hello", 2);
  const env = new Environment(enclosing);

  const token = new Token(TokenType.VAR, "hello", null, 1);
  
  expect(env.get(token)).toEqual(2);
});

