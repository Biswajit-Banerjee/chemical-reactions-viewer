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
        'C00141 + C00001 <=> C04272',
        'C00183 + C00026 <=> C00141 + C00025',
        'C04272 + C00006 <=> C04181 + C00005 + C00080',
        'C06007 + C00006 <=> C14463 + C00005 + C00080',
        'C00671 + C00001 <=> C06007',
        'C00407 + C00026 <=> C00671 + C00025'
    ];
    document.getElementById('reactions-input').value = initialReactions.join('\n');
    updateGraph();
}

init();