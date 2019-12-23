import * as ts from 'typescript';
const htmlElementTagNameMap = 'HTMLElementTagNameMap';

// If we find nothing to be added to this file during AST walking,
// we will throw this error.
class TerminationError extends Error {}

function getIdentifierName(node: ts.Node): string | null {
  if (ts.isIdentifier(node)) {
    return node.getText();
  }
  return null;
}

function getStringLiteral(node: ts.Node): string | null {
  if (ts.isStringLiteral(node)) {
    return node.text;
  }
  return null;
}

function isHTMLElementTagNameMap(
  node: ts.Node,
): node is ts.InterfaceDeclaration {
  return (
    ts.isInterfaceDeclaration(node) &&
    getIdentifierName(node.name) === htmlElementTagNameMap
  );
}

function getTypeReferenceName(node: ts.Node): string | null {
  if (ts.isTypeReferenceNode(node)) {
    return getIdentifierName(node.typeName);
  }
  return null;
}

function getCustomElementName(decorators: ts.Decorator[]): string | null {
  for (const decorator of decorators) {
    const { expression } = decorator;
    if (
      ts.isCallExpression(expression) &&
      getIdentifierName(expression.expression) === 'customElement'
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

function createInterfaceDeclaration(
  node: ts.InterfaceDeclaration | undefined,
  name: ts.Identifier,
  members: readonly ts.TypeElement[],
): ts.InterfaceDeclaration {
  return ts.createInterfaceDeclaration(
    node?.decorators,
    node?.modifiers,
    name,
    node?.typeParameters,
    node?.heritageClauses,
    members,
  );
}

// Gets property name and type from `ts.TypeElement`.
function getPropertyEntryFromTypeElement(
  element: ts.TypeElement,
): [string | null, string | null] {
  if (ts.isPropertySignature(element) && element.type) {
    return [getStringLiteral(element.name), getTypeReferenceName(element.type)];
  }
  return [null, null];
}

function setTagsToHTMLElementTagNameMap(
  tags: Map<string, string>,
  node: ts.InterfaceDeclaration,
): ts.InterfaceDeclaration {
  const members = [...node.members];
  for (const [elementName, elementType] of tags.entries()) {
    let declared = false;
    for (const member of node.members) {
      const [propName, propType] = getPropertyEntryFromTypeElement(member);
      if (propName !== elementName || propType !== elementType) {
        continue;
      }
      declared = true;
      break;
    }
    if (declared) {
      return node;
    }
    const propSig = ts.createPropertySignature(
      undefined,
      ts.createStringLiteral(elementName),
      undefined,
      ts.createTypeReferenceNode(ts.createIdentifier(elementType), undefined),
      undefined,
    );
    members.push(propSig);
  }
  return createInterfaceDeclaration(node, node.name, members);
}

function createInterfaceDeclarationWithTags(
  tags: Map<string, string>,
): ts.InterfaceDeclaration {
  // Create an empty interface declaration.
  const interfaceDec = createInterfaceDeclaration(
    undefined,
    ts.createIdentifier(htmlElementTagNameMap),
    [],
  );
  // Set tags properties.
  return setTagsToHTMLElementTagNameMap(tags, interfaceDec);
}

function isGlobalModule(node: ts.Node): node is ts.ModuleDeclaration {
  return (
    ts.isModuleDeclaration(node) &&
    !!node.modifiers &&
    node.modifiers[0].kind === ts.SyntaxKind.DeclareKeyword &&
    getIdentifierName(node.name) === 'global' &&
    !!node.body &&
    ts.isModuleBlock(node.body)
  );
}

function createModuleDeclaration(
  statements: ts.Statement[],
): ts.ModuleDeclaration {
  return ts.createModuleDeclaration(
    undefined,
    [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
    ts.createIdentifier('global'),
    ts.createModuleBlock(statements),
    ts.NodeFlags.ExportContext |
      ts.NodeFlags.GlobalAugmentation |
      ts.NodeFlags.ContextFlags,
  );
}

export default function convert(
  src: string,
  scriptTarget: ts.ScriptTarget,
): string | null {
  try {
    const sourceFile = ts.createSourceFile(
      'src.ts',
      src,
      scriptTarget,
      true,
      ts.ScriptKind.TS,
    );

    // Whether `declare global` block has been found.
    let declareGlobalFound = false;
    // Whether `interface HTMLElementTagNameMap` has been found.
    let elementTagMapFound = false;
    const tags = new Map<string, string>();
    for (const st of sourceFile.statements) {
      if (ts.isClassDeclaration(st) && st.decorators) {
        const customElementName = getCustomElementName([...st.decorators]);
        if (customElementName && st.name) {
          const elementName = customElementName;
          const elementType = st.name.getText();
          tags.set(elementName, elementType);
        }
      } else if (isGlobalModule(st)) {
        declareGlobalFound = true;
      }
    }

    if (!tags.size) {
      return null;
    }

    const transformer = <T extends ts.Node>(
      context: ts.TransformationContext,
    ) => (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        if (!declareGlobalFound && ts.isSourceFile(node)) {
          const interfaceDec = createInterfaceDeclarationWithTags(tags);
          const moduleDec = createModuleDeclaration([interfaceDec]);
          return ts.updateSourceFileNode(sourceFile, [
            ...sourceFile.statements,
            moduleDec,
          ]);
        }
        if (declareGlobalFound && isGlobalModule(node)) {
          declareGlobalFound = true;
          // Checks if `declare global` contains any `HTMLElementTagNameMap` block.
          const { statements } = node.body as ts.ModuleBlock;
          const tagNameDec = statements.find(isHTMLElementTagNameMap);
          elementTagMapFound = !!tagNameDec;
          // If no `HTMLElementTagNameMap` found, create a new one here.
          if (!tagNameDec) {
            const interfaceDec = createInterfaceDeclarationWithTags(tags);
            return createModuleDeclaration([...statements, interfaceDec]);
          } else {
            // Remove all tags that already exist in `HTMLElementTagNameMap`.
            for (const member of tagNameDec.members) {
              const [propName, propType] = getPropertyEntryFromTypeElement(
                member,
              );
              if (propName && propType) {
                if (tags.get(propName) === propType) {
                  tags.delete(propName);

                  // If all tags are defined, terminate the whole process.
                  if (!tags.size) {
                    throw new TerminationError();
                  }
                }
              }
            }
          }
        }
        // If `elementTagMapFound` then we are searching for `HTMLElementTagNameMap` block.
        if (elementTagMapFound && isHTMLElementTagNameMap(node)) {
          return setTagsToHTMLElementTagNameMap(
            tags,
            node as ts.InterfaceDeclaration,
          );
        }
        return ts.visitEachChild(node, visit, context);
      } // end of visit func.
      return ts.visitNode(rootNode, visit);
    };

    const result = ts.transform(sourceFile, [transformer]);
    const printer: ts.Printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });
    const transformedSourceFile = result.transformed[0] as ts.SourceFile;
    const newContent = printer.printFile(transformedSourceFile);
    result.dispose();
    return newContent;
  } catch (err) {
    if (err instanceof TerminationError) {
      return null;
    }
    throw err;
  }
}
