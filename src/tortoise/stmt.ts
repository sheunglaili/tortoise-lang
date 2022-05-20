import { Token } from 'tortoise/token';
import { Expr } from 'tortoise/expr';

export abstract class Stmt {
  abstract accept<R>(visitor: Stmt.Visitor<R>): R;
}

export namespace Stmt {
  export interface Visitor<R> {
    visitBlockStmt(stmt: Stmt.Block): R;
    visitExpressionStmt(stmt: Stmt.Expression): R;
    visitIfStmt(stmt: Stmt.If): R;
    visitPrintStmt(stmt: Stmt.Print): R;
    visitVarStmt(stmt: Stmt.Var): R;
    visitLiteralStmt(stmt: Stmt.Literal): R;
    visitUnaryStmt(stmt: Stmt.Unary): R;
  }

  export class Block extends Stmt {
    readonly statments: Stmt[];

    constructor(statments: Stmt[]) {
      super();
      this.statments = statments;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitBlockStmt(this);
    }
  }
  export class Expression extends Stmt {
    readonly expression: Expr;

    constructor(expression: Expr) {
      super();
      this.expression = expression;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitExpressionStmt(this);
    }
  }
  export class If extends Stmt {
    readonly condition: Expr;
    readonly thenBranch: Stmt;
    readonly elseBranch: Stmt | null;

    constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
      super();
      this.condition = condition;
      this.thenBranch = thenBranch;
      this.elseBranch = elseBranch;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitIfStmt(this);
    }
  }
  export class Print extends Stmt {
    readonly expression: Expr;

    constructor(expression: Expr) {
      super();
      this.expression = expression;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitPrintStmt(this);
    }
  }
  export class Var extends Stmt {
    readonly name: Token;
    readonly initializer: Expr | null;

    constructor(name: Token, initializer: Expr | null) {
      super();
      this.name = name;
      this.initializer = initializer;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitVarStmt(this);
    }
  }
  export class Literal extends Stmt {
    readonly value: any;

    constructor(value: any) {
      super();
      this.value = value;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitLiteralStmt(this);
    }
  }
  export class Unary extends Stmt {
    readonly operator: Token;
    readonly right: Expr;

    constructor(operator: Token, right: Expr) {
      super();
      this.operator = operator;
      this.right = right;
    }

    override accept<R>(visitor: Stmt.Visitor<R>): R {
      return visitor.visitUnaryStmt(this);
    }
  }
}
