const getComments = (text: string) => {
    const singleLineCommentsRegex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
    return text ? (text.match(singleLineCommentsRegex) || []) : [];
};

export const getSloc = (sourceText: string) => {
    const comments = getComments(sourceText);
    for (let i = 0; i < comments.length; i++) {
        const aMatched = comments[i];
        sourceText = (sourceText.replace(aMatched, '')).trim();
    }
    return (sourceText.split('\n').map(aLine => aLine.trim()).filter(aLine => !!aLine).length);
};