import { Token } from 'tortoise/token';

export abstract class Expr {
  abstract accept<R>(visitor: Expr.Visitor<R>): R;
}

export namespace Expr {
  export interface Visitor<R> {
    visitAssignExpr(expr: Expr.Assign): R;
    visitBinaryExpr(expr: Expr.Binary): R;
    visitGroupingExpr(expr: Expr.Grouping): R;
    visitLiteralExpr(expr: Expr.Literal): R;
    visitUnaryExpr(expr: Expr.Unary): R;
    visitVariableExpr(expr: Expr.Variable): R;
  }

  export class Assign extends Expr {
    readonly name: Token;
    readonly value: Expr;

    constructor(name: Token, value: Expr) {
      super();
      this.name = name;
      this.value = value;
    }

    override accept<R>(visitor: Expr.Visitor<R>): R {
      return visitor.visitAssignExpr(this);
    }
  }
  export class Binary extends Expr {
    readonly left: Expr;
    readonly operator: Token;
    readonly right: Expr;

    constructor(left: Expr, operator: Token, right: Expr) {
      super();
      this.left = left;
      this.operator = operator;
      this.right = right;
    }

    override accept<R>(visitor: Expr.Visitor<R>): R {
      return visitor.visitBinaryExpr(this);
    }
  }
  export class Grouping extends Expr {
    readonly express: Expr;

    constructor(express: Expr) {
      super();
      this.express = express;
    }

    override accept<R>(visitor: Expr.Visitor<R>): R {
      return visitor.visitGroupingExpr(this);
    }
  }
  export class Literal extends Expr {
    readonly value: any;

    constructor(value: any) {
      super();
      this.value = value;
    }

    override accept<R>(visitor: Expr.Visitor<R>): R {
      return visitor.visitLiteralExpr(this);
    }
  }
  export class Unary extends Expr {
    readonly operator: Token;
    readonly right: Expr;

    constructor(operator: Token, right: Expr) {
      super();
      this.operator = operator;
      this.right = right;
    }

    override accept<R>(visitor: Expr.Visitor<R>): R {
      return visitor.visitUnaryExpr(this);
    }
  }
  export class Variable extends Expr {
    readonly name: Token;

    constructor(name: Token) {
      super();
      this.name = name;
    }

    override accept<R>(visitor: Expr.Visitor<R>): R {
      return visitor.visitVariableExpr(this);
    }
  }
}
