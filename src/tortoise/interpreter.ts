import { Expr } from "tortoise/expr";
import { Environment } from "./environment";
import { RuntimeError } from "./error";
import { Monitor } from "./monitor";
import { Printer } from "./printer";
import { Stmt } from "./stmt";
import { Token, TokenType } from "./token";

export class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {

  private readonly monitor: Monitor;
  private readonly printer: Printer;
  private readonly environment: Environment;

  constructor(monitor: Monitor, printer: Printer) {
    this.monitor = monitor;
    this.printer = printer;
    this.environment = new Environment();
  }
  visitAssignExpr(expr: Expr.Assign) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }
  visitVariableExpr(expr: Expr.Variable) {
    return this.environment.get(expr.name);
  }
  visitVarStmt(stmt: Stmt.Var): void {
    const value = stmt.initializer != null ? this.evaluate(stmt.initializer) : null;
    this.environment.define(stmt.name.lexeme, value);
  }
  visitLiteralStmt(stmt: Stmt.Literal): void {
    throw new Error("Method not implemented.");
  }
  visitUnaryStmt(stmt: Stmt.Unary): void {
    throw new Error("Method not implemented.");
  }
  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
  }
  visitPrintStmt(stmt: Stmt.Print): void {
    const value = this.evaluate(stmt.expression);
    this.printer.write(`${value}`);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  private checkNumberOperand(operator: Token, right: Expr): void {
    if (typeof right == "number") return;
    throw new RuntimeError(
      operator,
      "Operand must be number."
    )
  }

  private checkoutNumberOperands(operator: Token, left: Expr, right: Expr): void {
    if (typeof left == "number" && typeof right == "number") return;
    throw new RuntimeError(
      operator,
      "Operands must be numbers."
    )
  }

  private isTruthy(value: any): boolean {
    if (!value) return false;
    if (value instanceof Boolean || typeof value == "boolean") return value as boolean;
    return true;
  }

  visitBinaryExpr(expr: Expr.Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    // using js rule for now
    switch (expr.operator.type) {
      case TokenType.PLUS: {
        if (typeof left == "number" && typeof right == "number") {
          return left + right;
        } else if (typeof left == "string" && typeof right == "string") {
          return left + right
        }
        throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
      }
      case TokenType.MINUS:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenType.SLASH:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left / right;
      case TokenType.STAR:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left * right;
      case TokenType.GREATER:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkoutNumberOperands(expr.operator, left, right);
        return left <= right;
      case TokenType.EQUAL:
        return left == right;
      case TokenType.BANG_EQUAL:
        return left != right;
    }
    // unreachable, guarded by parser
  }
  visitGroupingExpr(expr: Expr.Grouping) {
    return this.evaluate(expr.express);
  }
  visitLiteralExpr(expr: Expr.Literal) {
    return expr.value;
  }
  visitUnaryExpr(expr: Expr.Unary) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
      case TokenType.BANG:
        return !this.isTruthy(right);
    }

    // unreachable, guarded by parser
  }

  public interpret(statements: Stmt[]): any {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (err) {
      if (err instanceof RuntimeError) {
        this.monitor.runtimeError(err);
      }
    }
  }
}