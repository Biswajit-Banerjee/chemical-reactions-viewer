import { initScene, onWindowResize, animate } from './sceneSetup.js';
import { createGraph, toggleLabels, updateReactionsShown } from './graphCreation.js';
import { parseReactions } from './reactionParser.js';
import { setupUIControls } from './uiControls.js';

let allReactions = [];

function updateGraph() {
    const input = document.getElementById('reactions-input').value;
    allReactions = parseReactions(input);
    document.getElementById('reaction-seeker').max = allReactions.length;
    document.getElementById('reaction-seeker').value = allReactions.length;
    updateReactionsShown(allReactions);
}

// Initialize the scene and start animation
initScene();
animate();

// Setup UI controls
setupUIControls(updateGraph, toggleLabels, updateReactionsShown, () => allReactions);

// Initial graph
const initialReactions = [
    'a + b = 2c',
    '2d + e = b',
    '3d + 5f = a'
];
document.getElementById('reactions-input').value = initialReactions.join('\n');
updateGraph();