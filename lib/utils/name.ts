import { Node, isIdentifier } from 'typescript';

export const getNodeName =  (node: Node) => {
    // @ts-ignore
    const { name = undefined, pos, end } = node;
    const key =
        (name !== undefined && isIdentifier(name))
            ? name.text
            : JSON.stringify({ pos, end });
    return key;
};