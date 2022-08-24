import { BinaryExpression, Block, Expression, Identifier, Node, ScriptTarget, SourceFile, SyntaxKind, createSourceFile, forEachChild } from 'typescript';
import { existsSync, readFileSync } from 'fs';

import { getNodeName } from '../utils/name';
import { isFunctionWithBody } from 'tsutils';

const isIdentifier = (kind: SyntaxKind) => kind === SyntaxKind.Identifier;
const isLiteral = (kind: SyntaxKind) =>
    kind >= SyntaxKind.FirstLiteralToken &&
    kind <= SyntaxKind.LastLiteralToken;

const isToken = (kind: SyntaxKind) =>
    kind >= SyntaxKind.FirstPunctuation &&
    kind <= SyntaxKind.LastPunctuation;

const isKeyword = (kind: SyntaxKind) =>
    kind >= SyntaxKind.FirstKeyword &&
    kind <= SyntaxKind.LastKeyword;

const isAnOperator = (node: Node) => isToken(node.kind) || isKeyword(node.kind);
const isAnOperand = (node: Node) => isIdentifier(node.kind) || isLiteral(node.kind);

const getOperatorsAndOperands = (node) => {
    const output = {
        operators: { total: 0, _unique: new Set<string>([]), unique: 0 },
        operands: { total: 0, _unique: new Set<string>([]), unique: 0 },
    };

    forEachChild(node, function cb(currentNode: Node) {
        if (isAnOperand(currentNode)) {
            output.operands.total++;
            output.operands._unique.add(((currentNode as Identifier).text || (currentNode as Identifier).escapedText) as string);
        } else if (isAnOperator(currentNode)) {
            output.operators.total++;
            // TODO: Operator seems like no text property
            output.operators._unique.add(((currentNode as any).text || currentNode.kind) as never);
        }
        forEachChild(currentNode, cb);
    });

    output.operands.unique = output.operands._unique.size;
    output.operators.unique = output.operators._unique.size;

    // @ts-ignore
    output.operators._unique = Array.from(output.operators._unique);
    // @ts-ignore
    output.operands._unique = Array.from(output.operands._unique);

    return output;
};

const getHalsteadForNode = (node) => {
    if (isFunctionWithBody(node)) {
        const { operands, operators } = getOperatorsAndOperands(node);
        const length = operands.total + operators.total;
        const vocabulary = operands.unique + operators.unique;

        // If legnth is 0, all other values will be NaN
        if (length === 0 || vocabulary === 1) return {};

        const volume = length * Math.log2(vocabulary);
        const difficulty = (operators.unique / 2) * (operands.total / operands.unique);
        const effort = volume * difficulty;
        const time = effort / 18;
        const bugsDelivered = (effort ** (2 / 3)) / 3000;

        return {
            length,
            vocabulary,
            volume,
            difficulty,
            effort,
            time,
            bugsDelivered,
            operands,
            operators,
        };
    }
    return {};
};


export const getHalsteadForSource = (ctx) => {
    const output = {};
    forEachChild(ctx, function cb(node) {
        if (isFunctionWithBody(node)) {
            const name = getNodeName(node);
            output[name] = getHalsteadForNode(node);
        }
        forEachChild(node, cb);
    });
    return output;
};

export const getHalsteadForFile = (filePath: string, target: ScriptTarget) => {
    if (!existsSync(filePath)) {
        throw new Error(`File "${filePath}" does not exists`);
    }
    const sourceText = readFileSync(filePath).toString();
    const source = createSourceFile(filePath, sourceText, target);
    return getHalsteadForSource(source);
};