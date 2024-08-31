let isPlaying = false;
let playInterval;

function setupUIControls(updateGraph, toggleLabels, updateReactionsShown, getReactions) {
    document.getElementById('update-graph').addEventListener('click', updateGraph);
    document.getElementById('show-labels').addEventListener('change', toggleLabels);
    document.getElementById('dynamic-node-size').addEventListener('change', updateGraph);
    document.getElementById('reaction-seeker').addEventListener('input', () => {
        updateReactionsShown(getReactions());
    });
    document.getElementById('play-button').addEventListener('click', () => playAnimation(getReactions, updateReactionsShown));
}

function playAnimation(getReactions, updateReactionsShown) {
    if (isPlaying) {
        clearInterval(playInterval);
        document.getElementById('play-button').textContent = 'Play';
        isPlaying = false;
    } else {
        document.getElementById('play-button').textContent = 'Pause';
        isPlaying = true;
        let currentReaction = parseInt(document.getElementById('reaction-seeker').value);
        const allReactions = getReactions();
        playInterval = setInterval(() => {
            if (currentReaction < allReactions.length) {
                currentReaction++;
                document.getElementById('reaction-seeker').value = currentReaction;
                updateReactionsShown(allReactions);
            } else {
                clearInterval(playInterval);
                document.getElementById('play-button').textContent = 'Play';
                isPlaying = false;
            }
        }, 1000); 
    }
}

export { setupUIControls };