import { initScene, animate, addWatercolorEffect } from './sceneSetup.js';
import { createGraph, toggleLabels, updateReactionsShown } from './graphCreation.js';
import { parseReactions } from './reactionParser.js';
import { setupUIControls } from './uiControls.js';

let allReactions = [];

function updateGraph() {
    const input = document.getElementById('reactions-input').value;
    allReactions = parseReactions(input);
    const reactionSeeker = document.getElementById('reaction-seeker');
    reactionSeeker.max = allReactions.length;
    reactionSeeker.value = allReactions.length;
    updateReactionsShown(allReactions);
}


function init() {
    initScene();
    animate();

    setupUIControls(updateGraph, toggleLabels, updateReactionsShown, () => allReactions);
    addWatercolorEffect();

    const initialReactions = [
        'a + b = 2c',
        '2d + e = b',
        '3d + 5f = a'
    ];
    document.getElementById('reactions-input').value = initialReactions.join('\n');
    updateGraph();
}

init();