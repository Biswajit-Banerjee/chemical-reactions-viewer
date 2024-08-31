function parseReactions(input) {
    const lines = input.split('\n');
    return lines
        .filter(line => line.trim() !== '')
        .map(parseSingleReaction);
}

function parseSingleReaction(line) {
    const [reactants, products] = line.split('=').map(side => side.trim());
    
    if (!reactants || !products) {
        throw new Error(`Invalid reaction format: ${line}`);
    }

    return {
        reactants: parseSide(reactants),
        products: parseSide(products)
    };
}

function parseSide(side) {
    return side.split('+').map(parseItem);
}

function parseItem(item) {
    const match = item.trim().match(/^(\d*)(\w+)$/);
    
    if (!match) {
        throw new Error(`Invalid item format: ${item}`);
    }

    return {
        coefficient: match[1] ? parseInt(match[1], 10) : 1,
        element: match[2]
    };
}

export { parseReactions };