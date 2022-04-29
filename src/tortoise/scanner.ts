import {  Monitor } from "tortoise/monitor";
import { Token, TokenType } from "tortoise/token";

export class Scanner {
  private readonly monitor: Monitor;
  readonly source: string;
  readonly tokens: Token[];
  readonly keywords: { [keyword: string]: TokenType }
  start: number;
  current: number;
  line: number;

  constructor(source: string, monitor: Monitor) {
    this.source = source;

    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
    this.keywords = {
      "and": TokenType.AND,
      "class": TokenType.CLASS,
      "else": TokenType.ELSE,
      "false": TokenType.FALSE,
      "for": TokenType.FOR,
      "func": TokenType.FUNC,
      "if": TokenType.IF,
      "nil": TokenType.NIL,
      "or": TokenType.OR,
      "print": TokenType.PRINT,
      "return": TokenType.RETURN,
      "super": TokenType.SUPER,
      "this": TokenType.THIS,
      "true": TokenType.TRUE,
      "var": TokenType.VAR,
      "while": TokenType.WHILE
    }

    this.monitor = monitor;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const c: string = this.advance();
    switch (c) {
      case '(': {
        this.addToken(TokenType.LEFT_PAREN);
        break;
      }
      case ')': {
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      }
      case '{': {
        this.addToken(TokenType.LEFT_BRACE);
        break;
      }
      case '}': {
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      }
      case ',': {
        this.addToken(TokenType.COMMA);
        break;
      }
      case '.': {
        this.addToken(TokenType.DOT);
        break;
      }
      case '-': {
        this.addToken(TokenType.MINUS);
        break;
      }
      case '+': {
        this.addToken(TokenType.PLUS);
        break;
      }
      case ';': {
        this.addToken(TokenType.SEMICOLON);
        break;
      }
      case '*': {
        this.addToken(TokenType.STAR);
        break;
      }
      case '!': {
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      }
      case '=': {
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      }
      case '<': {
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      }
      case '>': {
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      }
      case '/': {
        if (this.match('/')) {
          // a comment goes until the end of the line.
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      }
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;
      case '\n':
        this.line++;
        break;
      case '"': {
        this.string();
        break;
      }
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.monitor.error(this.line, "Unexpected character.")
        }
    }
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private string(): void {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.monitor.error(this.line, "Unterminated string.");
      return;
    }

    // The closeing ".
    this.advance();

    const value: string = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      // consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
  }

  private identifier(): void {
    while (this.isAlphaNumberic(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = this.keywords[text];

    this.addToken(type || TokenType.IDENTIFIER);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c == '_';
  }

  private isAlphaNumberic(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private addToken(type: TokenType, literal: any = null) {
    const text: string = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) != expected) return false;

    this.current++;
    return true;
  }

}