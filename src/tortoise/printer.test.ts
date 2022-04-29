import { PassThroughtPrinter } from './printer';

test("should call onWrite when writing to printer", async () => {
  const printer = new PassThroughtPrinter();
  const onWritePromise = new Promise((resolve) => {
    printer.onWrite((msg) => resolve(msg));
  });

  const message = "hello, world";
  printer.write(message);

  await expect(onWritePromise).resolves.toEqual(message);
})