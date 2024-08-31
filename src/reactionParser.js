function parseReactions(input) {
    const lines = input.split('\n');
    return lines.filter(line => line.trim() !== '').map(line => {
        const [reactants, products] = line.split('=').map(side => 
            side.trim().split('+').map(item => {
                const match = item.trim().match(/^(\d*)(\w+)$/);
                return { coefficient: match[1] ? parseInt(match[1]) : 1, element: match[2] };
            })
        );
        return { reactants, products };
    });
}

export { parseReactions };