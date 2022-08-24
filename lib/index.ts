import { getCyclomaticComplexityForFile, getHalsteadForFile, getHalsteadForSource, getMaintainabilityForFile } from './api'

import { ScriptTarget } from 'typescript';

export const getMaintainability =
    (filePath: string) => getMaintainabilityForFile(filePath, ScriptTarget.ES2015);

export const getHalstead =
    (filePath: string) => getHalsteadForFile(filePath, ScriptTarget.ES2015);

export const getCyclomaticComplexity =
    (filePath: string) => getCyclomaticComplexityForFile(filePath, ScriptTarget.ES2015);