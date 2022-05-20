import React, { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import Split from 'react-split'
import Tortoise, { PassThroughtPrinter } from '../tortoise';

function App() {
  // TODO: come up with a better way to do template literal
  const [code, setCode] = useState(
    "// Your first Tortoise program!\
    \nprint \"Hello, world!\";\
    \n\
    \n// data types \
    \n\"abc\"; // string\
    \n123; // number\
    \n\
    \n// variable definition\
    \nvar a = 123;\
    \n\
    \n// binary operator\
    \na == 2;\
    \na != 2;\
    \na >= 2;\
    \na <= 2;\
    \n\
    \n// logical operator\
    \na and 2;\
    \na or 2;\
    \n\
    \n// control-flow\
    \nif (a == 2) {\
    \n  print \"a equals 2!\";\
    \n} else {\
    \n  print \"a not equals 2!\";\
    \n}\
    \n\
    \n// while-loop\
    \nvar b = 0;\
    \nwhile (b < 3) {\
    \n  print b;\
    \n  b = b + 1;\
    \n}\
    \n\
    \n// for-loop\
    \nfor (var i = 0; i < 10; i = i + 1) {\
    \n   print i;\
    \n}\
    "
  );
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
          setCode(newCode);
        }}
      />
      <div
        style={{
          whiteSpace: 'pre-line',
          display: 'flex',
          flexDirection: 'column'
        }}>
        <div style={{
          display: 'flex'
        }}>
          <button onClick={() => {
            setOutputs([]);
            tortoise.run(code);
          }}>
              Run !
          </button>
        </div> 
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
