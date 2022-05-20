import { resolve } from "path";
import * as fs from "fs";

class GenerateAst {
  public run(outDir: string) {
    this.defineAst(
      outDir,
      "Expr",
      [
        "Assign   : name: Token, value: Expr",
        "Binary   : left: Expr, operator: Token, right: Expr",
        "Grouping : express: Expr",
        "Literal  : value: any",
        "Logical  : left: Expr, operator: Token, right: Expr",
        "Unary    : operator: Token, right: Expr",
        "Variable : name: Token",
      ],
      ["import { Token } from 'tortoise/token';"]
    );

    this.defineAst(
      outDir,
      "Stmt",
      [
        "Block      : statments: Stmt[]",
        "Expression : expression: Expr",
        "If         : condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null",
        "Print      : expression: Expr",
        "Var        : name: Token, initializer: Expr | null",
        "While      : condition: Expr, body: Stmt"
      ],
      [
        "import { Token } from 'tortoise/token';",
        "import { Expr } from 'tortoise/expr';"
      ]
    );
  }

  private defineAst(
    outDir: string,
    baseName: string,
    types: string[],
    importStatements: string[] = []
  ) {
    const path = resolve(__dirname, outDir, `${baseName.toLowerCase()}.ts`);
    const writer = fs.createWriteStream(path);

    for (const importStatement of importStatements) {
      writer.write(`${importStatement}\n`);
    }
    writer.write(`\n`);

    writer.write(`export abstract class ${baseName} {\n`);
    writer.write(`  abstract accept<R>(visitor: ${baseName}.Visitor<R>): R;\n`);
    writer.write(`}\n`);
    writer.write(`\n`);

    writer.write(`export namespace ${baseName} {\n`);
    this.defineVisitor(writer, baseName, types);
    writer.write(`\n`);
    for (const type of types) {
      const indexOfFirstColon = type.indexOf(":");
      const className = type.substring(0, indexOfFirstColon).trim();
      const fields = type.substring(indexOfFirstColon + 1, type.length).trim();
      this.defineType(writer, baseName, className, fields);
    }
    writer.write(`}\n`);
  }

  private defineType(
    writer: fs.WriteStream,
    baseName: string,
    className: string,
    fields: string
  ) {
    // signature
    writer.write(`  export class ${className} extends ${baseName} {\n`);

    const fieldList = fields.split(",");
    // fields
    for (const field of fieldList) {
      writer.write(`    readonly ${field.trim()};\n`);
    }
    writer.write("\n");

    // constructor
    writer.write(`    constructor(${fields}) {\n`);
    writer.write(`      super();\n`);
    for (const field of fieldList) {
      const name = field.split(":")[0].trim();
      writer.write(`      this.${name} = ${name};\n`);
    }
    writer.write(`    }\n`);

    writer.write("\n");
    writer.write(
      `    override accept<R>(visitor: ${baseName}.Visitor<R>): R {\n`
    );
    writer.write(`      return visitor.visit${className}${baseName}(this);\n`);
    writer.write("    }\n");

    writer.write(`  }\n`);
  }

  private defineVisitor(
    writer: fs.WriteStream,
    baseName: string,
    types: string[]
  ) {
    writer.write(`  export interface Visitor<R> {\n`);
    for (const type of types) {
      const typeName: string = type.substring(0, type.indexOf(":")).trim();
      writer.write(
        `    visit${typeName}${baseName}(${baseName.toLowerCase()}: ${baseName}.${typeName}): R;\n`
      );
    }
    writer.write(`  }\n`);
  }
}

const astGen = new GenerateAst();
astGen.run(process.argv[2]);
