# react-compiler-bug

## How to run

```bash
# Install dependencies:
npm install
# Install dependencies:
node ./index.js
```

## Description

If a nested method shorthand syntax is used in a component that returns an arrow function, it will prevent React's compiler optimizations. However, if the arrow function is used directly, the optimizations work as expected.

## The Problem

The `returnsNonNode(...)` ffunction detects the return type of nested functions incorrectly, causing the compiler to mistakenly interpret them as non-Component functions.

[Link for code](https://github.com/facebook/react/blob/7b7fac073d1473df839a1caf8d0444c32bf4de49/compiler/packages/babel-plugin-react-compiler/src/Entrypoint/Program.ts#L968)

```ts
function returnsNonNode(
  node: NodePath<
    t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression
  >,
): boolean {
  let hasReturn = false;
  let returnsNonNode = false;

  node.traverse({
    ReturnStatement(ret) {
      hasReturn = true;
      const argument = ret.node.argument;
      if (argument == null) {
        returnsNonNode = true;
      } else {
        switch (argument.type) {
          case 'ObjectExpression':
          case 'ArrowFunctionExpression':
          case 'FunctionExpression':
          case 'BigIntLiteral':
          case 'ClassExpression':
          case 'NewExpression': // technically `new Array()` is legit, but unlikely
            returnsNonNode = true;
        }
      }
    },
    ArrowFunctionExpression: skipNestedFunctions(node),
    FunctionExpression: skipNestedFunctions(node),
    FunctionDeclaration: skipNestedFunctions(node),
  });

  return !hasReturn || returnsNonNode;
}
```

## Example

```jsx
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
```
