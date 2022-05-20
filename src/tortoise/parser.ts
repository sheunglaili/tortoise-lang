import { Token, TokenType } from "tortoise/token";
import { Expr } from "tortoise/expr";
import { Monitor } from "tortoise/monitor";
import { ParserError } from "tortoise/error";
import { Stmt } from "./stmt";

/**
 * Complete Statement gramner
 * program        → declaration* EOF ;
 * declaration    → varDecl | statement ;
 * varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
 * statement      → exprStmt | ifStmt | printStmt | block ;
 * ifStmt         → "if" "(" expression ")" statement ( "else" statement )?;
 * block          → "{" declaration* "}"
 * exprStmt       → expression ";" ;
 * printStmt      → "print" expression ";" ;
 * 
 * Complete Expression grammer
 * 
 * expression     → assignment ;
 * assignment     → IDENTIFIER "=" assignment | equality ;
 * equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 * term           → factor ( ( "-" | "+" ) factor )* ;
 * factor         → unary ( ( "/" | "*" ) unary )* ;
 * unary          → ( "!" | "-" ) unary | primary ;
 * primary        → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" | IDENTIFIER ;
 * ------------------------------------------------------
 * Grammar notation |	Code representation
 * ------------------------------------------------------
 * Terminal	        | Code to match and consume a token
 * ------------------------------------------------------
 * Nonterminal	    | Call to that rule’s function
 * ------------------------------------------------------
 * |	              | if or switch statement
 * ------------------------------------------------------
 * * or +	          | while or for loop
 * ------------------------------------------------------
 * ?	              | if statement
 * ------------------------------------------------------
 * 
 * Given a valid sequence of tokens, produce a corresponding syntax tree.
 * Given an invalid sequence of tokens, detect any errors and tell the user about their mistakes.
 */
export class Parser {
  private readonly tokens: Token[];
  private current: number;
  private monitor: Monitor

  constructor(tokens: Token[], monitor: Monitor) {
    this.tokens = tokens;
    this.current = 0;

    this.monitor = monitor;
  }

  /**
   * equality       → comparison ( ( "!=" | "==" ) comparison )*
   * @returns {Expr}
   */
  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
   * @returns {Expr} 
   */
  private comparison(): Expr {
    let expr = this.term();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * term           → factor ( ( "-" | "+" ) factor )* ;
   * @returns {Expr}
   */
  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   * factor         → unary ( ( "/" | "*" ) unary )* ;
   * @returns {Expr}
   */
  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  /**
   *  unary          → ( "!" | "-" ) unary | primary ;
   * @returns {Expr}
   */
  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }

  /**
   * primary        → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" | IDENTIFIER ;
   * @returns {Expr}
   */
  private primary(): Expr {
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
    if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
    if (this.match(TokenType.NIL)) return new Expr.Literal(null);

    if (this.match(TokenType.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    throw this.error(this.peek(), "Unknown expressions.");
  }

  private assignment(): Expr {
    const expr = this.equality();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Expr.Variable) {
        const name = expr.name;
        return new Expr.Assign(name, value)
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private expression(): Expr {
    return this.assignment();
  }

  private block(): Stmt {
    const statements: Stmt[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const declaration = this.declaration();
      if (declaration) statements.push(declaration);
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return new Stmt.Block(statements);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Stmt.Expression(expr);
  }

  private printStatement(): Stmt {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private ifStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition: Expr = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch = this.statement();
    const elseBracnch = this.match(TokenType.ELSE) 
      ? this.statement()
      : null;
    
    return new Stmt.If(condition, thenBranch, elseBracnch);
  }

  private statement(): Stmt {
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.LEFT_BRACE)) return this.block();

    return this.expressionStatement();
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    const initializer = this.match(TokenType.EQUAL) ? this.expression() : null;

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Stmt.Var(name, initializer);
  }

  private declaration(): Stmt | null {
    try {
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      return this.statement()
    } catch (err) {
      if (err instanceof ParserError) {
        this.synchronize();
      }
      return null;
    }
  }

  private error(token: Token, message: string): Error {
    this.monitor.error(token, message);
    return new ParserError();
  }

  /**
   * Discards tokens until it thinks it has found a statement boundary
   * Called when catching a ParseError and discard token that may cause cascade error.
   * Hopefully will be back on track
   */
  private synchronize(): void {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNC:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  /**
   * Checks to see if the next token is of the expected type.
   * If so, it consumes the token.
   * @param type 
   * @param message 
   * @returns {Token}
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  /**
   * Returns the most recently consumed token
   * Makes it easier to use match() and then access the just-matched token
   * @returns {Token}
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }
  /**
   * Returns the current token we have yet to consume
   * @returns {Token}
   */
  private peek(): Token {
    return this.tokens[this.current];
  }
  /**
   * Checks if we’ve run out of tokens to parse
   * @returns {boolean}
   */
  private isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }
  /**
   * Consumes the current token and returns it
   * @returns {Token}
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  /**
   * Returns true if the current token is of the given type. 
   * Unlike match(), it never consumes the token, it only looks at it
   * @param type 
   * @returns 
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  /**
   * Checks to see if the current token has any of the given types. 
   * If so, it consumes the token and returns true. 
   * Otherwise, it returns false and leaves the current token alone
   * @param types 
   * @returns 
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  public parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
    }

    return statements;
  }
}