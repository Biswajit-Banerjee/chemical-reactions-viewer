function parseReactions(input) {
    const lines = input.split('\n');
    return lines
        .filter(line => line.trim() !== '')
        .map(parseSingleReaction);
}

function parseSingleReaction(line) {
    const [reactants, products] = line.split(/<?=>?/).map(side => side.trim());
    
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
    item = item.trim();
    const match = item.match(/^(\d*\.?\d*)\s*(.+)$/);
    
    if (!match) {
        throw new Error(`Invalid item format: ${item}`);
    }

    const coefficient = match[1] ? parseFloat(match[1]) : 1;
    const element = match[2].trim();

    return {
        coefficient,
        element
    };
}

export { parseReactions };