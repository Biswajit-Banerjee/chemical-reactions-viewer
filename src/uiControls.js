let isPlaying = false;
let playInterval;

function setupUIControls(updateGraph, toggleLabels, updateReactionsShown, getReactions) {
    document.getElementById('update-graph').addEventListener('click', updateGraph);
    document.getElementById('show-labels').addEventListener('change', toggleLabels);
    document.getElementById('dynamic-node-size').addEventListener('change', updateGraph);
    document.getElementById('layout-type').addEventListener('change', updateGraph);
    document.getElementById('reaction-seeker').addEventListener('input', () => {
        updateReactionsShown(getReactions());
    });
    document.getElementById('play-pause').addEventListener('click', () => playPauseAnimation(getReactions, updateReactionsShown));
    document.getElementById('step-forward').addEventListener('click', () => stepAnimation(getReactions, updateReactionsShown, 1));
    document.getElementById('step-backward').addEventListener('click', () => stepAnimation(getReactions, updateReactionsShown, -1));
    document.getElementById('reaction-seeker').addEventListener('input', () => {
        updateReactionsShown(getReactions());
        updatePlayPauseButton();
    });
}

function playPauseAnimation(getReactions, updateReactionsShown) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const replayIcon = document.getElementById('replay-icon');
    const seeker = document.getElementById('reaction-seeker');
    const allReactions = getReactions();

    if (isPlaying) {
        clearInterval(playInterval);
        showPlayButton();
        isPlaying = false;
    } else {
        if (parseInt(seeker.value) === allReactions.length) {
            // If at the end, start from the beginning
            seeker.value = 0;
        }
        hidePlayButton();
        pauseIcon.style.display = 'block';
        isPlaying = true;
        playAnimation(getReactions, updateReactionsShown);
    }
}

function playAnimation(getReactions, updateReactionsShown) {
    const seeker = document.getElementById('reaction-seeker');
    const allReactions = getReactions();
    
    playInterval = setInterval(() => {
        if (parseInt(seeker.value) < allReactions.length) {
            seeker.value = parseInt(seeker.value) + 1;
            updateReactionsShown(allReactions);
            updatePlayPauseButton();
        } else {
            clearInterval(playInterval);
            showPlayButton();
            isPlaying = false;
        }
    }, 1000);
}

function stepAnimation(getReactions, updateReactionsShown, step) {
    const seeker = document.getElementById('reaction-seeker');
    const allReactions = getReactions();
    
    let newValue = parseInt(seeker.value) + step;
    newValue = Math.max(0, Math.min(newValue, allReactions.length));
    
    seeker.value = newValue;
    updateReactionsShown(allReactions);
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    const seeker = document.getElementById('reaction-seeker');
    const allReactions = getReactions();
    
    if (parseInt(seeker.value) === allReactions.length) {
        showReplayButton();
    } else {
        showPlayButton();
    }
}

function showPlayButton() {
    document.getElementById('play-icon').style.display = 'block';
    document.getElementById('pause-icon').style.display = 'none';
    document.getElementById('replay-icon').style.display = 'none';
}

function showReplayButton() {
    document.getElementById('play-icon').style.display = 'none';
    document.getElementById('pause-icon').style.display = 'none';
    document.getElementById('replay-icon').style.display = 'block';
}

function hidePlayButton() {
    document.getElementById('play-icon').style.display = 'none';
    document.getElementById('replay-icon').style.display = 'none';
}

export { setupUIControls };