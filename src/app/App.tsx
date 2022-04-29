import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import Split from 'react-split'
import Tortoise, { PassThroughtPrinter } from '../tortoise';

function App() {
  const [code, setCode] = useState(`// Your first Lox program!\nprint "Hello, world!";`);
  const [outputs, setOutputs] = useState<string[]>([]);

  const tortoise = useMemo(() => {
    const printer = new PassThroughtPrinter((line) => {
      setOutputs((outputs) => [...outputs, line])
    });
    return new Tortoise(printer);
  }, []);

  return (
    <Split
      style={{ display: 'flex', flexDirection: 'row' }}
      sizes={[50, 50]}
      minSize={300}
      expandToMin={false}
      gutterSize={50}
      gutterAlign="center"
      gutterStyle={() => ({
        backgroundColor: '#eee',
        backgroundImage: 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==\')',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50%',
        width: '10px'
      })}
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
      onDrag={() => console.log('drag')}
    >
      <CodeMirror
        height='100vh'
        value={code}
        onChange={(newCode) => {
          setOutputs([]);
          tortoise.run(newCode)
        }}
      />
      <div
        style={{
          whiteSpace: 'pre-line',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {outputs.map((output) => (
          <div>
            {output}
          </div>
        ))}
      </div>
    </Split >

  );
}

export default App;
