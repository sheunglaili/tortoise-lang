export interface Printer {
  write(line: string): void
}

export class PassThroughtPrinter implements Printer {

  callback: ((line: string) => void)

  constructor(callback: ((line: string) => void) = () => {
    // default empty function
  }) {
    this.callback = callback;
  }

  onWrite(callback: (line: string) => void): void {
    this.callback = callback
  }

  write(line: string): void {
    this.callback(line);
  }
}