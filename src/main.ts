import * as ts from 'typescript';

const sourceFile = ts.createSourceFile(
  'test.ts',
  '',
  ts.ScriptTarget.ES2015,
  true,
  ts.ScriptKind.TS,
);

enum SourceState {
  root,
  declareGlobal,
}

let elementName: string | undefined;
let elementType: string | undefined;
let state = SourceState.root;

function isIdentifierWithName(node: ts.Node, value: string): boolean {
  return ts.isIdentifier(node) && node.getText() === value;
}

function isTypeReferenceWithName(node: ts.Node, value: string): boolean {
  return (
    ts.isTypeReferenceNode(node) && isIdentifierWithName(node.typeName, value)
  );
}

function getCustomElementName(decorators: ts.Decorator[]): string | null {
  for (const decorator of decorators) {
    const { expression } = decorator;
    if (
      ts.isCallExpression(expression) &&
      isIdentifierWithName(expression, 'customElement')
    ) {
      if (!expression.arguments.length) {
        return null;
      }
      const firstArg = expression.arguments[0];
      if (!ts.isStringLiteral(firstArg)) {
        return null;
      }
      return firstArg.text;
    }
  }
  return null;
}

const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (
  rootNode: T,
) => {
  function visit(node: ts.Node): ts.Node {
    switch (state) {
      case SourceState.root: {
        if (ts.isClassDeclaration(node) && node.decorators) {
          const customElementName = getCustomElementName([...node.decorators]);
          if (customElementName) {
            elementName = customElementName;
            elementType = node.name;
          }
          return node;
        }
        if (
          ts.isModuleDeclaration(node) &&
          node.modifiers &&
          node.modifiers[0].kind === ts.SyntaxKind.DeclareKeyword &&
          isIdentifierWithName(node.name, 'global')
        ) {
          state = SourceState.declareGlobal;
        }
      }
      case SourceState.declareGlobal: {
        // Search for `interface HTMLElementTagNameMap`.
        if (
          ts.isInterfaceDeclaration(node) &&
          isIdentifierWithName(node.name, 'HTMLElementTagNameMap')
        ) {
          let declared = false;
          for (const member of node.members) {
            if (
              !ts.isPropertySignature(member) ||
              !member.type ||
              !isIdentifierWithName(member.name, elementName) ||
              isTypeReferenceWithName(member.type, elementType)
            ) {
              continue;
            }
            declared = true;
          }
          console.log(' find ', declared);
          if (declared) {
            return node;
          }
          const propSig = ts.createPropertySignature(
            undefined,
            ts.createStringLiteral(elementName),
            undefined,
            ts.createTypeReferenceNode(
              ts.createIdentifier(elementType),
              undefined,
            ),
            undefined,
          );

          return ts.createInterfaceDeclaration(
            node.decorators,
            node.modifiers,
            node.name,
            node.typeParameters,
            node.heritageClauses,
            [...node.members, propSig],
          );
        }
      }
    }
    return ts.visitEachChild(node, visit, context);
  } // end of visit func.
  return ts.visitNode(rootNode, visit);
};

const result = ts.transform(sourceFile, [transformer]);

const printer: ts.Printer = ts.createPrinter();
const transformedSourceFile = result.transformed[0] as ts.SourceFile;
console.log(printer.printFile(transformedSourceFile));
result.dispose();
