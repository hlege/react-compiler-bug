import babel from "@babel/core";
import BabelPluginReactCompiler from "babel-plugin-react-compiler";

const code = `
import React from 'react';

const TestContext = React.createContext({});

export function Test() {
    const context = {
        foo: 'fsd',
        testFn() {  // if it is an arrow function its work
            return () => 'test'; // it will break compile if returns an arrow fn 
        },
        bar: 'bar'
    };

    return (
        <TestContext.Provider value={context}>
            <div>Not Compiled </div>
        </TestContext.Provider>
    );
}
`;

const res = babel.transformSync(code, {
  filename: "test.jsx",
  plugins: [
    "@babel/plugin-syntax-jsx",
    [BabelPluginReactCompiler, { target: "19" }],
  ],
});

console.log(res.code);
