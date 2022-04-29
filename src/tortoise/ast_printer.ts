import { Expr } from "tortoise/expr";

export class AstPrinter implements Expr.Visitor<string> {
  visitAssignExpr(expr: Expr.Assign): string {
    throw new Error("Method not implemented.");
  }
  visitVariableExpr(expr: Expr.Variable): string {
    throw new Error("Method not implemented.");
  }
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthesize(
      expr.operator.lexeme,
      expr.left,
      expr.right
    );
  }
  visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize(
      "group", expr.express
    )
  }
  visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value == null) return "nil";
    return `${expr.value}`;
  }
  visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(
      expr.operator.lexeme,
      expr.right
    );
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    let str = `(${name}`;

    for (const expr of exprs) {
      str = str.concat(" ")
        .concat(expr.accept(this));
    }
    str = str.concat(")");
    return str;
  }
}